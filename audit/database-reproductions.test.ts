// Isolated database-boundary evidence. Prisma is mocked; no rows are changed.
import { beforeEach, expect, it, vi } from 'vitest';
import { db } from '../server/db';
import { prisma } from '../server/prisma';

vi.mock('../server/prisma', () => {
  const client = {
    product: { findUnique: vi.fn(), update: vi.fn() },
    productVariant: { update: vi.fn(), create: vi.fn(), updateMany: vi.fn(), findUnique: vi.fn(), deleteMany: vi.fn() },
    order: { findFirst: vi.fn(), update: vi.fn() },
    adminActivityLog: { create: vi.fn() },
    $transaction: vi.fn(),
  };
  client.$transaction.mockImplementation((fn) => fn(client));
  return { prisma: client };
});

const variants = [
  { id: 'variant-a', color: 'Black', size: '12', stock: 0, active: true },
  { id: 'variant-b', color: 'Black', size: '14', stock: 0, active: true },
];
const product = { id: 'product', name: 'Garment', priceInKobo: 10000, variants, colors: [],
  createdAt: new Date(), updatedAt: new Date() };
const orderRow = { id: 'order', status: 'PAYMENT_PROCESSING',
  items: [{ variantId: 'variant-a', quantity: 3 }], timeline: [], createdAt: new Date(), updatedAt: new Date() };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.product.findUnique).mockResolvedValue(product as never);
  vi.mocked(prisma.product.update).mockResolvedValue(product as never);
  vi.mocked(prisma.order.findFirst).mockResolvedValue(orderRow as never);
  vi.mocked(prisma.order.update).mockResolvedValue({ ...orderRow, status: 'PAID' } as never);
  vi.mocked(prisma.productVariant.findUnique).mockResolvedValue({ ...variants[0], stock: -3 } as never);
});

it('quick edit total stock zero actually writes one unit per variant', async () => {
  await db.quickUpdatePricesAndStock([{ productId: 'product', totalStock: 0 }], 'audit');
  expect(prisma.productVariant.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ stock: 1 }) }));
  expect(prisma.productVariant.update).toHaveBeenCalledTimes(2);
});

it('removing variants from the submitted list never removes stored rows', async () => {
  await db.updateProduct('product', { variants: [] }, 'audit');
  expect(prisma.productVariant.deleteMany).not.toHaveBeenCalled();
  expect(prisma.productVariant.update).not.toHaveBeenCalled();
});

it('new editor-generated variant IDs go down the update-only path', async () => {
  await db.updateProduct('product', { variants: [{ ...variants[0], id: 'v-new-client-id' }] }, 'audit');
  expect(prisma.productVariant.create).not.toHaveBeenCalled();
  expect(prisma.productVariant.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'v-new-client-id' } }));
});

it('payment completion decrements stock even at zero then clamps away the deficit', async () => {
  await db.updateOrderStatus('order', 'PAID');
  expect(prisma.productVariant.updateMany).toHaveBeenCalledWith({ where: { id: 'variant-a', stock: { gte: 0 } }, data: { stock: { decrement: 3 } } });
  expect(prisma.productVariant.update).toHaveBeenCalledWith({ where: { id: 'variant-a' }, data: { stock: 0 } });
});

it('two callers observing an unpaid order both decrement inventory', async () => {
  await Promise.all([db.updateOrderStatus('order', 'PAID'), db.updateOrderStatus('order', 'PAID')]);
  expect(prisma.productVariant.updateMany).toHaveBeenCalledTimes(2);
});
