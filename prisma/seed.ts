import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PRODUCTS = [
  {
    name: 'The Amara Dress',
    slug: 'the-amara-dress',
    priceInKobo: 12_800,
    status: 'live' as const,
    category: 'dresses',
    collection: 'COLLECTION 01',
    colors: [
      { name: 'Black', hex: '#171714' },
      { name: 'Ivory', hex: '#FAF9F6' },
      { name: 'Oxblood', hex: '#681F2C' },
    ],
    sizes: ['10', '12', '14', '16', '18'],
    variants: [
      { color: 'Black', size: '10', stock: 4, active: true },
      { color: 'Black', size: '12', stock: 5, active: true },
      { color: 'Black', size: '14', stock: 3, active: true },
      { color: 'Black', size: '16', stock: 6, active: true },
      { color: 'Black', size: '18', stock: 2, active: true },
      { color: 'Ivory', size: '10', stock: 2, active: true },
      { color: 'Ivory', size: '12', stock: 4, active: true },
      { color: 'Ivory', size: '14', stock: 2, active: true },
      { color: 'Ivory', size: '16', stock: 1, active: true },
      { color: 'Ivory', size: '18', stock: 0, active: true },
      { color: 'Oxblood', size: '12', stock: 3, active: true },
      { color: 'Oxblood', size: '14', stock: 4, active: true },
      { color: 'Oxblood', size: '16', stock: 2, active: true },
    ],
    primaryImage: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
    ],
    badge: 'NEW' as const,
    rating: 4.9,
    reviewsCount: 28,
    stockWarning: 'Only 3 left in size M',
    description:
      'A floor-sweeping column dress cut from heavy double-faced satin. Designed with an asymmetric open back, clean neck binding, and subtle darting that contours with quiet authority.',
    fitAndSize: 'Tailored architectural fit through the bodice, relaxing into a gentle fluid flare at the ankle. True to size.',
    delivery: 'Ships within 1–2 business days. Free standard US shipping on orders over $150.',
    care: 'Dry clean only. Store on wide padded hanger.',
    editorialSubtitle: 'Cut from fluid Japanese satin with clean asymmetric back contours.',
    isNewArrival: true,
    isSignatureSelection: true,
    isAsymmetricFeature: true,
    asymmetricRole: 'large' as const,
  },
  {
    name: 'Sculpted Satin Corset',
    slug: 'sculpted-satin-corset',
    priceInKobo: 8_900,
    status: 'live' as const,
    category: 'tops',
    collection: 'COLLECTION 01',
    colors: [
      { name: 'Oxblood', hex: '#681F2C' },
      { name: 'Black', hex: '#171714' },
    ],
    sizes: ['10', '12', '14', '16'],
    variants: [
      { color: 'Oxblood', size: '10', stock: 2, active: true },
      { color: 'Oxblood', size: '12', stock: 3, active: true },
      { color: 'Oxblood', size: '14', stock: 2, active: true },
      { color: 'Oxblood', size: '16', stock: 1, active: true },
      { color: 'Black', size: '10', stock: 3, active: true },
      { color: 'Black', size: '12', stock: 4, active: true },
      { color: 'Black', size: '14', stock: 3, active: true },
      { color: 'Black', size: '16', stock: 2, active: true },
    ],
    primaryImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
    ],
    badge: 'LIMITED' as const,
    rating: 4.8,
    reviewsCount: 19,
    stockWarning: 'Low stock in Oxblood S',
    description:
      'Internal steel-spring boning encased in lustrous satin. Creates an exaggerated hourglass contour while maintaining total flexibility.',
    fitAndSize: 'Structured bodice with hook-and-eye rear closure. Size up if between ribcage sizes.',
    delivery: 'Dispatched within 24 hours.',
    care: 'Spot clean or specialist dry clean.',
    editorialSubtitle: 'Internal structural boning with raw-edge hem finish.',
    isNewArrival: true,
    isSignatureSelection: false,
    isAsymmetricFeature: true,
    asymmetricRole: 'detail' as const,
  },
  {
    name: 'The Luna Two-Piece Set',
    slug: 'the-luna-two-piece-set',
    priceInKobo: 14_800,
    status: 'live' as const,
    category: 'sets',
    collection: 'COLLECTION 01',
    colors: [
      { name: 'Sand', hex: '#E6E1D7' },
      { name: 'Black', hex: '#171714' },
    ],
    sizes: ['10', '12', '14', '16'],
    variants: [
      { color: 'Sand', size: '10', stock: 1, active: true },
      { color: 'Sand', size: '12', stock: 2, active: true },
      { color: 'Sand', size: '14', stock: 2, active: true },
      { color: 'Sand', size: '16', stock: 1, active: true },
      { color: 'Black', size: '12', stock: 3, active: true },
      { color: 'Black', size: '14', stock: 3, active: true },
      { color: 'Black', size: '16', stock: 2, active: true },
    ],
    primaryImage: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=1200&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=1200&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=1200&auto=format&fit=crop',
    ],
    badge: 'EXCLUSIVE' as const,
    rating: 4.9,
    reviewsCount: 34,
    description:
      'A cropped high-neck shell paired with sweeping wide-leg pleated trousers. Tailored in structured crêpe that moves with effortless poise.',
    fitAndSize: 'Trousers feature a deep rise and 34" inseam made for heels.',
    delivery: 'Free standard US shipping on orders over $150.',
    care: 'Dry clean only.',
    editorialSubtitle: 'Relaxed yet authoritative tailoring for evening salons.',
    isNewArrival: true,
    isSignatureSelection: true,
    isAsymmetricFeature: false,
  },
  {
    name: 'Sade Column Gown',
    slug: 'sade-column-gown',
    priceInKobo: 16_800,
    status: 'live' as const,
    category: 'occasion',
    collection: 'OCCASION',
    colors: [
      { name: 'Black', hex: '#171714' },
      { name: 'Oxblood', hex: '#681F2C' },
    ],
    sizes: ['12', '14', '16'],
    variants: [
      { color: 'Black', size: '12', stock: 2, active: true },
      { color: 'Black', size: '14', stock: 2, active: true },
      { color: 'Black', size: '16', stock: 1, active: true },
      { color: 'Oxblood', size: '12', stock: 1, active: true },
      { color: 'Oxblood', size: '14', stock: 1, active: true },
    ],
    primaryImage: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop',
    ],
    rating: 5.0,
    reviewsCount: 14,
    description:
      'Heavyweight matte jersey that falls like liquid marble. High boatneck front with a dramatic plunge back that commands silence when turning.',
    fitAndSize: 'Slim architectural column with side hem slit. Model is 5\'10" wearing S.',
    delivery: 'Hand-delivered with garment bag.',
    care: 'Specialist dry clean only.',
    editorialSubtitle: 'Architectural column tailored for indelible arrivals.',
    isNewArrival: false,
    isSignatureSelection: true,
    isAsymmetricFeature: false,
  },
  {
    name: 'Wide-Leg Pleated Trousers',
    slug: 'wide-leg-pleated-trousers',
    priceInKobo: 9_800,
    status: 'live' as const,
    category: 'bottoms',
    collection: 'COLLECTION 01',
    colors: [
      { name: 'Ivory', hex: '#FAF9F6' },
      { name: 'Graphite', hex: '#56554F' },
      { name: 'Black', hex: '#171714' },
    ],
    sizes: ['10', '12', '14', '16', '18'],
    variants: [
      { color: 'Ivory', size: '10', stock: 3, active: true },
      { color: 'Ivory', size: '12', stock: 4, active: true },
      { color: 'Ivory', size: '14', stock: 3, active: true },
      { color: 'Ivory', size: '16', stock: 2, active: true },
      { color: 'Black', size: '12', stock: 5, active: true },
      { color: 'Black', size: '14', stock: 4, active: true },
    ],
    primaryImage: 'https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=1200&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
    galleryImages: ['https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=1200&auto=format&fit=crop'],
    badge: 'NEW' as const,
    rating: 4.7,
    reviewsCount: 22,
    description:
      'Double front pleats that drape into expansive wide legs. Crafted from tropical weight wool blend suitable for warm climates.',
    fitAndSize: 'High-rise waistband sits at natural waist.',
    delivery: 'Standard 48-hour delivery.',
    care: 'Dry clean recommended.',
    editorialSubtitle: 'High-rise waistline framing double front inverted pleats.',
    isNewArrival: true,
    isSignatureSelection: false,
    isAsymmetricFeature: false,
  },
  {
    name: 'Silk Georgette Slip',
    slug: 'silk-georgette-slip',
    priceInKobo: 11_800,
    status: 'draft' as const,
    category: 'dresses',
    collection: 'STUDIO PREVIEW',
    colors: [{ name: 'Oxblood', hex: '#681F2C' }],
    sizes: ['12', '14', '16'],
    variants: [
      { color: 'Oxblood', size: '12', stock: 0, active: true },
      { color: 'Oxblood', size: '14', stock: 0, active: true },
    ],
    primaryImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
    galleryImages: [] as string[],
    badge: 'LIMITED' as const,
    rating: 4.9,
    reviewsCount: 8,
    description: 'Bias-cut 100% silk georgette with hand-rolled hems.',
    fitAndSize: 'Bias cut skims natural curves.',
    delivery: 'Studio preview drop.',
    care: 'Dry clean only.',
    isNewArrival: false,
    isSignatureSelection: false,
    isAsymmetricFeature: false,
  },
];

