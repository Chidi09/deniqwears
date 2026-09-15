// Audit evidence: these assertions confirm current defects, not desired behavior.
// No database access, outbound network calls, or email delivery.
import React from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryObserver } from '@tanstack/react-query';
import { NextRequest } from 'next/server';
import { ProductCard } from '../src/components/ProductCard';
import { AsymmetricShowcase } from '../src/components/AsymmetricShowcase';
import { ShopPage } from '../src/components/ShopPage';
import { QuickAddModal } from '../src/components/QuickAddModal';
import { PRODUCTS, formatPrice } from '../src/data/products';
import { Product } from '../src/types';
import { Order } from '../server/types';
import { PaymentService } from '../server/payment/service';
import { PaymentProvider } from '../server/payment/types';
import { db } from '../server/db';
import { GET as getOrder } from '../src/app/api/orders/[id]/route';
import { GET as getProduct } from '../src/app/api/products/[slug]/route';
import { POST as checkout } from '../src/app/api/checkout/route';
import { ProductCreateUpdateSchema } from '../src/lib/schemas';

vi.mock('next/server', async (original) => ({ ...await original<typeof import('next/server')>(), after: vi.fn() }));
vi.mock('../server/db', () => ({ db: {
  getOrderById: vi.fn(), updateOrderStatus: vi.fn(), setOrderPaymentId: vi.fn(),
  recordOrderRefund: vi.fn(), getProductBySlug: vi.fn(), hasIdempotencyKey: vi.fn(),
  getProductById: vi.fn(), getSettings: vi.fn(), createOrder: vi.fn(),
  setOrderPaymentReference: vi.fn(),
} }));

const noOp = () => {};
const liveProduct = { ...PRODUCTS[0], id: 'real-product-id', price: undefined, priceInKobo: 4_800_000 };
const order = {
  id: 'order-b', orderNumber: 'DNQ-12345', status: 'PAYMENT_PROCESSING',
  paymentMethod: 'paystack', paymentReference: 'reference-b', paymentId: 'txn-b',
  totalInKobo: 4_800_000, refundedInKobo: 0, currency: 'NGN',
  customer: { email: 'private@example.com' }, shippingAddress: { address: 'Private address' },
} as Order;

function service(result: Record<string, unknown> = {}) {
  const instance = new PaymentService();
  const provider = {
    id: 'paystack', name: 'Audit stub',
    verifyPayment: vi.fn().mockResolvedValue({ success: true, amountInKobo: order.totalInKobo,
      currency: 'NGN', transactionId: 'transaction-a', ...result }),
    refundPayment: vi.fn().mockResolvedValue({ success: true, refundId: 'refund-a', status: 'pending' }),
  } as unknown as PaymentProvider;
  instance.registerProvider(provider);
  return { instance, provider };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(db.getOrderById).mockResolvedValue({ ...order });
  vi.mocked(db.updateOrderStatus).mockImplementation(async (_id, status) => ({ ...order, status }));
});

it('live API shape crashes product cards because price is absent', () => {
  expect(() => renderToStaticMarkup(<ProductCard product={liveProduct} onSelect={noOp} onQuickAdd={noOp} />)).toThrow();
});

it('currency guessing displays 50,000 kobo as 50,000 naira', () => {
  expect(formatPrice(50_000)).toBe('₦50,000');
});

it('currency guessing displays 150,000 naira as 1,500 naira', () => {
  expect(formatPrice(150_000)).toBe('₦1,500');
});

it('home showcase crashes with one live garment', () => {
  expect(() => renderToStaticMarkup(<AsymmetricShowcase products={[PRODUCTS[0]]} onSelectProduct={noOp} onQuickAdd={noOp} />)).toThrow();
});

it('invalid category query crashes the shop', () => {
  expect(() => renderToStaticMarkup(<ShopPage products={PRODUCTS} initialCategory={'invalid' as Product['category']} onSelectProduct={noOp} onQuickAdd={noOp} />)).toThrow();
});

it('empty colors allowed by create schema crash quick add', () => {
  const payload = { name: 'Empty garment', category: 'dresses', priceInKobo: 10000, primaryImage: 'https://example.com/a.jpg' };
  expect(ProductCreateUpdateSchema.safeParse(payload).success).toBe(true);
  expect(() => renderToStaticMarkup(<QuickAddModal product={{ ...PRODUCTS[0], colors: [], sizes: [] }} onClose={noOp} onAddToCart={noOp} onViewProductDetails={noOp} />)).toThrow();
});

