// Standalone fixture data for MSW mocking (dev without a database, and tests).
import type { Product, StoreSettings, DiscountCode } from '../../server/types';
import { DEFAULT_PROMOTIONS } from '../lib/promotions';
import { CATALOG_PRODUCTS } from '../../prisma/catalog';

// Built from the real catalogue so local mock mode shows the actual clothes.
const MOCK_TIMESTAMP = new Date().toISOString();
export const MOCK_PRODUCTS: Product[] = CATALOG_PRODUCTS.map(({ variants, ...product }) => ({
  ...product,
  id: `mock-prod-${product.slug}`,
  variants: variants.map((v) => ({ ...v, id: `mock-v-${product.slug}-${v.size}`, sku: null, priceInKobo: null })),
  createdAt: MOCK_TIMESTAMP,
  updatedAt: MOCK_TIMESTAMP,
}));

export const MOCK_SETTINGS: StoreSettings = {
  storeName: 'Deniqwears',
  supportEmail: 'hello@deniqwears.com',
  supportWhatsApp: '+1 (555) 010-0000',
  currency: 'USD',
  freeDeliveryThresholdInKobo: 15_000,
  returnPeriodDays: 5,
  deliveryZones: [
    {
      id: 'zone-us-standard',
      name: 'Standard Shipping',
      feeInKobo: 795,
      estimatedDelivery: '3–7 business days',
      description: 'Tracked delivery anywhere in the United States',
      active: true,
    },
    {
      id: 'zone-us-express',
      name: 'Express Shipping',
      feeInKobo: 1_995,
      estimatedDelivery: '1–3 business days',
      description: 'Priority tracked delivery',
      active: true,
    },
  ],
  paymentProviders: {
    paystack: false,
    flutterwave: false,
    stripe: true,
    showroomCollection: false,
  },
  promotions: DEFAULT_PROMOTIONS,
};

export const MOCK_DISCOUNTS: DiscountCode[] = [
  { id: 'mock-disc-welcome10', code: 'WELCOME10', type: 'percentage', value: 10, minSpendInKobo: 7_500, active: true, usageCount: 0 },
];
