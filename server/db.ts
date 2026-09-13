import {
  Product,
  ProductVariant,
  Order,
  StoreSettings,
  DiscountCode,
  AdminActivityLog,
  DeliveryZone,
  OrderStatus,
} from './types';

// Initial seed products with variant-level inventory and prices in kobo (1 NGN = 100 kobo)
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-amara-dress',
    name: 'The Amara Dress',
    slug: 'the-amara-dress',
    priceInKobo: 4800000, // ₦48,000
    status: 'live',
    category: 'dresses',
    collection: 'COLLECTION 01',
    colors: [
      { name: 'Black', hex: '#171714' },
      { name: 'Ivory', hex: '#FAF9F6' },
      { name: 'Oxblood', hex: '#681F2C' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    variants: [
      { id: 'v-amara-blk-xs', color: 'Black', size: 'XS', stock: 4, active: true },
      { id: 'v-amara-blk-s', color: 'Black', size: 'S', stock: 5, active: true },
      { id: 'v-amara-blk-m', color: 'Black', size: 'M', stock: 3, active: true },
      { id: 'v-amara-blk-l', color: 'Black', size: 'L', stock: 6, active: true },
      { id: 'v-amara-blk-xl', color: 'Black', size: 'XL', stock: 2, active: true },
      { id: 'v-amara-iv-xs', color: 'Ivory', size: 'XS', stock: 2, active: true },
      { id: 'v-amara-iv-s', color: 'Ivory', size: 'S', stock: 4, active: true },
      { id: 'v-amara-iv-m', color: 'Ivory', size: 'M', stock: 2, active: true },
      { id: 'v-amara-iv-l', color: 'Ivory', size: 'L', stock: 1, active: true },
      { id: 'v-amara-iv-xl', color: 'Ivory', size: 'XL', stock: 0, active: true },
      { id: 'v-amara-ox-s', color: 'Oxblood', size: 'S', stock: 3, active: true },
      { id: 'v-amara-ox-m', color: 'Oxblood', size: 'M', stock: 4, active: true },
      { id: 'v-amara-ox-l', color: 'Oxblood', size: 'L', stock: 2, active: true },
    ],
    primaryImage: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
    ],
    badge: 'NEW',
    rating: 4.9,
    reviewsCount: 28,
    stockWarning: 'Only 3 left in size M',
    description: 'A floor-sweeping column dress cut from heavy double-faced satin. Designed with an asymmetric open back, clean neck binding, and subtle darting that contours with quiet authority.',
    fitAndSize: 'Tailored architectural fit through the bodice, relaxing into a gentle fluid flare at the ankle. True to size.',
    delivery: 'Complimentary express dispatch across Lagos. Victoria Island atelier fittings available.',
    care: 'Dry clean only. Store on wide padded hanger.',
    editorialSubtitle: 'Cut from fluid Japanese satin with clean asymmetric back contours.',
    isNewArrival: true,
    isSignatureSelection: true,
    isAsymmetricFeature: true,
    asymmetricRole: 'large',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-sculpted-corset',
    name: 'Sculpted Satin Corset',
    slug: 'sculpted-satin-corset',
    priceInKobo: 3450000, // ₦34,500
    status: 'live',
    category: 'tops',
    collection: 'COLLECTION 01',
    colors: [
      { name: 'Oxblood', hex: '#681F2C' },
      { name: 'Black', hex: '#171714' },
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    variants: [
      { id: 'v-corset-ox-xs', color: 'Oxblood', size: 'XS', stock: 2, active: true },
      { id: 'v-corset-ox-s', color: 'Oxblood', size: 'S', stock: 3, active: true },
      { id: 'v-corset-ox-m', color: 'Oxblood', size: 'M', stock: 2, active: true },
      { id: 'v-corset-ox-l', color: 'Oxblood', size: 'L', stock: 1, active: true },
      { id: 'v-corset-blk-xs', color: 'Black', size: 'XS', stock: 3, active: true },
      { id: 'v-corset-blk-s', color: 'Black', size: 'S', stock: 4, active: true },
      { id: 'v-corset-blk-m', color: 'Black', size: 'M', stock: 3, active: true },
      { id: 'v-corset-blk-l', color: 'Black', size: 'L', stock: 2, active: true },
    ],
    primaryImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
    ],
    badge: 'LIMITED',
    rating: 4.8,
    reviewsCount: 19,
    stockWarning: 'Low stock in Oxblood S',
    description: 'Internal steel-spring boning encased in lustrous satin. Creates an exaggerated hourglass contour while maintaining total flexibility.',
    fitAndSize: 'Structured bodice with hook-and-eye rear closure. Size up if between ribcage sizes.',
    delivery: 'Dispatched within 24 hours.',
    care: 'Spot clean or specialist dry clean.',
    editorialSubtitle: 'Internal structural boning with raw-edge hem finish.',
    isNewArrival: true,
    isSignatureSelection: false,
    isAsymmetricFeature: true,
    asymmetricRole: 'detail',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-luna-set',
    name: 'The Luna Two-Piece Set',
    slug: 'the-luna-two-piece-set',
    priceInKobo: 5500000, // ₦55,000
    status: 'live',
    category: 'sets',
    collection: 'COLLECTION 01',
    colors: [
      { name: 'Sand', hex: '#E6E1D7' },
      { name: 'Black', hex: '#171714' },
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    variants: [
      { id: 'v-luna-snd-xs', color: 'Sand', size: 'XS', stock: 1, active: true },
      { id: 'v-luna-snd-s', color: 'Sand', size: 'S', stock: 2, active: true },
      { id: 'v-luna-snd-m', color: 'Sand', size: 'M', stock: 2, active: true },
      { id: 'v-luna-snd-l', color: 'Sand', size: 'L', stock: 1, active: true },
      { id: 'v-luna-blk-s', color: 'Black', size: 'S', stock: 3, active: true },
      { id: 'v-luna-blk-m', color: 'Black', size: 'M', stock: 3, active: true },
      { id: 'v-luna-blk-l', color: 'Black', size: 'L', stock: 2, active: true },
    ],
    primaryImage: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=1200&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=1200&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=1200&auto=format&fit=crop',
    ],
    badge: 'EXCLUSIVE',
    rating: 4.9,
    reviewsCount: 34,
    description: 'A cropped high-neck shell paired with sweeping wide-leg pleated trousers. Tailored in structured crêpe that moves with effortless poise.',
    fitAndSize: 'Trousers feature a deep rise and 34" inseam made for heels.',
    delivery: 'Complimentary shipping across Nigeria.',
    care: 'Dry clean only.',
    editorialSubtitle: 'Relaxed yet authoritative tailoring for evening salons.',
    isNewArrival: true,
    isSignatureSelection: true,
    isAsymmetricFeature: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-sade-column-gown',
    name: 'Sade Column Gown',
    slug: 'sade-column-gown',
    priceInKobo: 6200000, // ₦62,000
    status: 'live',
    category: 'occasion',
    collection: 'ATELIER OCCASION',
    colors: [
      { name: 'Black', hex: '#171714' },
      { name: 'Oxblood', hex: '#681F2C' },
    ],
    sizes: ['S', 'M', 'L'],
    variants: [
      { id: 'v-sade-blk-s', color: 'Black', size: 'S', stock: 2, active: true },
      { id: 'v-sade-blk-m', color: 'Black', size: 'M', stock: 2, active: true },
      { id: 'v-sade-blk-l', color: 'Black', size: 'L', stock: 1, active: true },
      { id: 'v-sade-ox-s', color: 'Oxblood', size: 'S', stock: 1, active: true },
      { id: 'v-sade-ox-m', color: 'Oxblood', size: 'M', stock: 1, active: true },
    ],
    primaryImage: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop',
    ],
    rating: 5.0,
    reviewsCount: 14,
    description: 'Heavyweight matte jersey that falls like liquid marble. High boatneck front with a dramatic plunge back that commands silence when turning.',
    fitAndSize: 'Slim architectural column with side hem slit. Model is 5\'10" wearing S.',
    delivery: 'Hand-delivered with garment bag.',
    care: 'Specialist dry clean only.',
    editorialSubtitle: 'Architectural column tailored for indelible arrivals.',
    isNewArrival: false,
    isSignatureSelection: true,
    isAsymmetricFeature: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-pleated-trousers',
    name: 'Wide-Leg Pleated Trousers',
    slug: 'wide-leg-pleated-trousers',
    priceInKobo: 3800000, // ₦38,000
    status: 'live',
    category: 'bottoms',
    collection: 'COLLECTION 01',
    colors: [
      { name: 'Ivory', hex: '#FAF9F6' },
      { name: 'Graphite', hex: '#56554F' },
      { name: 'Black', hex: '#171714' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    variants: [
      { id: 'v-tr-iv-xs', color: 'Ivory', size: 'XS', stock: 3, active: true },
      { id: 'v-tr-iv-s', color: 'Ivory', size: 'S', stock: 4, active: true },
      { id: 'v-tr-iv-m', color: 'Ivory', size: 'M', stock: 3, active: true },
      { id: 'v-tr-iv-l', color: 'Ivory', size: 'L', stock: 2, active: true },
      { id: 'v-tr-blk-s', color: 'Black', size: 'S', stock: 5, active: true },
      { id: 'v-tr-blk-m', color: 'Black', size: 'M', stock: 4, active: true },
    ],
    primaryImage: 'https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=1200&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=1200&auto=format&fit=crop',
    ],
    badge: 'NEW',
    rating: 4.7,
    reviewsCount: 22,
    description: 'Double front pleats that drape into expansive wide legs. Crafted from tropical weight wool blend suitable for warm climates.',
    fitAndSize: 'High-rise waistband sits at natural waist.',
    delivery: 'Standard 48-hour delivery.',
    care: 'Dry clean recommended.',
    editorialSubtitle: 'High-rise waistline framing double front inverted pleats.',
    isNewArrival: true,
    isSignatureSelection: false,
    isAsymmetricFeature: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-bias-slip',
    name: 'Silk Georgette Slip',
    slug: 'silk-georgette-slip',
    priceInKobo: 4200000, // ₦42,000
    status: 'draft',
    category: 'dresses',
    collection: 'STUDIO PREVIEW',
    colors: [{ name: 'Oxblood', hex: '#681F2C' }],
    sizes: ['S', 'M', 'L'],
    variants: [
      { id: 'v-slip-ox-s', color: 'Oxblood', size: 'S', stock: 0, active: true },
      { id: 'v-slip-ox-m', color: 'Oxblood', size: 'M', stock: 0, active: true },
    ],
    primaryImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
    galleryImages: [],
    badge: 'LIMITED',
    rating: 4.9,
    reviewsCount: 8,
    description: 'Bias-cut 100% silk georgette with hand-rolled hems.',
    fitAndSize: 'Bias cut skims natural curves.',
    delivery: 'Studio preview drop.',
    care: 'Dry clean only.',
    isNewArrival: false,
    isSignatureSelection: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Initial Delivery Zones
const INITIAL_DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 'zone-lagos-island',
    name: 'Lagos Island (Victoria Island, Ikoyi, Lekki 1)',
    feeInKobo: 0, // Complimentary
    estimatedDelivery: 'Same Day / Next Day (by 14:00)',
    description: 'Private concierge express courier from our VI Flagship atelier',
    active: true,
  },
  {
    id: 'zone-lagos-mainland',
    name: 'Lagos Mainland & Greater Lagos',
    feeInKobo: 250000, // ₦2,500
    estimatedDelivery: '24 – 36 Hours',
    description: 'Fast tracked Lagos courier',
    active: true,
  },
  {
    id: 'zone-abuja',
    name: 'Abuja FCT',
    feeInKobo: 450000, // ₦4,500
    estimatedDelivery: '2 Business Days',
    description: 'Dedicated priority air dispatch',
    active: true,
  },
  {
    id: 'zone-rivers',
    name: 'Rivers / Port Harcourt',
    feeInKobo: 450000, // ₦4,500
    estimatedDelivery: '2 Business Days',
    description: 'Direct air courier dispatch',
    active: true,
  },
  {
    id: 'zone-nationwide',
    name: 'Other Nationwide (Nigeria)',
    feeInKobo: 450000, // ₦4,500
    estimatedDelivery: '3 – 4 Business Days',
    description: 'Insured nationwide express courier',
    active: true,
  },
];

