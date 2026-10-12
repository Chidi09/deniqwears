import { z } from 'zod';
import { GARMENT_SIZES } from '../types';
import { PromotionsSchema, StorePromotions } from './promotions';
import {
  US_STATE_CODES,
  ZIP_PATTERN,
  formatPhone,
  isValidEmail,
  isValidUsPhone,
  validateAddress,
  validateContact,
} from './address';
import { HEX_COLOR, ID, SKU, SLUG, safeUrl, sanitizePlainText, text } from '../../server/sanitize';

/**
 * Every request body the server accepts is described here. Rules shared by all
 * of them:
 *  - strings have a maximum length, and free text is stripped of HTML/script
 *    (see server/sanitize.ts) before it is checked and stored;
 *  - identifiers, slugs, SKUs, codes and colours must match a strict pattern;
 *  - URLs must be https/http or a path on this site, never javascript:/data:;
 *  - lists and numbers have upper bounds;
 *  - unknown fields are dropped, so a caller can only set fields named here.
 */

const MAX_ITEMS_PER_ORDER = 50;
const MAX_QUANTITY_PER_LINE = 20;
const MAX_CENTS = 10_000_000; // $100,000 per price, a sanity ceiling

const id = (label = 'ID') => z.string().trim().regex(ID, `${label} is not valid`);
const cents = (label: string) => z.number().int().positive(`${label} must be more than zero`).max(MAX_CENTS, `${label} is too large`);
const email = z
  .string()
  .trim()
  .max(254, 'Email address is too long')
  .refine(isValidEmail, 'Valid email address is required')
  .transform((value) => value.toLowerCase()) as unknown as z.ZodType<string, string>;

export const OrderItemInputSchema = z.object({
  productId: id('Product ID'),
  // Variant ids come from the database, but may be a composed fallback for
  // products without variants, so allow spaces while still blocking markup/quotes.
  variantId: z.string().trim().regex(/^[A-Za-z0-9 _.-]{1,120}$/, 'Variant ID is not valid'),
  quantity: z
    .number()
    .int()
    .positive('Quantity must be at least 1')
    .max(MAX_QUANTITY_PER_LINE, `Maximum ${MAX_QUANTITY_PER_LINE} of a single size per order`),
});

// Same rules the checkout form shows inline (src/lib/address.ts), enforced here
// so a request that skips the form can't place an order with a bad address.
const nameField = (label: string, field: 'firstName' | 'lastName') =>
  text(80, { min: 1, label }).superRefine((value, ctx) => {
    const message = validateContact({ firstName: 'x', lastName: 'x', email: 'a@b.co', phone: '2125550100', [field]: value })[field];
    if (message) ctx.addIssue({ code: 'custom', message });
  });

const phone = z
  .string()
  .trim()
  .max(32)
  .refine(isValidUsPhone, 'Enter a valid 10-digit US phone number')
  .transform(formatPhone) as unknown as z.ZodType<string, string>;

export const CustomerInputSchema = z.object({
  firstName: nameField('First name', 'firstName'),
  lastName: nameField('Last name', 'lastName'),
  email,
  phone,
});

