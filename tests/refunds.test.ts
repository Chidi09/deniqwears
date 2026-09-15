import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../server/prisma';
import { db } from '../server/db';
import { paymentService } from '../server/payment/service';

// Integration test against the real local Postgres. Skips itself if no
// database is reachable (e.g. in an environment without one provisioned).
const hasDb = !!process.env.DATABASE_URL;
const describeIfDb = hasDb ? describe : describe.skip;

describeIfDb('paymentService.refundOrder', () => {
  // Refunds are exercised against Paystack (settling, via the MSW gateway
  // mock) rather than the showroom provider, which never settles by design.
  process.env.PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_mock';

  let productId: string;
  let variantId: string;
  let zoneId: string;
  const createdOrderIds: string[] = [];

  beforeAll(async () => {
    const zone = await prisma.deliveryZone.findFirst();
    if (!zone) throw new Error('Expected at least one seeded delivery zone for this test');
    zoneId = zone.id;

    const product = await prisma.product.create({
      data: {
        name: 'Refund Test Garment',
        slug: `refund-test-garment-${Date.now()}`,
        priceInKobo: 1_000_000,
        status: 'live',
        category: 'dresses',
        colors: [{ name: 'Black', hex: '#000000' }],
        sizes: ['M'],
        primaryImage: 'https://example.com/a.jpg',
        secondaryImage: 'https://example.com/b.jpg',
        galleryImages: [],
        description: '',
        fitAndSize: '',
        delivery: '',
        care: '',
        variants: { create: [{ color: 'Black', size: 'M', stock: 10, active: true }] },
      },
      include: { variants: true },
    });
    productId = product.id;
    variantId = product.variants[0].id;
  });

  afterAll(async () => {
    // Every filter below must be guarded: Prisma OMITS `undefined` filters
    // rather than matching nothing, so a setup failure that leaves these IDs
    // unassigned would turn this cleanup into a full-table delete.
    if (createdOrderIds.length > 0) {
      await prisma.orderTimelineEvent.deleteMany({ where: { orderId: { in: createdOrderIds } } });
      await prisma.orderItem.deleteMany({ where: { orderId: { in: createdOrderIds } } });
      await prisma.order.deleteMany({ where: { id: { in: createdOrderIds } } });
    }
    if (productId) {
      await prisma.productVariant.deleteMany({ where: { productId } });
      await prisma.product.deleteMany({ where: { id: productId } });
    }
  });

  async function createPaidOrder(totalInKobo: number, options: { leaveUnpaid?: boolean } = {}) {
    const order = await db.createOrder({
      idempotencyKey: `refund-test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      status: 'PENDING_PAYMENT',
      items: [
        {
          id: 'item-1',
          productId,
          variantId,
          name: 'Refund Test Garment',
          color: 'Black',
          size: '14',
          image: 'https://example.com/a.jpg',
          unitPriceInKobo: totalInKobo,
          quantity: 1,
          totalPriceInKobo: totalInKobo,
        },
      ],
      customer: { email: 'refund-test@example.com', firstName: 'Test', lastName: 'Buyer', phone: '+2348000000000' },
      shippingAddress: {
        firstName: 'Test',
        lastName: 'Buyer',
        email: 'refund-test@example.com',
        phone: '+2348000000000',
        address: '1 Test Street',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
      },
      deliveryZoneId: zoneId,
      deliveryFeeInKobo: 0,
      subtotalInKobo: totalInKobo,
      discountInKobo: 0,
      totalInKobo,
      currency: 'NGN',
      paymentMethod: 'paystack',
    });
    createdOrderIds.push(order.id);

    // Every order carries its own reference — verification now requires the
    // supplied reference to match the one stored against that order.
    await db.setOrderPaymentReference(order.id, `pstk_ref_${order.id}`, 'paystack');

    if (!options.leaveUnpaid) {
      await db.updateOrderStatus(order.id, 'PAID');
      await db.setOrderPaymentId(order.id, `pstk_txn_${order.id}`, new Date().toISOString());
    }
    return order.id;
  }

  it('fully refunds an order when no amount is given', async () => {
    const orderId = await createPaidOrder(1_000_000);
    const { order } = await paymentService.refundOrder(orderId, undefined, 'test-admin@deniqwears.com');
    expect(order.status).toBe('REFUNDED');
  });

  it('partially refunds an order when a smaller amount is given', async () => {
    const orderId = await createPaidOrder(1_000_000);
    const { order } = await paymentService.refundOrder(orderId, 400_000, 'test-admin@deniqwears.com');
    expect(order.status).toBe('PARTIALLY_REFUNDED');
  });

  it('refuses to confirm an order using a payment reference belonging to another order', async () => {
    // Order A is genuinely paid with its own reference.
    const orderAId = await createPaidOrder(1_000_000);
    const orderA = (await db.getOrderById(orderAId))!;

    // Order B is a separate, unpaid order of the same value.
    const orderBId = await createPaidOrder(1_000_000, { leaveUnpaid: true });

    // Replaying A's reference against B must be rejected, not accepted just
    // because the amounts happen to match.
    await expect(paymentService.verifyPayment(orderA.paymentReference!, orderBId)).rejects.toThrow(
      /does not belong to order/
    );

    const orderB = (await db.getOrderById(orderBId))!;
    expect(orderB.status).not.toBe('PAID');
  });

  it('accumulates partial refunds and flips to REFUNDED once fully covered', async () => {
    const orderId = await createPaidOrder(1_000_000);

    const first = await paymentService.refundOrder(orderId, 400_000, 'test-admin@deniqwears.com');
    expect(first.order.status).toBe('PARTIALLY_REFUNDED');
    expect(first.order.refundedInKobo).toBe(400_000);

    const second = await paymentService.refundOrder(orderId, 600_000, 'test-admin@deniqwears.com');
    expect(second.order.status).toBe('REFUNDED');
    expect(second.order.refundedInKobo).toBe(1_000_000);
  });

  it('refuses to refund more than the amount still outstanding after a partial refund', async () => {
    const orderId = await createPaidOrder(1_000_000);
    await paymentService.refundOrder(orderId, 700_000, 'test-admin@deniqwears.com');

    // Only ₦3,000 remains; refunding ₦5,000 more would over-refund the customer.
    await expect(
      paymentService.refundOrder(orderId, 500_000, 'test-admin@deniqwears.com')
    ).rejects.toThrow(/still refundable/);
  });

  it('does not record a refund the gateway has not settled', async () => {
    // The showroom provider always reports `pending` — no money has moved, so
    // the order must not be marked refunded and the books must not change.
    const order = await db.createOrder({
      idempotencyKey: `refund-test-showroom-${Date.now()}`,
      status: 'PENDING_PAYMENT',
      items: [],
      customer: { email: 'refund-test@example.com', firstName: 'Test', lastName: 'Buyer', phone: '+2348000000000' },
      shippingAddress: {
        firstName: 'Test',
        lastName: 'Buyer',
        email: 'refund-test@example.com',
        phone: '+2348000000000',
        address: '1 Test Street',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
      },
      deliveryZoneId: zoneId,
      deliveryFeeInKobo: 0,
      subtotalInKobo: 500_000,
      discountInKobo: 0,
      totalInKobo: 500_000,
      currency: 'NGN',
      paymentMethod: 'showroom',
    });
    createdOrderIds.push(order.id);
    await db.setOrderPaymentReference(order.id, `showroom_ref_${order.id}`, 'showroom');
    await db.updateOrderStatus(order.id, 'PAID');
    await db.setOrderPaymentId(order.id, `pos_${order.id}`, new Date().toISOString());

    await expect(
      paymentService.refundOrder(order.id, 200_000, 'test-admin@deniqwears.com')
    ).rejects.toThrow(/not settled/);

    const after = (await db.getOrderById(order.id))!;
    expect(after.refundedInKobo).toBe(0);
    expect(after.status).toBe('PAID');
  });

  it('lets only one of two concurrent refunds spend the same remaining balance', async () => {
    const orderId = await createPaidOrder(1_000_000);

    const results = await Promise.allSettled([
      paymentService.refundOrder(orderId, 1_000_000, 'test-admin@deniqwears.com'),
      paymentService.refundOrder(orderId, 1_000_000, 'test-admin@deniqwears.com'),
    ]);

    const settled = results.filter((r) => r.status === 'fulfilled');
    expect(settled).toHaveLength(1);

    // Never more than the order total, whichever request won.
    const order = (await db.getOrderById(orderId))!;
    expect(order.refundedInKobo).toBe(1_000_000);
  });

  it('rejects a refund larger than the order total', async () => {
    const orderId = await createPaidOrder(1_000_000);
    await expect(
      paymentService.refundOrder(orderId, 2_000_000, 'test-admin@deniqwears.com')
    ).rejects.toThrow(/no more than the order total/);
  });

  it('rejects refunding an order that was never paid', async () => {
    const order = await db.createOrder({
      idempotencyKey: `refund-test-unpaid-${Date.now()}`,
      status: 'PENDING_PAYMENT',
      items: [],
      customer: { email: 'refund-test@example.com', firstName: 'Test', lastName: 'Buyer', phone: '+2348000000000' },
      shippingAddress: {
        firstName: 'Test',
        lastName: 'Buyer',
        email: 'refund-test@example.com',
        phone: '+2348000000000',
        address: '1 Test Street',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
      },
      deliveryZoneId: zoneId,
      deliveryFeeInKobo: 0,
      subtotalInKobo: 0,
      discountInKobo: 0,
      totalInKobo: 500_000,
      currency: 'NGN',
      paymentMethod: 'showroom',
    });
    createdOrderIds.push(order.id);

    await expect(
      paymentService.refundOrder(order.id, undefined, 'test-admin@deniqwears.com')
    ).rejects.toThrow(/cannot be refunded from status/);
  });
});