// Initial Store Settings
const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Deniqwears',
  supportEmail: 'concierge@deniqwears.com',
  supportWhatsApp: '+234 818 000 3344',
  currency: 'NGN',
  freeDeliveryThresholdInKobo: 10000000, // ₦100,000 threshold for free nationwide delivery
  returnPeriodDays: 7,
  deliveryZones: INITIAL_DELIVERY_ZONES,
  paymentProviders: {
    paystack: true,
    flutterwave: true,
    stripe: false,
    showroomCollection: true,
  },
};

// Initial Orders (featuring the exact order types and state machine requested)
const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-18421',
    orderNumber: 'DNQ-18421',
    idempotencyKey: 'idemp-init-1',
    status: 'PAID',
    items: [
      {
        id: 'item-1',
        productId: 'prod-amara-dress',
        variantId: 'v-amara-blk-m',
        name: 'The Amara Dress',
        color: 'Black',
        size: 'M',
        image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=400&auto=format&fit=crop',
        unitPriceInKobo: 4800000,
        quantity: 1,
        totalPriceInKobo: 4800000,
      },
      {
        id: 'item-2',
        productId: 'prod-pleated-trousers',
        variantId: 'v-tr-iv-m',
        name: 'Wide-Leg Pleated Trousers',
        color: 'Ivory',
        size: 'M',
        image: 'https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=400&auto=format&fit=crop',
        unitPriceInKobo: 3800000,
        quantity: 1,
        totalPriceInKobo: 3800000,
      },
    ],
    customer: {
      firstName: 'Ada',
      lastName: 'Okafor',
      email: 'ada.okafor@gmail.com',
      phone: '+234 803 123 4567',
    },
    shippingAddress: {
      firstName: 'Ada',
      lastName: 'Okafor',
      email: 'ada.okafor@gmail.com',
      phone: '+234 803 123 4567',
      address: '14 Admiralty Way',
      apartment: 'Apt 4B',
      city: 'Lekki Phase 1',
      state: 'Lagos',
      country: 'Nigeria',
    },
    deliveryZoneId: 'zone-lagos-island',
    deliveryFeeInKobo: 0,
    subtotalInKobo: 8600000,
    discountInKobo: 0,
    totalInKobo: 8600000, // ₦86,000
    currency: 'NGN',
    paymentMethod: 'paystack',
    paymentReference: 'pstk_ref_92817281',
    paidAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    timeline: [
      {
        id: 't-1',
        status: 'PENDING_PAYMENT',
        title: 'Order Created',
        description: 'Order initiated at checkout',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4.2).toISOString(),
      },
      {
        id: 't-2',
        status: 'PAID',
        title: 'Payment Confirmed',
        description: 'Verified via Paystack (pstk_ref_92817281)',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4.2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: 'ord-18420',
    orderNumber: 'DNQ-18420',
    idempotencyKey: 'idemp-init-2',
    status: 'PAYMENT_PROCESSING',
    items: [
      {
        id: 'item-3',
        productId: 'prod-sculpted-corset',
        variantId: 'v-corset-ox-s',
        name: 'Sculpted Satin Corset',
        color: 'Oxblood',
        size: 'S',
        image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=400&auto=format&fit=crop',
        unitPriceInKobo: 3450000,
        quantity: 1,
        totalPriceInKobo: 3450000,
      },
    ],
    customer: {
      firstName: 'Tolu',
      lastName: 'James',
      email: 'tolu.james@outlook.com',
      phone: '+234 818 998 7766',
    },
    shippingAddress: {
      firstName: 'Tolu',
      lastName: 'James',
      email: 'tolu.james@outlook.com',
      phone: '+234 818 998 7766',
      address: '22 Danube Street',
      city: 'Maitama',
      state: 'Abuja',
      country: 'Nigeria',
    },
    deliveryZoneId: 'zone-abuja',
    deliveryFeeInKobo: 450000,
    subtotalInKobo: 3450000,
    discountInKobo: 0,
    totalInKobo: 3900000, // ₦39,000
    currency: 'NGN',
    paymentMethod: 'paystack',
    paymentReference: 'pstk_ref_81273918',
    timeline: [
      {
        id: 't-3',
        status: 'PENDING_PAYMENT',
        title: 'Order Created',
        description: 'Order initiated at checkout',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      },
      {
        id: 't-4',
        status: 'PAYMENT_PROCESSING',
        title: 'Payment Awaiting Settlement',
        description: 'Customer redirected to provider checkout',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5.9).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5.9).toISOString(),
  },
];