export const ShippingAddressInputSchema = z
  .object({
    firstName: nameField('First name', 'firstName'),
    lastName: nameField('Last name', 'lastName'),
    email,
    phone,
    address: text(200, { min: 1, label: 'Street address' }),
    apartment: text(40, { label: 'Apartment' })
      .refine((v) => /^[\p{L}\p{N} #.,/'-]*$/u.test(v), 'Apartment can only contain letters, numbers and # . , / -')
      .optional(),
    city: text(80, { min: 1, label: 'City' }),
    state: z.string().trim().refine((s) => US_STATE_CODES.has(s), 'Choose a valid US state'),
    country: z.literal('United States').default('United States'),
    postalCode: z.string().trim().regex(ZIP_PATTERN, 'Enter a valid 5-digit ZIP code'),
  })
  .superRefine((value, ctx) => {
    const errors = validateAddress({
      address: value.address,
      city: value.city,
      state: value.state,
      postalCode: value.postalCode,
    });
    for (const [field, message] of Object.entries(errors)) {
      ctx.addIssue({ code: 'custom', path: [field], message: message as string });
    }
  });

export const CheckoutPayloadSchema = z.object({
  items: z
    .array(OrderItemInputSchema)
    .min(1, 'Your shopping bag is empty')
    .max(MAX_ITEMS_PER_ORDER, 'Too many items in one order. Please split it or contact us'),
  customer: CustomerInputSchema,
  shippingAddress: ShippingAddressInputSchema,
  deliveryZoneId: id('Delivery option'),
  discountCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_-]{1,40}$/, 'That promotional code is not valid')
    .optional(),
  paymentMethod: z.enum(['paystack', 'flutterwave', 'stripe', 'showroom']).default('stripe'),
  idempotencyKey: z.string().trim().regex(/^[A-Za-z0-9_.-]{8,100}$/).optional(),
});

export const DiscountValidateSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_-]{1,40}$/, 'That promotional code is not valid'),
  subtotalInKobo: z.number().int().nonnegative('Subtotal must be positive').max(100_000_000),
});

export const PaymentVerifySchema = z.object({
  reference: z.string().trim().regex(/^[A-Za-z0-9_.:-]{1,200}$/, 'Transaction reference is not valid'),
  orderId: id('Order ID'),
});

export const AdminLoginSchema = z.object({
  email,
  // bcrypt only reads the first 72 bytes; a cap stops multi-megabyte "passwords".
  password: z.string().min(1, 'Password is required').max(128, 'Password is too long'),
});

export const NewsletterSubscribeSchema = z.object({ email });

export const ProductVariantSchema = z.object({
  // Variants read back from the database carry null for unset values, so accept null as well as missing.
  id: id('Variant ID').nullish(),
  color: text(40, { min: 1, label: 'Colour' }),
  size: z.enum(GARMENT_SIZES),
  sku: z.string().trim().regex(SKU, 'SKU can only contain letters, numbers, . _ -').nullish(),
  priceInKobo: cents('Variant price').nullish(),
  stock: z.number().int().min(0).max(100_000).default(0),
  active: z.boolean().default(true),
});

export const ProductColorSchema = z.object({
  name: text(40, { min: 1, label: 'Colour name' }),
  hex: z.string().trim().regex(HEX_COLOR, 'Colour must look like #1A2B3C'),
});

export const ProductCreateUpdateBaseSchema = z.object({
  name: text(80, { min: 2, label: 'Product name' }),
  slug: z.string().trim().toLowerCase().max(80).regex(SLUG, 'Web address can only contain lowercase letters, numbers and hyphens').optional(),
  priceInKobo: cents('Price'),
  category: z.enum(['dresses', 'sets', 'tops', 'bottoms', 'occasion']),
  collection: text(60, { label: 'Collection' }).nullish(),
  status: z.enum(['live', 'draft', 'archived']).default('live'),
  colors: z.array(ProductColorSchema).max(20, 'Too many colours').default([]),
  sizes: z.array(z.enum(GARMENT_SIZES)).max(GARMENT_SIZES.length).default([]),
  variants: z.array(ProductVariantSchema).max(200, 'Too many variants').default([]),
  primaryImage: safeUrl('Primary photo must be a web address starting with https://'),
  // Prisma requires this column, so default it to the primary image rather
  // than letting a validated payload fail at insert time.
  secondaryImage: safeUrl('Second photo must be a web address starting with https://').nullish(),
  galleryImages: z.array(safeUrl('A photo link is not valid')).max(20, 'Too many photos').default([]),
  badge: z.enum(['NEW', 'EXCLUSIVE', 'LIMITED']).nullish(),
  stockWarning: text(120, { label: 'Stock note' }).nullish(),
  description: text(5000, { multiline: true, label: 'Description' }).default(''),
  fitAndSize: text(2000, { multiline: true, label: 'Fit and size' }).default(''),
  delivery: text(500, { multiline: true, label: 'Delivery' }).default(''),
  care: text(1000, { multiline: true, label: 'Care' }).default(''),
  editorialSubtitle: text(120, { label: 'Subtitle' }).nullish(),
  isNewArrival: z.boolean().default(false),
  isSignatureSelection: z.boolean().default(false),
  isAsymmetricFeature: z.boolean().default(false),
  asymmetricRole: z.enum(['large', 'detail']).nullish(),
});

