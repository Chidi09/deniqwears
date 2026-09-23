import type { StorePromotions } from './lib/promotions';

export type Category = 'all' | 'dresses' | 'sets' | 'tops' | 'bottoms' | 'occasion';

export type ProductStatus = 'live' | 'draft' | 'archived';

/**
 * UK dress sizing — the range Deniqwears cuts. Single source of truth: the
 * variant type, Zod validation, shop filters, admin form and size guide all
 * derive from this list, so adding a size means editing one line.
 */
export const GARMENT_SIZES = ['10', '12', '14', '16', '18', '20'] as const;

export type GarmentSize = (typeof GARMENT_SIZES)[number];

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductVariant {
  id: string;
  color: string;
  size: GarmentSize;
  sku?: string;
  priceInKobo?: number;
  stock: number;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  /**
   * The one price field. Always kobo, the smallest currency unit
   * (₦48,000 = 4_800_000). There is deliberately no naira `price` companion:
   * two units for one concept is what let display code read an absent field
   * and render NaN, and what made a "guess the unit by magnitude" formatter
   * seem necessary.
   */
  priceInKobo: number;
  status?: ProductStatus;
  category: 'dresses' | 'sets' | 'tops' | 'bottoms' | 'occasion';
  collection?: string;
  colors: ProductColor[];
  sizes: GarmentSize[];
  variants?: ProductVariant[];
  primaryImage: string;
  secondaryImage: string;
  galleryImages: string[];
  badge?: 'NEW' | 'EXCLUSIVE' | 'LIMITED';
  rating: number;
  reviewsCount: number;
  stockWarning?: string;
  description: string;
  fitAndSize: string;
  delivery: string;
  care: string;
  editorialSubtitle?: string;
  isNewArrival?: boolean;
  isSignatureSelection?: boolean;
  isAsymmetricFeature?: boolean;
  asymmetricRole?: 'large' | 'detail';
}

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  /** Display cache only — the server always recalculates at checkout. */
  priceInKobo: number;
  image: string;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
}

export type OrderStatus =
  | 'DRAFT'
  | 'PENDING_PAYMENT'
  | 'PAYMENT_PROCESSING'
  | 'PAID'
  | 'PAYMENT_FAILED'
  | 'CANCELLED'
  | 'FULFILLED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  color: string;
  size: string;
  image: string;
  unitPriceInKobo: number;
  quantity: number;
  totalPriceInKobo: number;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
}

export interface OrderTimelineEvent {
  id: string;
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  idempotencyKey: string;
  status: OrderStatus;
  items: OrderItem[];
  customer: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  shippingAddress: ShippingAddress;
  deliveryZoneId: string;
  deliveryFeeInKobo: number;
  subtotalInKobo: number;
  discountInKobo: number;
  totalInKobo: number;
  /** Cumulative amount refunded against this order (kobo). */
  refundedInKobo: number;
  currency: 'NGN' | 'USD';
  paymentMethod: 'paystack' | 'flutterwave' | 'stripe' | 'showroom';
  paymentReference?: string;
  paymentId?: string;
  paidAt?: string;
  dispatchedAt?: string;
  notes?: string;
  timeline: OrderTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  feeInKobo: number;
  estimatedDelivery: string;
  description: string;
  active: boolean;
}

export interface StoreSettings {
  storeName: string;
  supportEmail: string;
  supportWhatsApp: string;
  currency: 'USD';
  freeDeliveryThresholdInKobo: number;
  returnPeriodDays: number;
  deliveryZones: DeliveryZone[];
  paymentProviders: {
    paystack: boolean;
    flutterwave: boolean;
    stripe: boolean;
    showroomCollection: boolean;
  };
  promotions: StorePromotions;
}

export interface AdminActivityLog {
  id: string;
  timestamp: string;
  adminEmail: string;
  action: string;
  entityType: 'product' | 'order' | 'settings' | 'inventory';
  entityId?: string;
  details: string;
}

export interface PaymentSession {
  provider: string;
  reference: string;
  checkoutUrl?: string;
  authorizationUrl?: string;
  accessCode?: string;
  clientSecret?: string;
  amountInKobo: number;
  currency: string;
  expiresAt: string;
}

// Payload shape the admin product form builds — everything but the
// server-assigned id/timestamps, all optional since create vs. update send
// different subsets.
export type ProductInput = Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>;

export interface QuickEditItem {
  productId: string;
  priceInKobo?: number;
  totalStock?: number;
  status?: ProductStatus;
}

export interface FilterState {
  category: Category;
  sizes: string[];
  colors: string[];
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'newest';
}

export type ActivePage =
  | { type: 'home' }
  | { type: 'shop'; category?: Category; newOnly?: boolean }
  | { type: 'product'; slug: string }
  | { type: 'about' }
  | { type: 'checkout' }
  | { type: 'order-confirmed'; orderNumber: string }
  | { type: 'admin'; section?: 'overview' | 'products' | 'orders' | 'promotions' | 'settings' | 'logs' }
  | { type: 'account'; tab?: 'orders' | 'addresses' | 'wishlist' };
