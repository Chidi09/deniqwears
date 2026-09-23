import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { CATALOG_PRODUCTS } from './catalog';

const prisma = new PrismaClient();

const PRODUCTS = CATALOG_PRODUCTS;

// US shipping. Fees are in cents and are placeholders for the owner to
// confirm in Admin → Settings.
const DELIVERY_ZONES = [
  {
    id: 'zone-us-standard',
    name: 'Standard Shipping',
    feeInKobo: 795,
    estimatedDelivery: '3–7 business days',
    description: 'Tracked delivery anywhere in the United States',
    active: true,
    sortOrder: 0,
  },
  {
    id: 'zone-us-express',
    name: 'Express Shipping',
    feeInKobo: 1_995,
    estimatedDelivery: '1–3 business days',
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
