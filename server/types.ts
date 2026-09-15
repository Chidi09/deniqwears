// Domain shapes returned by the repository layer (server/db.ts).
// These mirror the Prisma models but present a friendlier, nested shape
// (e.g. Order.customer, StoreSettings.deliveryZones) so route handlers and
// the payment layer don't need to know about the relational storage shape.

export type ProductStatus = 'live' | 'draft' | 'archived';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductVariant {
  id: string;
  color: string;
  size: string;
  sku?: string | null;
  priceInKobo?: number | null;
  stock: number;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  priceInKobo: number;
  status: ProductStatus;
  category: string;
  collection?: string | null;
  colors: ProductColor[];
  sizes: string[];
  variants: ProductVariant[];
  primaryImage: string;
  secondaryImage: string;
  galleryImages: string[];
  badge?: 'NEW' | 'EXCLUSIVE' | 'LIMITED' | null;
  rating: number;
  reviewsCount: number;
  stockWarning?: string | null;
  description: string;
  fitAndSize: string;
  delivery: string;
  care: string;
  editorialSubtitle?: string | null;
  isNewArrival?: boolean;
  isSignatureSelection?: boolean;
  isAsymmetricFeature?: boolean;
  asymmetricRole?: 'large' | 'detail' | null;
  createdAt: string;
  updatedAt: string;
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

export type PaymentMethod = 'paystack' | 'flutterwave' | 'stripe' | 'showroom';

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
  deliveryZoneId: string | null;
  deliveryFeeInKobo: number;
  subtotalInKobo: number;
  discountInKobo: number;
  /** The promo code redeemed on this order, if any. */
  discountCodeId?: string | null;
  totalInKobo: number;
  refundedInKobo: number;
  currency: 'NGN' | 'USD';
  paymentMethod: PaymentMethod;
  paymentReference?: string | null;
  paymentId?: string | null;
  paidAt?: string | null;
  dispatchedAt?: string | null;
  notes?: string | null;
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
  currency: 'NGN';
  freeDeliveryThresholdInKobo: number;
  returnPeriodDays: number;
  deliveryZones: DeliveryZone[];
  paymentProviders: {
    paystack: boolean;
    flutterwave: boolean;
    stripe: boolean;
    showroomCollection: boolean;
  };
}

export interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minSpendInKobo?: number | null;
  active: boolean;
  usageCount: number;
}

export interface AdminActivityLog {
  id: string;
  timestamp: string;
  adminEmail: string;
  action: string;
  entityType: 'product' | 'order' | 'settings' | 'inventory';
  entityId?: string | null;
  details: string;
}

/** Order statuses where money was actually collected at some point. */
export const COLLECTED_STATUSES = [
  'PAID',
  'FULFILLED',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
] as const satisfies readonly OrderStatus[];

export interface FinanceSummary {
  grossSalesInKobo: number;
  refundedInKobo: number;
  netRevenueInKobo: number;
  merchandiseInKobo: number;
  deliveryFeesInKobo: number;
  discountsGivenInKobo: number;
  paidOrdersCount: number;
  averageOrderValueInKobo: number;
  /** Orders placed but not yet paid — money expected, not banked. */
  pendingCollectionInKobo: number;
  pendingCollectionCount: number;
  awaitingDispatchCount: number;
  failedOrCancelledCount: number;
}

export interface RevenuePoint {
  date: string;
  netRevenueInKobo: number;
}

export interface PaymentMethodTotal {
  method: PaymentMethod;
  netInKobo: number;
  ordersCount: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  unitsSold: number;
  revenueInKobo: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN';
}