it('demo initialData suppresses the first real catalog fetch', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: 120000, refetchOnWindowFocus: false } } });
  const fetchProducts = vi.fn().mockResolvedValue([liveProduct]);
  const observer = new QueryObserver(client, { queryKey: ['products', 'all'], queryFn: fetchProducts, initialData: PRODUCTS });
  const unsubscribe = observer.subscribe(noOp);
  await Promise.resolve();
  expect(fetchProducts).not.toHaveBeenCalled();
  expect(observer.getCurrentResult().data).toEqual(PRODUCTS);
  unsubscribe();
  client.clear();
});

it('transaction A can mark unrelated same-price order B paid', async () => {
  const { instance } = service();
  expect((await instance.verifyPayment('reference-a', 'order-b')).success).toBe(true);
  expect(db.setOrderPaymentId).toHaveBeenCalledWith('order-b', 'transaction-a', expect.any(String));
});

it('successful zero-amount verification bypasses amount matching', async () => {
  const { instance } = service({ amountInKobo: 0 });
  expect((await instance.verifyPayment('reference-b', 'order-b')).success).toBe(true);
});

it('successful different-currency verification is accepted', async () => {
  const { instance } = service({ currency: 'USD' });
  expect((await instance.verifyPayment('reference-b', 'order-b')).success).toBe(true);
});

it('refunded orders are changed back to PAID by verification replay', async () => {
  vi.mocked(db.getOrderById).mockResolvedValue({ ...order, status: 'REFUNDED', refundedInKobo: order.totalInKobo });
  const { instance } = service();
  expect((await instance.verifyPayment('reference-b', 'order-b')).order.status).toBe('PAID');
});

it('pending gateway refunds are immediately recorded as fully refunded', async () => {
  vi.mocked(db.getOrderById).mockResolvedValue({ ...order, status: 'PAID' });
  const { instance } = service();
  expect((await instance.refundOrder('order-b', undefined, 'audit@example.com')).order.status).toBe('REFUNDED');
  expect(db.recordOrderRefund).toHaveBeenCalledWith('order-b', order.totalInKobo);
});

it('concurrent refunds both spend the same remaining balance', async () => {
  vi.mocked(db.getOrderById).mockResolvedValue({ ...order, status: 'PAID' });
  const { instance, provider } = service();
  await Promise.all([instance.refundOrder('order-b', 3_000_000, 'audit'), instance.refundOrder('order-b', 3_000_000, 'audit')]);
  expect(provider.refundPayment).toHaveBeenCalledTimes(2);
  expect(db.recordOrderRefund).toHaveBeenCalledTimes(2);
});

it('public order lookup returns customer data without credentials', async () => {
  const response = await getOrder(new NextRequest('http://localhost/api/orders/DNQ-12345'), { params: Promise.resolve({ id: 'DNQ-12345' }) });
  expect(response.status).toBe(200);
  expect((await response.json()).order.customer.email).toBe('private@example.com');
});

it('draft product details are returned publicly', async () => {
  vi.mocked(db.getProductBySlug).mockResolvedValue({ ...liveProduct, status: 'draft' } as never);
  const response = await getProduct(new NextRequest('http://localhost/api/products/draft'), { params: Promise.resolve({ slug: 'draft' }) });
  expect(response.status).toBe(200);
});

it('checkout accepts a disabled provider and unknown delivery zone', async () => {
  vi.mocked(db.hasIdempotencyKey).mockResolvedValue(false);
  vi.mocked(db.getProductById).mockResolvedValue({ ...liveProduct, status: 'live', variants: [{ id: 'variant', color: 'Black', size: '12', stock: 1, active: true }] } as never);
  vi.mocked(db.getSettings).mockResolvedValue({ freeDeliveryThresholdInKobo: 100_000_000,
    deliveryZones: [{ id: 'first-zone', feeInKobo: 0 }], paymentProviders: { showroomCollection: false } } as never);
  vi.mocked(db.createOrder).mockResolvedValue({ ...order, paymentMethod: 'showroom' });
  const contact = { firstName: 'Test', lastName: 'Buyer', email: 'audit@example.com', phone: '123456' };
  const response = await checkout(new NextRequest('http://localhost/api/checkout', { method: 'POST', body: JSON.stringify({
    items: [{ productId: liveProduct.id, variantId: 'variant', quantity: 1 }, { productId: liveProduct.id, variantId: 'variant', quantity: 1 }],
    customer: contact, shippingAddress: { ...contact, address: 'Street', city: 'Abuja', state: 'FCT' },
    deliveryZoneId: 'nonexistent', paymentMethod: 'showroom',
  }) }));
  expect(response.status).toBe(201);
  expect(db.createOrder).toHaveBeenCalledWith(expect.objectContaining({ deliveryZoneId: 'first-zone', subtotalInKobo: 9_600_000 }));
});
