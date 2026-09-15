// Standalone fixture data for MSW mocking (dev without a database, and tests).
// Deliberately independent from prisma/seed.ts: this only needs to be
// representative, not byte-identical to the real seeded catalog.
import type { Product, StoreSettings, DiscountCode } from '../../server/types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'mock-prod-amara-dress',
    name: 'The Amara Dress',
    slug: 'the-amara-dress',
    priceInKobo: 4_800_000,
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
    delivery: 'Complimentary express dispatch across Lagos.',
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
    priceInKobo: 3_800_000,
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
  supportEmail: 'concierge@deniqwears.com',
  supportWhatsApp: '+234 818 000 3344',
  currency: 'NGN',
  freeDeliveryThresholdInKobo: 10_000_000,
  returnPeriodDays: 7,
  deliveryZones: [
    {
      id: 'zone-lagos-island',
      name: 'Lagos Island (Victoria Island, Ikoyi, Lekki 1)',
      feeInKobo: 0,
      estimatedDelivery: 'Same Day / Next Day (by 14:00)',
      description: 'Private concierge express courier from our VI Flagship atelier',
      active: true,
    },
    {
      id: 'zone-nationwide',
      name: 'Other Nationwide (Nigeria)',
      feeInKobo: 450_000,
      estimatedDelivery: '3 – 4 Business Days',
      description: 'Insured nationwide express courier',
      active: true,
    },
  ],
  paymentProviders: {
    paystack: true,
    flutterwave: true,
    stripe: false,
    showroomCollection: true,
  },
};

export const MOCK_DISCOUNTS: DiscountCode[] = [
  { id: 'mock-disc-welcome10', code: 'WELCOME10', type: 'percentage', value: 10, minSpendInKobo: 3_000_000, active: true, usageCount: 0 },
];
