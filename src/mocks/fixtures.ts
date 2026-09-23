// Standalone fixture data for MSW mocking (dev without a database, and tests).
// Deliberately independent from prisma/seed.ts: this only needs to be
// representative, not byte-identical to the real seeded catalog.
import type { Product, StoreSettings, DiscountCode } from '../../server/types';
import { DEFAULT_PROMOTIONS } from '../lib/promotions';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'mock-prod-amara-dress',
    name: 'The Amara Dress',
    slug: 'the-amara-dress',
    priceInKobo: 12_800,
    status: 'live',
    category: 'dresses',
    collection: 'COLLECTION 01',
    colors: [
      { name: 'Black', hex: '#171714' },
      { name: 'Ivory', hex: '#FAF9F6' },
    ],
    sizes: ['10', '12', '14', '16', '18'],
    variants: [
      { id: 'mock-v-amara-blk-m', color: 'Black', size: '14', stock: 5, active: true, priceInKobo: null, sku: null },
      { id: 'mock-v-amara-iv-s', color: 'Ivory', size: '12', stock: 3, active: true, priceInKobo: null, sku: null },
    ],
    primaryImage: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
    galleryImages: [],
    badge: 'NEW',
    rating: 4.9,
    reviewsCount: 28,
    description: 'A floor-sweeping column dress cut from heavy double-faced satin.',
    fitAndSize: 'Tailored architectural fit. True to size.',
    delivery: 'Ships within 1–2 business days.',
    care: 'Dry clean only.',
    isNewArrival: true,
    isSignatureSelection: true,
    isAsymmetricFeature: true,
    asymmetricRole: 'large',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-prod-pleated-trousers',
    name: 'Wide-Leg Pleated Trousers',
    slug: 'wide-leg-pleated-trousers',
    priceInKobo: 9_800,
    status: 'live',
    category: 'bottoms',
    collection: 'COLLECTION 01',
    colors: [{ name: 'Ivory', hex: '#FAF9F6' }],
    sizes: ['12', '14', '16'],
    variants: [{ id: 'mock-v-tr-iv-m', color: 'Ivory', size: '14', stock: 4, active: true, priceInKobo: null, sku: null }],
    primaryImage: 'https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=1200&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
    galleryImages: [],
    badge: 'NEW',
    rating: 4.7,
    reviewsCount: 22,
    description: 'Double front pleats that drape into expansive wide legs.',
    fitAndSize: 'High-rise waistband sits at natural waist.',
    delivery: 'Standard 48-hour delivery.',
    care: 'Dry clean recommended.',
    isNewArrival: true,
    isSignatureSelection: false,
    isAsymmetricFeature: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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
      estimatedDelivery: '3 – 7 business days',
      description: 'Tracked delivery anywhere in the United States',
      active: true,
    },
    {
      id: 'zone-us-express',
      name: 'Express Shipping',
      feeInKobo: 1_995,
      estimatedDelivery: '1 – 3 business days',
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
