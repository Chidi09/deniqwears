/**
 * Generates demo orders spread over the last 60 days so the admin finance
 * dashboard has realistic data to render. Development only — never run this
 * against a production database.
 *
 * Run: bun run db:seed:demo
 */
import { PrismaClient, OrderStatus, PaymentMethod } from '@prisma/client';

const prisma = new PrismaClient();

const CUSTOMERS = [
  { firstName: 'Ada', lastName: 'Okafor', email: 'ada.okafor@example.com', phone: '+234 803 123 4567', city: 'Lekki Phase 1', state: 'Lagos' },
  { firstName: 'Tolu', lastName: 'James', email: 'tolu.james@example.com', phone: '+234 818 998 7766', city: 'Maitama', state: 'Abuja' },
  { firstName: 'Chidinma', lastName: 'Eze', email: 'chidinma.eze@example.com', phone: '+234 701 555 1212', city: 'Ikoyi', state: 'Lagos' },
  { firstName: 'Zainab', lastName: 'Bello', email: 'zainab.bello@example.com', phone: '+234 909 222 3344', city: 'Port Harcourt', state: 'Rivers' },
  { firstName: 'Funke', lastName: 'Adeyemi', email: 'funke.adeyemi@example.com', phone: '+234 802 777 8899', city: 'Victoria Island', state: 'Lagos' },
];

const PAYMENT_METHODS: PaymentMethod[] = ['paystack', 'paystack', 'paystack', 'flutterwave', 'showroom'];

function pick<T>(list: T[], index: number): T {
  return list[index % list.length];
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed demo orders in production.');
  }

  const products = await prisma.product.findMany({
    where: { status: 'live' },
    include: { variants: { where: { active: true } } },
  });
  const zones = await prisma.deliveryZone.findMany();
  const settings = await prisma.storeSettings.findUniqueOrThrow({ where: { id: 'singleton' } });

  if (products.length === 0 || zones.length === 0) {
    throw new Error('Run `bun run db:seed` first — demo orders need a catalog to reference.');
  }

  const existing = await prisma.order.count({ where: { idempotencyKey: { startsWith: 'demo-' } } });
  if (existing > 0) {
    console.log(`Removing ${existing} previous demo orders...`);
    const ids = (
      await prisma.order.findMany({ where: { idempotencyKey: { startsWith: 'demo-' } }, select: { id: true } })
    ).map((o) => o.id);
    await prisma.orderTimelineEvent.deleteMany({ where: { orderId: { in: ids } } });
    await prisma.orderItem.deleteMany({ where: { orderId: { in: ids } } });
    await prisma.order.deleteMany({ where: { id: { in: ids } } });
  }

  const ORDER_COUNT = 48;
  let created = 0;

  for (let i = 0; i < ORDER_COUNT; i += 1) {
    // Weight recent days more heavily, like a store gaining traction.
    const daysAgo = Math.floor(Math.pow(Math.random(), 1.6) * 60);
    const placedAt = new Date(Date.now() - daysAgo * 86_400_000 - Math.random() * 43_200_000);

    const customer = pick(CUSTOMERS, i);
    const zone = pick(zones, i);
    const paymentMethod = pick(PAYMENT_METHODS, i);

    const itemCount = 1 + Math.floor(Math.random() * 2);
    const items = [];
    let subtotalInKobo = 0;

    for (let j = 0; j < itemCount; j += 1) {
      const product = pick(products, i + j * 3);
      if (product.variants.length === 0) continue;
      const variant = pick(product.variants, i + j);
      const quantity = 1;
      const unitPriceInKobo = variant.priceInKobo ?? product.priceInKobo;
      const totalPriceInKobo = unitPriceInKobo * quantity;
      subtotalInKobo += totalPriceInKobo;

      items.push({
        productId: product.id,
        variantId: variant.id,
        name: product.name,
        color: variant.color,
        size: variant.size,
        image: product.primaryImage,
        unitPriceInKobo,
        quantity,
        totalPriceInKobo,
      });
    }
    if (items.length === 0) continue;

    const deliveryFeeInKobo = subtotalInKobo >= settings.freeDeliveryThresholdInKobo ? 0 : zone.feeInKobo;
    const totalInKobo = subtotalInKobo + deliveryFeeInKobo;

    // Realistic funnel: most paid, some dispatched, a few unpaid/failed/refunded.
    const roll = Math.random();
    let status: OrderStatus;
    let refundedInKobo = 0;

    if (paymentMethod === 'showroom' && roll < 0.4) {
      status = 'PAYMENT_PROCESSING';
    } else if (roll < 0.06) {
      status = 'PAYMENT_FAILED';
    } else if (roll < 0.1) {
      status = 'PENDING_PAYMENT';
    } else if (roll < 0.14) {
      status = 'REFUNDED';
      refundedInKobo = totalInKobo;
    } else if (roll < 0.18) {
      status = 'PARTIALLY_REFUNDED';
      refundedInKobo = Math.round(totalInKobo * 0.4);
    } else if (roll < 0.6) {
      status = 'FULFILLED';
    } else {
      status = 'PAID';
    }

    const isCollected = ['PAID', 'FULFILLED', 'REFUNDED', 'PARTIALLY_REFUNDED'].includes(status);
    const paidAt = isCollected ? new Date(placedAt.getTime() + 1000 * 60 * 12) : null;
    const dispatchedAt = status === 'FULFILLED' ? new Date(placedAt.getTime() + 86_400_000) : null;

    await prisma.order.create({
      data: {
        orderNumber: `DNQ-${20000 + i}`,
        idempotencyKey: `demo-${i}-${placedAt.getTime()}`,
        status,
        customerEmail: customer.email,
        customerFirstName: customer.firstName,
        customerLastName: customer.lastName,
        customerPhone: customer.phone,
        shippingAddress: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          address: '14 Admiralty Way',
          city: customer.city,
          state: customer.state,
          country: 'Nigeria',
        },
        deliveryZoneId: zone.id,
        deliveryFeeInKobo,
        subtotalInKobo,
        discountInKobo: 0,
        totalInKobo,
        refundedInKobo,
        currency: 'NGN',
        paymentMethod,
        paymentReference: `demo_ref_${i}`,
        paymentId: isCollected ? `demo_txn_${i}` : null,
        paidAt,
        dispatchedAt,
        createdAt: placedAt,
        items: { create: items },
        timeline: {
          create: [
            { status: 'PENDING_PAYMENT', title: 'Order Created', description: 'Demo order', timestamp: placedAt },
            ...(paidAt
              ? [{ status, title: `Status: ${status}`, description: 'Demo transition', timestamp: paidAt }]
              : []),
          ],
        },
      },
    });
    created += 1;
  }

  console.log(`Created ${created} demo orders across the last 60 days.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
