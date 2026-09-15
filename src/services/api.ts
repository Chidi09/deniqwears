import { Product, StoreSettings, Order, PaymentSession, ProductInput, QuickEditItem } from '../types';

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