// Initial Discounts
const INITIAL_DISCOUNTS: DiscountCode[] = [
  {
    id: 'disc-welcome10',
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    minSpendInKobo: 3000000, // ₦30,000 min spend
    active: true,
    usageCount: 14,
  },
  {
    id: 'disc-deniqvip',
    code: 'DENIQVIP',
    type: 'fixed',
    value: 500000, // ₦5,000 off
    minSpendInKobo: 5000000, // ₦50,000 min spend
    active: true,
    usageCount: 8,
  },
];

// Activity Logs
const INITIAL_ACTIVITY_LOGS: AdminActivityLog[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    adminEmail: 'admin@deniqwears.com',
    action: 'Price updated',
    entityType: 'product',
    entityId: 'prod-amara-dress',
    details: 'Price updated from ₦45,000 to ₦48,000',
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    adminEmail: 'admin@deniqwears.com',
    action: 'Inventory adjusted',
    entityType: 'inventory',
    entityId: 'prod-sculpted-corset',
    details: 'Oxblood S stock updated to 3',
  },
];

// Database state in memory
class Database {
  private products: Product[] = [...INITIAL_PRODUCTS];
  private orders: Order[] = [...INITIAL_ORDERS];
  private deliveryZones: DeliveryZone[] = [...INITIAL_DELIVERY_ZONES];
  private settings: StoreSettings = { ...INITIAL_SETTINGS };
  private discounts: DiscountCode[] = [...INITIAL_DISCOUNTS];
  private activityLogs: AdminActivityLog[] = [...INITIAL_ACTIVITY_LOGS];
  private idempotencyKeys: Set<string> = new Set(['idemp-init-1', 'idemp-init-2']);

