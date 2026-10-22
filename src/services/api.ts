import { Product, StoreSettings, Order, PaymentSession, ProductInput, QuickEditItem } from '../types';
import type { VerifiedAddress, VerifyAddressRequest, VerifyAddressResult } from '../lib/address';
import type { AddressSuggestion } from '../lib/address';

// Phone photos are often 5-15 MB, over the host's 4.5 MB request limit. Shrink them in the
// browser first; if the browser can't decode the file, send it as is and let the server judge.
const MAX_PHOTO_EDGE = 1600;
async function shrinkPhoto(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, MAX_PHOTO_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88));
    if (!blob || (blob.size >= file.size && file.size < 3_000_000)) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

export const api = {
  // --- STOREFRONT ENDPOINTS ---
  // These deliberately throw rather than returning [] / null on failure:
  // swallowing the error made an outage indistinguishable from an empty
  // catalog, so the UI could never show a retry state.
  async getProducts(): Promise<Product[]> {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error('Could not load the collection');
    const data = await res.json();
    return data.products;
  },

  /** Returns null only for a genuine 404; other failures throw. */
  async getProductBySlug(slug: string): Promise<Product | null> {
    const res = await fetch(`/api/products/${slug}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Could not load this garment');
    const data = await res.json();
    return data.product;
  },

  async getSettings(): Promise<StoreSettings> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Could not load store settings');
    const data = await res.json();
    return data.settings;
  },

  async validateDiscount(code: string, subtotalInKobo: number) {
    const res = await fetch('/api/discounts/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotalInKobo }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid discount');
    return data;
  },

  /** Autocomplete never throws: on any failure the form simply has no suggestions. */
  async suggestAddresses(
    input: string,
    sessionToken: string,
    signal?: AbortSignal
  ): Promise<{ enabled: boolean; suggestions: AddressSuggestion[] }> {
    try {
      const res = await fetch('/api/address/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'suggest', input, sessionToken }),
        signal,
      });
      if (!res.ok) return { enabled: true, suggestions: [] };
      return await res.json();
    } catch {
      return { enabled: true, suggestions: [] };
    }
  },

  async pickSuggestedAddress(placeId: string, sessionToken: string): Promise<VerifiedAddress | null> {
    try {
      const res = await fetch('/api/address/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'place', placeId, sessionToken }),
      });
      if (!res.ok) return null;
      return (await res.json()).address ?? null;
    } catch {
      return null;
    }
  },

  /** Never throws: if the check can't run, the customer just continues. */
  async verifyAddress(address: VerifyAddressRequest): Promise<VerifyAddressResult> {
    try {
      const res = await fetch('/api/address/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address),
      });
      if (!res.ok) return { status: 'unverified' };
      return (await res.json()) as VerifyAddressResult;
    } catch {
      return { status: 'unverified' };
    }
  },

  async initiateCheckout(payload: {
    items: Array<{ productId: string; variantId: string; quantity: number }>;
    customer: { firstName: string; lastName: string; email: string; phone: string };
    shippingAddress: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address: string;
      apartment?: string;
      city: string;
      state: string;
      country: string;
    };
    deliveryZoneId: string;
    discountCode?: string;
    paymentMethod: string;
    idempotencyKey?: string;
  }): Promise<{ order: Order; paymentSession: PaymentSession }> {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Checkout submission failed');
    return data;
  },

  async verifyPayment(reference: string, orderId: string): Promise<{ success: boolean; order: Order; message: string }> {
    const res = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference, orderId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Payment verification failed');
    return data;
  },

  /** Admin-only: /api/orders/:id requires an admin session (see that route). */
  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const data = await this.adminFetch(`/api/orders/${orderId}`);
      return data.order;
    } catch {
      return null;
    }
  },

  // --- ADMIN ENDPOINTS ---
  // Admin auth is a signed, httpOnly session cookie set by the server on
  // login — it is never readable or stored from client JS, which is what
  // keeps a stolen XSS payload from being able to exfiltrate the session.
  async adminLogin(email: string, password: string) {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async adminLogout() {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' });
  },

  async getAdminSession(): Promise<{ authenticated: boolean; admin?: { email: string } }> {
    const res = await fetch('/api/admin/session', { credentials: 'same-origin' });
    if (!res.ok) return { authenticated: false };
    return res.json();
  },

  async adminFetch(endpoint: string, options: RequestInit = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    const res = await fetch(endpoint, { ...options, headers, credentials: 'same-origin' });
    if (res.status === 401) {
      throw new Error('Admin session expired. Please sign in again.');
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },

  async getAdminAnalytics(period: string) {
    return this.adminFetch(`/api/admin/analytics?period=${encodeURIComponent(period)}`);
  },

  async getAdminOverview() {
    return this.adminFetch('/api/admin/overview');
  },

  async getAdminProducts(): Promise<Product[]> {
    const data = await this.adminFetch('/api/admin/products');
    return data.products;
  },

  /** Uploads one photo; returns the address the website serves it from. */
  async uploadAdminPhoto(file: File): Promise<string> {
    const body = new FormData();
    const small = await shrinkPhoto(file);
    body.append('file', small, small.name);
    const res = await fetch('/api/admin/upload', { method: 'POST', body, credentials: 'same-origin' });
    if (res.status === 401) throw new Error('Admin session expired. Please sign in again.');
    if (res.status === 413) throw new Error('That photo is too large. Please choose a smaller one.');
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Photo upload failed. Please try again.');
    return data.url;
  },

  async createAdminProduct(productData: ProductInput): Promise<Product> {
    const data = await this.adminFetch('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    return data.product;
  },

  async updateAdminProduct(id: string, productData: ProductInput): Promise<Product> {
    const data = await this.adminFetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
    return data.product;
  },

  async archiveAdminProduct(id: string): Promise<Product> {
    const data = await this.adminFetch(`/api/admin/products/${id}/archive`, {
      method: 'POST',
    });
    return data.product;
  },

  async quickEditProducts(items: QuickEditItem[]) {
    return this.adminFetch('/api/admin/products/quick-edit', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  },

  async getAdminOrders(): Promise<Order[]> {
    const data = await this.adminFetch('/api/admin/orders');
    return data.orders;
  },

  async updateOrderStatus(orderId: string, status: string, reason?: string): Promise<Order> {
    const data = await this.adminFetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    });
    return data.order;
  },

  async recordShowroomPayment(orderId: string, note?: string): Promise<Order> {
    const data = await this.adminFetch(`/api/admin/orders/${orderId}/record-payment`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
    return data.order;
  },

  async refundOrder(orderId: string, amountInKobo?: number): Promise<{ order: Order; refundId: string }> {
    return this.adminFetch(`/api/admin/orders/${orderId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ amountInKobo }),
    });
  },

  async getAdminSettings(): Promise<StoreSettings> {
    const data = await this.adminFetch('/api/admin/settings');
    return data.settings;
  },

  async updateAdminSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    const data = await this.adminFetch('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    return data.settings;
  },

  async getAdminAuditLogs() {
    const data = await this.adminFetch('/api/admin/audit-logs');
    return data.logs;
  },
};
