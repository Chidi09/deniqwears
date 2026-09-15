import { http, HttpResponse } from 'msw';
import { MOCK_PRODUCTS, MOCK_SETTINGS, MOCK_DISCOUNTS } from './fixtures';
import type { Order, ShippingAddress } from '../../server/types';

interface MockCheckoutBody {
  items: Array<{ productId: string; variantId: string; quantity: number }>;
  customer: Order['customer'];
  shippingAddress: ShippingAddress;
  deliveryZoneId: string;
  paymentMethod: Order['paymentMethod'];
  idempotencyKey?: string;
}

// Mock backend state. Persisted to sessionStorage because mock checkout
// returns a redirect URL and `window.location.href` reloads the page — a
// module-level Map was emptied by that reload, so verification could never
// find the order the mock had just created.
const STORAGE_KEY = 'deniq_mock_orders';

function loadOrders(): Map<string, Order> {
  if (typeof sessionStorage === 'undefined') return new Map();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? new Map(Object.entries(JSON.parse(raw) as Record<string, Order>)) : new Map();
  } catch {
    return new Map();
  }
}

function saveOrders(orders: Map<string, Order>): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(orders)));
  } catch {
    // Non-fatal: mocking is a dev convenience.
  }
}

const mockOrders = loadOrders();
let orderSeq = 90000 + mockOrders.size;

function findProduct(idOrSlug: string) {
  return MOCK_PRODUCTS.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
}

/**
 * Handlers mirroring the app's own /api/* routes, for local frontend
 * development without a configured DATABASE_URL. Enabled only via
 * NEXT_PUBLIC_API_MOCKING=enabled (see src/mocks/browser.ts) — never runs
 * in a production build.
 */
export const apiHandlers = [
  http.get('/api/products', () => {
    return HttpResponse.json({ products: MOCK_PRODUCTS.filter((p) => p.status === 'live') });
  }),

  http.get('/api/products/:slug', ({ params }) => {
    const product = findProduct(params.slug as string);
    if (!product || product.status === 'archived') {
      return HttpResponse.json({ error: 'Garment not found' }, { status: 404 });
    }
    return HttpResponse.json({ product });
  }),

  http.get('/api/settings', () => {
    return HttpResponse.json({ settings: MOCK_SETTINGS });
  }),

  http.post('/api/discounts/validate', async ({ request }) => {
    const { code, subtotalInKobo } = (await request.json()) as { code: string; subtotalInKobo: number };
    const discount = MOCK_DISCOUNTS.find((d) => d.code.toUpperCase() === code.trim().toUpperCase() && d.active);
    if (!discount) {
      return HttpResponse.json({ error: 'Invalid or expired promotional code' }, { status: 404 });
    }
    if (discount.minSpendInKobo && subtotalInKobo < discount.minSpendInKobo) {
      return HttpResponse.json(
        { error: `Promotion requires a minimum bag value of ₦${(discount.minSpendInKobo / 100).toLocaleString()}` },
        { status: 400 }
      );
    }
    const discountInKobo =
      discount.type === 'percentage'
        ? Math.round((subtotalInKobo * discount.value) / 100)
        : Math.min(discount.value, subtotalInKobo);
    return HttpResponse.json({ valid: true, code: discount.code, type: discount.type, discountInKobo });
  }),

  http.post('/api/checkout', async ({ request }) => {
    const body = (await request.json()) as MockCheckoutBody;
    let subtotalInKobo = 0;
    const items = body.items.map((item) => {
      const product = findProduct(item.productId);
      const variant = product?.variants.find((v) => v.id === item.variantId);
      const unitPriceInKobo = variant?.priceInKobo || product?.priceInKobo || 0;
      const totalPriceInKobo = unitPriceInKobo * item.quantity;
      subtotalInKobo += totalPriceInKobo;
      return {
        id: `mock-item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        productId: item.productId,
        variantId: item.variantId,
        name: product?.name ?? 'Unknown item',
        color: variant?.color ?? '',
        size: variant?.size ?? '',
        image: product?.primaryImage ?? '',
        unitPriceInKobo,
        quantity: item.quantity,
        totalPriceInKobo,
      };
    });

    const deliveryFeeInKobo =
      subtotalInKobo >= MOCK_SETTINGS.freeDeliveryThresholdInKobo
        ? 0
        : MOCK_SETTINGS.deliveryZones.find((z) => z.id === body.deliveryZoneId)?.feeInKobo ?? 0;

    const totalInKobo = subtotalInKobo + deliveryFeeInKobo;
    const id = `mock-ord-${Date.now()}`;
    orderSeq += 1;

    const order: Order = {
      id,
      orderNumber: `DNQ-${orderSeq}`,
      idempotencyKey: body.idempotencyKey ?? `mock-idemp-${Date.now()}`,
      status: 'PENDING_PAYMENT',
      items,
      customer: body.customer,
      shippingAddress: { ...body.shippingAddress, country: body.shippingAddress.country || 'Nigeria' },
      deliveryZoneId: body.deliveryZoneId,
      deliveryFeeInKobo,
      subtotalInKobo,
      discountInKobo: 0,
      totalInKobo,
      refundedInKobo: 0,
      currency: 'NGN',
      paymentMethod: body.paymentMethod,
      timeline: [
        {
          id: `mock-tl-${Date.now()}`,
          status: 'PENDING_PAYMENT',
          title: 'Order Created',
          description: 'Order initiated at checkout (mocked)',
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockOrders.set(id, order);
    saveOrders(mockOrders);

    return HttpResponse.json(
      {
        order,
        paymentSession: {
          provider: body.paymentMethod,
          reference: `mock_ref_${Date.now()}`,
          authorizationUrl: `/checkout?reference=mock_ref_${Date.now()}&orderId=${id}&simulated=true`,
          amountInKobo: totalInKobo,
          currency: 'NGN',
          expiresAt: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
        },
      },
      { status: 201 }
    );
  }),

  http.post('/api/payments/verify', async ({ request }) => {
    const { orderId } = (await request.json()) as { reference: string; orderId: string };
    const order = mockOrders.get(orderId);
    if (!order) return HttpResponse.json({ error: 'Order not found' }, { status: 404 });

    order.status = 'PAID';
    order.paidAt = new Date().toISOString();
    order.timeline.push({
      id: `mock-tl-${Date.now()}`,
      status: 'PAID',
      title: 'Status: PAID',
      description: 'Payment verified successfully (mocked)',
      timestamp: new Date().toISOString(),
    });
    saveOrders(mockOrders);

    return HttpResponse.json({ success: true, order, message: 'Payment confirmed successfully (mocked)' });
  }),

  http.get('/api/orders/:id', ({ params }) => {
    const order = mockOrders.get(params.id as string);
    if (!order) return HttpResponse.json({ error: 'Order not found' }, { status: 404 });
    return HttpResponse.json({ order });
  }),
];