export const ProductCreateUpdateSchema = ProductCreateUpdateBaseSchema.superRefine((product, ctx) => {
  // Domain invariants the database and storefront actually require. Without
  // these, a "valid" payload could 500 on insert (secondaryImage is NOT NULL
  // in Prisma) or publish a product with no buyable variant, which then
  // crashed components that assume a colour/size exists.
  if (product.status === 'live') {
    if (product.colors.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['colors'], message: 'A live product needs at least one colour' });
    }
    if (product.sizes.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['sizes'], message: 'A live product needs at least one size' });
    }
    if (!product.variants.some((v) => v.active)) {
      ctx.addIssue({
        code: 'custom',
        path: ['variants'],
        message: 'A live product needs at least one active size and colour customers can buy',
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
        message: `Variant colour "${variant.color}" is not in this product's colour list`,
      });
    }
    if (product.sizes.length > 0 && !product.sizes.includes(variant.size)) {
      ctx.addIssue({
        code: 'custom',
        path: ['variants'],
        message: `Variant size ${variant.size} is not in this product's size list`,
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
  productId: id('Product ID'),
  priceInKobo: cents('Price').optional(),
  totalStock: z.number().int().min(0).max(100_000).optional(),
  status: z.enum(['live', 'draft', 'archived']).optional(),
});

export const QuickEditPayloadSchema = z.object({
  items: z.array(QuickEditItemSchema).min(1, 'No items provided for quick edit').max(500, 'Too many items at once'),
});

export const OrderRefundSchema = z.object({
  amountInKobo: z.number().int().positive().max(100_000_000).optional(),
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
  reason: text(300, { label: 'Reason' }).optional(),
});

export const RecordPaymentSchema = z.object({
  note: text(300, { label: 'Note' }).optional(),
});

/** Promotion text typed by the owner: strip markup from every visible string. */
function sanitizePromotions(p: StorePromotions): StorePromotions {
  const clean = (s: string) => sanitizePlainText(s);
  return {
    announcements: p.announcements.map(clean).filter(Boolean),
    banner: {
      ...p.banner,
      eyebrow: clean(p.banner.eyebrow),
      headline: clean(p.banner.headline),
      body: clean(p.banner.body),
      ctaLabel: clean(p.banner.ctaLabel),
    },
  };
}

export const StoreSettingsUpdateSchema = z.object({
  storeName: text(60, { min: 1, label: 'Store name' }).optional(),
  supportEmail: email.optional(),
  supportWhatsApp: z
    .string()
    .trim()
    .regex(/^[+()\d\s.-]{5,32}$/, 'Enter a phone number using digits, spaces, + ( ) or -')
    .optional(),
  currency: z.literal('USD').optional(),
  freeDeliveryThresholdInKobo: z.number().int().min(0).max(MAX_CENTS).optional(),
  returnPeriodDays: z.number().int().min(1).max(365).optional(),
  deliveryZones: z
    .array(
      z.object({
        id: id('Delivery option ID'),
        name: text(80, { min: 1, label: 'Shipping name' }),
        feeInKobo: z.number().int().min(0).max(1_000_000),
        estimatedDelivery: text(60, { min: 1, label: 'Delivery time' }),
        description: text(200, { label: 'Description' }),
        active: z.boolean(),
      })
    )
    .max(20)
    .optional(),
  paymentProviders: z
    .object({
      paystack: z.boolean().optional(),
      flutterwave: z.boolean().optional(),
      stripe: z.boolean().optional(),
      showroomCollection: z.boolean().optional(),
    })
    .optional(),
  promotions: PromotionsSchema.transform(sanitizePromotions).optional(),
});
