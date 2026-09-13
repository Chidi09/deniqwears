import { z } from 'zod';

export const OrderItemInputSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().min(1, 'Variant ID is required'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

export const CustomerInputSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().email('Valid email address is required'),
  phone: z.string().trim().min(5, 'Valid phone number is required'),
});

export const ShippingAddressInputSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().email('Valid email address is required'),
  phone: z.string().trim().min(5, 'Phone number is required'),
  address: z.string().trim().min(3, 'Street delivery address is required'),
  apartment: z.string().trim().optional(),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  country: z.string().trim().default('Nigeria'),
  postalCode: z.string().trim().optional(),
});

export const CheckoutPayloadSchema = z.object({
  items: z.array(OrderItemInputSchema).min(1, 'Your shopping bag is empty'),
  customer: CustomerInputSchema,
  shippingAddress: ShippingAddressInputSchema,
  deliveryZoneId: z.string().min(1, 'Delivery zone is required'),
  discountCode: z.string().trim().optional(),
  paymentMethod: z
    .enum(['paystack', 'flutterwave', 'stripe', 'showroom'])
    .default('paystack'),
  idempotencyKey: z.string().optional(),
});

export const DiscountValidateSchema = z.object({
  code: z.string().trim().min(1, 'Promotional code is required'),
  subtotalInKobo: z.number().nonnegative('Subtotal must be positive'),
});

export const PaymentVerifySchema = z.object({
  reference: z.string().trim().min(1, 'Transaction reference is required'),
  orderId: z.string().trim().min(1, 'Order ID is required'),
});

export const AdminLoginSchema = z.object({
  email: z.string().trim().email('Valid email required'),
  password: z.string().min(1, 'Password is required'),
});

export const ProductVariantSchema = z.object({
  id: z.string().optional(),
  color: z.string().min(1),
  size: z.enum(['XS', 'S', 'M', 'L', 'XL']),
  sku: z.string().optional(),
  priceInKobo: z.number().int().positive().optional(),
  stock: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const ProductColorSchema = z.object({
  name: z.string().min(1),
  hex: z.string().min(1),
});

export const ProductCreateUpdateSchema = z.object({
  name: z.string().trim().min(2, 'Garment name is required'),
  slug: z.string().trim().optional(),
  priceInKobo: z.number().int().positive('Price in kobo must be positive'),
  category: z.enum(['dresses', 'sets', 'tops', 'bottoms', 'occasion']),
  collection: z.string().optional(),
  status: z.enum(['live', 'draft', 'archived']).default('live'),
  colors: z.array(ProductColorSchema).default([]),
  sizes: z.array(z.enum(['XS', 'S', 'M', 'L', 'XL'])).default([]),
  variants: z.array(ProductVariantSchema).default([]),
  primaryImage: z.string().url('Primary image must be a valid URL'),
  secondaryImage: z.string().url('Secondary image must be a valid URL').optional(),
  galleryImages: z.array(z.string().url()).default([]),
  badge: z.enum(['NEW', 'EXCLUSIVE', 'LIMITED']).optional(),
  stockWarning: z.string().optional(),
  description: z.string().default(''),
  fitAndSize: z.string().default(''),
  delivery: z.string().default(''),
  care: z.string().default(''),
  editorialSubtitle: z.string().optional(),
  isNewArrival: z.boolean().default(false),
  isSignatureSelection: z.boolean().default(false),
  isAsymmetricFeature: z.boolean().default(false),
  asymmetricRole: z.enum(['large', 'detail']).optional(),
});

export const QuickEditItemSchema = z.object({
  productId: z.string().min(1),
  priceInKobo: z.number().int().positive().optional(),
  totalStock: z.number().int().min(0).optional(),
  status: z.enum(['live', 'draft', 'archived']).optional(),
});

export const QuickEditPayloadSchema = z.object({
  items: z.array(QuickEditItemSchema).min(1, 'No items provided for quick edit'),
});

export const OrderStatusUpdateSchema = z.object({
  status: z.enum([
    'DRAFT',
    'PENDING_PAYMENT',
    'PAYMENT_PROCESSING',
    'PAID',
    'PAYMENT_FAILED',
    'CANCELLED',
    'FULFILLED',
    'REFUNDED',
    'PARTIALLY_REFUNDED',
  ]),
  reason: z.string().optional(),
});

export const StoreSettingsUpdateSchema = z.object({
  storeName: z.string().min(1).optional(),
  supportEmail: z.string().email().optional(),
  supportWhatsApp: z.string().optional(),
  currency: z.literal('NGN').optional(),
  freeDeliveryThresholdInKobo: z.number().int().positive().optional(),
  returnPeriodDays: z.number().int().positive().optional(),
  deliveryZones: z.array(z.any()).optional(),
  paymentProviders: z
    .object({
      paystack: z.boolean().optional(),
      flutterwave: z.boolean().optional(),
      stripe: z.boolean().optional(),
      showroomCollection: z.boolean().optional(),
    })
    .optional(),
});