// US shipping. Fees are in cents and are placeholders for the owner to
// confirm in Admin → Settings.
const DELIVERY_ZONES = [
  {
    id: 'zone-us-standard',
    name: 'Standard Shipping',
    feeInKobo: 795,
    estimatedDelivery: '3 – 7 business days',
    description: 'Tracked delivery anywhere in the United States',
    active: true,
    sortOrder: 0,
  },
  {
    id: 'zone-us-express',
    name: 'Express Shipping',
    feeInKobo: 1_995,
    estimatedDelivery: '1 – 3 business days',
    description: 'Priority tracked delivery',
    active: true,
    sortOrder: 1,
  },
];

const DISCOUNTS = [
  {
    code: 'WELCOME10',
    type: 'percentage' as const,
    value: 10,
    minSpendInKobo: 7_500,
    active: true,
  },
  {
    code: 'DENIQVIP',
    type: 'fixed' as const,
    value: 1_500,
    minSpendInKobo: 15_000,
    active: true,
  },
];

async function main() {
  console.log('Seeding delivery zones...');
  for (const zone of DELIVERY_ZONES) {
    await prisma.deliveryZone.upsert({ where: { id: zone.id }, update: zone, create: zone });
  }

  console.log('Seeding store settings...');
  await prisma.storeSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      storeName: 'Deniqwears',
      supportEmail: 'hello@deniqwears.com',
      supportWhatsApp: '+1 (555) 010-0000',
      currency: 'USD',
      freeDeliveryThresholdInKobo: 15_000,
      returnPeriodDays: 5,
      paystackEnabled: false,
      flutterwaveEnabled: false,
      stripeEnabled: true,
      showroomCollectionEnabled: false,
    },
  });

  console.log('Seeding discount codes...');
  for (const discount of DISCOUNTS) {
    await prisma.discountCode.upsert({
      where: { code: discount.code },
      update: {},
      create: discount,
    });
  }

  console.log('Seeding products...');
  for (const product of PRODUCTS) {
    const { variants, ...rest } = product;
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...rest,
        variants: { create: variants },
      },
    });
  }

  const adminEmail = process.env.ADMIN_SEED_EMAIL;
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;
  if (adminEmail && adminPassword) {
    console.log(`Seeding admin user ${adminEmail}...`);
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.adminUser.upsert({
      where: { email: adminEmail.toLowerCase().trim() },
      // Rotating the password also invalidates every existing session.
      update: { passwordHash, sessionVersion: { increment: 1 }, active: true },
      create: {
        email: adminEmail.toLowerCase().trim(),
        passwordHash,
        name: 'Deniq Showroom Manager',
        role: 'ADMIN',
      },
    });
  } else {
    console.warn(
      'Skipped admin user seed: set ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD env vars to create the first admin account.'
    );
  }

  console.log('Seed complete.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