  // --- PRODUCTS ---
  getProducts(includeDraftsAndArchived = false): Product[] {
    if (includeDraftsAndArchived) {
      return this.products;
    }
    return this.products.filter((p) => p.status === 'live');
  }

  getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  getProductBySlug(slug: string): Product | undefined {
    return this.products.find((p) => p.slug === slug);
  }

  createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, adminEmail: string): Product {
    const id = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.products.unshift(newProduct);

    this.logActivity({
      adminEmail,
      action: 'Product created',
      entityType: 'product',
      entityId: id,
      details: `Created new product "${newProduct.name}" at ₦${(newProduct.priceInKobo / 100).toLocaleString()}`,
    });

    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>, adminEmail: string): Product | null {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const oldProduct = this.products[idx];
    const updatedProduct: Product = {
      ...oldProduct,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.products[idx] = updatedProduct;

    // Log price change if occurred
    if (updates.priceInKobo && updates.priceInKobo !== oldProduct.priceInKobo) {
      this.logActivity({
        adminEmail,
        action: 'Price changed',
        entityType: 'product',
        entityId: id,
        details: `Price changed for ${updatedProduct.name}: ₦${(oldProduct.priceInKobo / 100).toLocaleString()} → ₦${(updates.priceInKobo / 100).toLocaleString()}`,
      });
    } else {
      this.logActivity({
        adminEmail,
        action: 'Product updated',
        entityType: 'product',
        entityId: id,
        details: `Updated details for "${updatedProduct.name}"`,
      });
    }

    return updatedProduct;
  }

  // Routine destruction is Archive rather than permanent delete
  archiveProduct(id: string, adminEmail: string): Product | null {
    const product = this.getProductById(id);
    if (!product) return null;
    return this.updateProduct(id, { status: 'archived' }, adminEmail);
  }

  quickUpdatePricesAndStock(
    items: Array<{ productId: string; priceInKobo?: number; totalStock?: number; status?: 'live' | 'draft' | 'archived' }>,
    adminEmail: string
  ): void {
    for (const item of items) {
      const p = this.getProductById(item.productId);
      if (!p) continue;
      const updates: Partial<Product> = {};
      if (typeof item.priceInKobo === 'number') updates.priceInKobo = item.priceInKobo;
      if (item.status) updates.status = item.status;
      if (typeof item.totalStock === 'number' && p.variants.length > 0) {
        // Distribute stock across active variants
        const perVariant = Math.max(1, Math.floor(item.totalStock / p.variants.length));
        updates.variants = p.variants.map((v) => ({ ...v, stock: perVariant }));
      }
      this.updateProduct(item.productId, updates, adminEmail);
    }
  }

  // --- ORDERS ---
  getOrders(): Order[] {
    return [...this.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.find((o) => o.id === id || o.orderNumber === id);
  }

  hasIdempotencyKey(key: string): boolean {
    return this.idempotencyKeys.has(key);
  }

  recordIdempotencyKey(key: string): void {
    this.idempotencyKeys.add(key);
  }

  createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'timeline' | 'createdAt' | 'updatedAt'>): Order {
    const orderNumber = `DNQ-${Math.floor(10000 + Math.random() * 90000)}`;
    const id = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const order: Order = {
      ...orderData,
      id,
      orderNumber,
      timeline: [
        {
          id: `tl-${Date.now()}-1`,
          status: orderData.status,
          title: 'Order Created',
          description: `Order initialized for ${orderData.customer.firstName} ${orderData.customer.lastName}`,
          timestamp: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    this.orders.unshift(order);
    this.recordIdempotencyKey(orderData.idempotencyKey);
    return order;
  }

  updateOrderStatus(orderId: string, newStatus: OrderStatus, reason?: string, adminEmail?: string): Order | null {
    const order = this.getOrderById(orderId);
    if (!order) return null;

    order.status = newStatus;
    order.updatedAt = new Date().toISOString();

    if (newStatus === 'PAID') {
      order.paidAt = new Date().toISOString();
      // Deduct variant stock
      for (const item of order.items) {
        this.deductVariantStock(item.productId, item.variantId, item.quantity);
      }
    }

    if (newStatus === 'FULFILLED') {
      order.dispatchedAt = new Date().toISOString();
    }

    order.timeline.push({
      id: `tl-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      status: newStatus,
      title: `Status: ${newStatus.replace(/_/g, ' ')}`,
      description: reason || `Order updated to ${newStatus}`,
      timestamp: new Date().toISOString(),
    });

    if (adminEmail) {
      this.logActivity({
        adminEmail,
        action: 'Order status updated',
        entityType: 'order',
        entityId: order.id,
        details: `Order #${order.orderNumber} transitioned to ${newStatus}`,
      });
    }

    return order;
  }

  private deductVariantStock(productId: string, variantId: string, quantity: number): void {
    const product = this.getProductById(productId);
    if (!product) return;
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant) {
      variant.stock = Math.max(0, variant.stock - quantity);
    }
  }

  // --- STORE SETTINGS ---
  getSettings(): StoreSettings {
    return this.settings;
  }

  updateSettings(updates: Partial<StoreSettings>, adminEmail: string): StoreSettings {
    this.settings = { ...this.settings, ...updates };
    this.logActivity({
      adminEmail,
      action: 'Settings updated',
      entityType: 'settings',
      details: 'Store delivery, threshold, or payment configurations updated',
    });
    return this.settings;
  }

  getDeliveryZone(zoneId: string): DeliveryZone | undefined {
    return this.settings.deliveryZones.find((z) => z.id === zoneId);
  }

  // --- DISCOUNTS ---
  getDiscount(code: string): DiscountCode | undefined {
    return this.discounts.find((d) => d.code.toUpperCase() === code.trim().toUpperCase() && d.active);
  }

  incrementDiscountUsage(id: string): void {
    const d = this.discounts.find((item) => item.id === id);
    if (d) d.usageCount += 1;
  }

  // --- ACTIVITY LOGS ---
  logActivity(data: Omit<AdminActivityLog, 'id' | 'timestamp'>): void {
    const newLog: AdminActivityLog = {
      ...data,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
    };
    this.activityLogs.unshift(newLog);
    // keep up to 200 logs
    if (this.activityLogs.length > 200) {
      this.activityLogs.pop();
    }
  }

  getActivityLogs(): AdminActivityLog[] {
    return this.activityLogs;
  }
}

const globalForDb = globalThis as unknown as { db?: Database };
export const db = globalForDb.db ?? new Database();
if (process.env.NODE_ENV !== 'production') globalForDb.db = db;

