import { z } from 'zod';
import { GARMENT_SIZES } from '../types';
import { PromotionsSchema } from './promotions';

// Bounded on purpose: unbounded arrays/strings let an anonymous caller drive
// arbitrary database work and gateway calls from a single request.
const MAX_ITEMS_PER_ORDER = 50;
const MAX_QUANTITY_PER_LINE = 20;

export const OrderItemInputSchema = z.object({
  productId: z.string().min(1, 'Product ID is required').max(64),
  variantId: z.string().min(1, 'Variant ID is required').max(64),
  quantity: z
    .number()
    .int()
    .positive('Quantity must be at least 1')
    .max(MAX_QUANTITY_PER_LINE, `Maximum ${MAX_QUANTITY_PER_LINE} of a single size per order`),
});

export const CustomerInputSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(80),
  lastName: z.string().trim().min(1, 'Last name is required').max(80),
  email: z.string().trim().email('Valid email address is required'),
  phone: z.string().trim().min(5, 'Valid phone number is required').max(32),
});

export const ShippingAddressInputSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(80),
  lastName: z.string().trim().min(1, 'Last name is required').max(80),
  email: z.string().trim().email('Valid email address is required'),
  phone: z.string().trim().min(5, 'Phone number is required').max(32),
  address: z.string().trim().min(3, 'Street delivery address is required').max(200),
  apartment: z.string().trim().max(100).optional(),
  city: z.string().trim().min(1, 'City is required').max(80),
  state: z.string().trim().min(1, 'State is required').max(80),
  country: z.string().trim().default('United States'),
  postalCode: z.string().trim().optional(),
});

export const CheckoutPayloadSchema = z.object({
  items: z
    .array(OrderItemInputSchema)
    .min(1, 'Your shopping bag is empty')
    .max(MAX_ITEMS_PER_ORDER, 'Too many items in one order. Please split it or contact us'),
  customer: CustomerInputSchema,
  shippingAddress: ShippingAddressInputSchema,
  deliveryZoneId: z.string().min(1, 'Delivery zone is required'),
  discountCode: z.string().trim().max(40).optional(),
  paymentMethod: z
    .enum(['paystack', 'flutterwave', 'stripe', 'showroom'])
    .default('stripe'),
  idempotencyKey: z.string().max(100).optional(),
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
  size: z.enum(GARMENT_SIZES),
  sku: z.string().optional(),
  priceInKobo: z.number().int().positive().optional(),
  stock: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const ProductColorSchema = z.object({
  name: z.string().min(1),
  hex: z.string().min(1),
});

export const ProductCreateUpdateBaseSchema = z.object({
  name: z.string().trim().min(2, 'Garment name is required'),
  slug: z.string().trim().optional(),
  priceInKobo: z.number().int().positive('Price in kobo must be positive'),
  category: z.enum(['dresses', 'sets', 'tops', 'bottoms', 'occasion']),
  collection: z.string().optional(),
  status: z.enum(['live', 'draft', 'archived']).default('live'),
  colors: z.array(ProductColorSchema).default([]),
  sizes: z.array(z.enum(GARMENT_SIZES)).default([]),
  variants: z.array(ProductVariantSchema).default([]),
  primaryImage: z.string().url('Primary image must be a valid URL'),
  // Prisma requires this column, so default it to the primary image rather
  // than letting a validated payload fail at insert time.
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

export const ProductCreateUpdateSchema = ProductCreateUpdateBaseSchema
  .superRefine((product, ctx) => {
    // Domain invariants the database and storefront actually require. Without
    // these, a "valid" payload could 500 on insert (secondaryImage is NOT NULL
    // in Prisma) or publish a product with no buyable variant, which then
    // crashed components that assume a colour/size exists.
    if (product.status === 'live') {
      if (product.colors.length === 0) {
        ctx.addIssue({ code: 'custom', path: ['colors'], message: 'A live garment needs at least one colour' });
      }
      if (product.sizes.length === 0) {
        ctx.addIssue({ code: 'custom', path: ['sizes'], message: 'A live garment needs at least one size' });
      }
      if (!product.variants.some((v) => v.active)) {
        ctx.addIssue({
          code: 'custom',
          path: ['variants'],
          message: 'A live garment needs at least one active variant customers can buy',
        });
      }
    }

    // Every variant must correspond to declared metadata, and be unique.
    const seen = new Set<string>();
    for (const variant of product.variants) {
      const key = `${variant.color.toLowerCase()}::${variant.size}`;
      if (seen.has(key)) {
        ctx.addIssue({
          code: 'custom',
          path: ['variants'],
          message: `Duplicate variant for ${variant.color} / size ${variant.size}`,
        });
      }
      seen.add(key);

      if (product.colors.length > 0 && !product.colors.some((c) => c.name.toLowerCase() === variant.color.toLowerCase())) {
        ctx.addIssue({
          code: 'custom',
          path: ['variants'],
          message: `Variant colour "${variant.color}" is not in this garment's colour list`,
        });
      }
      if (product.sizes.length > 0 && !product.sizes.includes(variant.size)) {
        ctx.addIssue({
          code: 'custom',
          path: ['variants'],
          message: `Variant size ${variant.size} is not in this garment's size list`,
        });
      }
    }
  });

/**
 * Partial update. The PUT route previously passed raw JSON straight to the
 * database, so negative prices/stock, invalid sizes and malformed colour data
 * could all be persisted.
 */
export const ProductUpdateSchema = ProductCreateUpdateBaseSchema.partial();

export const QuickEditItemSchema = z.object({
  productId: z.string().min(1),
  priceInKobo: z.number().int().positive().optional(),
  totalStock: z.number().int().min(0).optional(),
  status: z.enum(['live', 'draft', 'archived']).optional(),
});

export const QuickEditPayloadSchema = z.object({
  items: z.array(QuickEditItemSchema).min(1, 'No items provided for quick edit'),
});

export const OrderRefundSchema = z.object({
  amountInKobo: z.number().int().positive().optional(),
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
  currency: z.literal('USD').optional(),
  freeDeliveryThresholdInKobo: z.number().int().positive().optional(),
  returnPeriodDays: z.number().int().positive().optional(),
  deliveryZones: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().trim().min(1),
        feeInKobo: z.number().int().min(0),
        estimatedDelivery: z.string().trim().min(1),
        description: z.string().trim(),
        active: z.boolean(),
      })
    )
    .optional(),
  paymentProviders: z
    .object({
      paystack: z.boolean().optional(),
      flutterwave: z.boolean().optional(),
      stripe: z.boolean().optional(),
      showroomCollection: z.boolean().optional(),
    })
    .optional(),
  promotions: PromotionsSchema.optional(),
});
