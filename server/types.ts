export type Category = 'all' | 'dresses' | 'sets' | 'tops' | 'bottoms' | 'occasion';

export type ProductStatus = 'live' | 'draft' | 'archived';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductVariant {
  id: string;
  color: string;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL';
  sku?: string;
  priceInKobo?: number; // Optional variant price override in kobo
  stock: number;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  priceInKobo: number; // Stored in smallest currency unit (1 NGN = 100 kobo)
  status: ProductStatus;
  category: 'dresses' | 'sets' | 'tops' | 'bottoms' | 'occasion';
  collection?: string;
  colors: ProductColor[];
  sizes: Array<'XS' | 'S' | 'M' | 'L' | 'XL'>;
  variants: ProductVariant[];
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
  unitPriceInKobo: number; // Server-locked price in kobo
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
  orderNumber: string; // e.g. DNQ-18421
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
  totalInKobo: number; // Final immutable total
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
  value: number; // percentage (e.g. 10 for 10%) or fixed kobo
  minSpendInKobo?: number;
  active: boolean;
  usageCount: number;
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
