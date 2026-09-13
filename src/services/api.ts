import { Product, StoreSettings, Order } from '../types';

const ADMIN_TOKEN_KEY = 'deniq_admin_token';

export const api = {
  // --- STOREFRONT ENDPOINTS ---
  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to load products');
      const data = await res.json();
      return data.products;
    } catch (e) {
      console.warn('API getProducts fallback:', e);
      return [];
    }
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const res = await fetch(`/api/products/${slug}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.product;
    } catch (e) {
      return null;
    }
  },

  async getSettings(): Promise<StoreSettings | null> {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to load store settings');
      const data = await res.json();
      return data.settings;
    } catch (e) {
      console.warn('API getSettings fallback:', e);
      return null;
    }
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
  }): Promise<{ order: Order; paymentSession: any }> {
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

  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.order;
    } catch {
      return null;
    }
  },

  // --- ADMIN ENDPOINTS ---
  getAdminToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  },

  setAdminToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    }
  },

  clearAdminToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  },

  async adminLogin(email: string, password: string) {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    if (data.token) {
      this.setAdminToken(data.token);
    }
    return data;
  },

  async adminFetch(endpoint: string, options: RequestInit = {}) {
    const token = this.getAdminToken();
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token || ''}`,
      ...(options.headers || {}),
    };

    const res = await fetch(endpoint, { ...options, headers });
    if (res.status === 401) {
      this.clearAdminToken();
      throw new Error('Admin session expired. Please sign in again.');
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },

  async getAdminOverview() {
    return this.adminFetch('/api/admin/overview');
  },

  async getAdminProducts(): Promise<Product[]> {
    const data = await this.adminFetch('/api/admin/products');
    return data.products;
  },

  async createAdminProduct(productData: any): Promise<Product> {
    const data = await this.adminFetch('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    return data.product;
  },

  async updateAdminProduct(id: string, productData: any): Promise<Product> {
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

  async quickEditProducts(items: Array<{ productId: string; priceInKobo?: number; totalStock?: number; status?: any }>) {
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
