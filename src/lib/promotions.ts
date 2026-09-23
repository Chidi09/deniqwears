import { z } from 'zod';

/**
 * Store promotions the owner edits from the admin "Promotions" tab: the
 * rotating messages in the top bar and one homepage banner. Stored as a single
 * JSON column on StoreSettings, so this schema is both the admin form's
 * validation and the guard when reading the column back.
 */

export const PROMO_LINK_TARGETS = ['all', 'new', 'dresses', 'sets', 'tops', 'bottoms', 'occasion'] as const;
export type PromoLinkTarget = (typeof PROMO_LINK_TARGETS)[number];

export const PROMO_LINK_LABELS: Record<PromoLinkTarget, string> = {
  all: 'All products',
  new: 'New in',
  dresses: 'Dresses',
  sets: 'Sets',
  tops: 'Tops',
  bottoms: 'Bottoms',
  occasion: 'Occasion',
};

export const PromoBannerSchema = z.object({
  enabled: z.boolean(),
  eyebrow: z.string().trim().max(40),
  headline: z.string().trim().min(1, 'The banner needs a headline').max(80),
  body: z.string().trim().max(240),
  ctaLabel: z.string().trim().min(1, 'The banner button needs a label').max(30),
  ctaTarget: z.enum(PROMO_LINK_TARGETS),
  // A full web address, or a photo hosted on the site itself (/products/…).
  image: z
    .string()
    .trim()
    .max(1000)
    .refine((v) => v === '' || v.startsWith('/') || /^https?:\/\//.test(v), 'Banner photo must be a web address (https://…)'),
  discountCode: z.string().trim().toUpperCase().max(30),
});

export const PromotionsSchema = z.object({
  announcements: z.array(z.string().trim().min(1).max(120)).max(5),
  banner: PromoBannerSchema,
});

export type PromoBanner = z.infer<typeof PromoBannerSchema>;
export type StorePromotions = z.infer<typeof PromotionsSchema>;

export const DEFAULT_PROMOTIONS: StorePromotions = {
  announcements: [
    'Sizes 10 – 20 in every design',
    'New pieces added every month',
    'Easy returns & exchanges',
  ],
  banner: {
    enabled: true,
    eyebrow: 'The Welcome Edit',
    headline: '10% off your first order',
    body: 'Discover linen, Ankara cotton and amwete pieces cut for sizes 10 to 20. Use the code at checkout.',
    ctaLabel: 'Shop new in',
    ctaTarget: 'new',
    image: '',
    discountCode: 'WELCOME10',
  },
};

/** Reads the stored JSON column, falling back to defaults if it is empty or malformed. */
export function parsePromotions(value: unknown): StorePromotions {
  const parsed = PromotionsSchema.safeParse(value);
  return parsed.success ? parsed.data : DEFAULT_PROMOTIONS;
}
