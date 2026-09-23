import { randomBytes } from 'node:crypto';
import { Prisma, ProductStatus as PrismaProductStatus } from '@prisma/client';
import { prisma } from './prisma';
import { parsePromotions } from '../src/lib/promotions';
import {
  Product,
  ProductColor,
  ProductVariant,
  Order,
  OrderStatus,
  ShippingAddress,
  StoreSettings,
  DiscountCode,
  AdminActivityLog,
  COLLECTED_STATUSES,
  FinanceSummary,
  RevenuePoint,
  PaymentMethodTotal,
  TopProduct,
} from './types';
import { formatMoney } from '../src/lib/money';

const SETTINGS_ID = 'singleton';

// --- Mappers: Prisma rows -> domain shapes ---

type ProductWithVariants = Prisma.ProductGetPayload<{ include: { variants: true } }>;

function mapVariant(v: ProductWithVariants['variants'][number]): ProductVariant {
  return {
    id: v.id,
    color: v.color,
    size: v.size,
    sku: v.sku,
    priceInKobo: v.priceInKobo,
    stock: v.stock,
    active: v.active,
  };
}

function mapProduct(p: ProductWithVariants): Product {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    priceInKobo: p.priceInKobo,
    status: p.status,
    category: p.category,
    collection: p.collection,
    colors: (p.colors as unknown as ProductColor[]) ?? [],
    sizes: p.sizes,
    variants: p.variants.map(mapVariant),
    primaryImage: p.primaryImage,
    secondaryImage: p.secondaryImage,
    galleryImages: p.galleryImages,
    badge: p.badge,
    rating: p.rating,
    reviewsCount: p.reviewsCount,
    stockWarning: p.stockWarning,
    description: p.description,
    fitAndSize: p.fitAndSize,
    delivery: p.delivery,
    care: p.care,
    editorialSubtitle: p.editorialSubtitle,
    isNewArrival: p.isNewArrival,
    isSignatureSelection: p.isSignatureSelection,
    isAsymmetricFeature: p.isAsymmetricFeature,
    asymmetricRole: p.asymmetricRole,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: { items: true; timeline: true };
}>;

function mapOrder(o: OrderWithRelations): Order {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    idempotencyKey: o.idempotencyKey,
    status: o.status,
    items: o.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      variantId: i.variantId,
      name: i.name,
      color: i.color,
      size: i.size,
      image: i.image,
      unitPriceInKobo: i.unitPriceInKobo,
      quantity: i.quantity,
      totalPriceInKobo: i.totalPriceInKobo,
    })),
    customer: {
      email: o.customerEmail,
      firstName: o.customerFirstName,
      lastName: o.customerLastName,
      phone: o.customerPhone,
    },
    shippingAddress: o.shippingAddress as unknown as ShippingAddress,
    deliveryZoneId: o.deliveryZoneId,
    deliveryFeeInKobo: o.deliveryFeeInKobo,
    subtotalInKobo: o.subtotalInKobo,
    discountInKobo: o.discountInKobo,
    discountCodeId: o.discountCodeId,
    totalInKobo: o.totalInKobo,
    refundedInKobo: o.refundedInKobo,
    currency: o.currency as 'NGN' | 'USD',
    paymentMethod: o.paymentMethod,
    paymentReference: o.paymentReference,
    paymentId: o.paymentId,
    paidAt: o.paidAt?.toISOString() ?? null,
    dispatchedAt: o.dispatchedAt?.toISOString() ?? null,
    notes: o.notes,
    timeline: o.timeline
      .slice()
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .map((t) => ({
        id: t.id,
        status: t.status,
        title: t.title,
        description: t.description,
        timestamp: t.timestamp.toISOString(),
      })),
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  };
}

function mapSettings(
  s: Awaited<ReturnType<typeof prisma.storeSettings.findUniqueOrThrow>>,
  deliveryZones: Awaited<ReturnType<typeof prisma.deliveryZone.findMany>>
): StoreSettings {
  return {
    storeName: s.storeName,
    supportEmail: s.supportEmail,
    supportWhatsApp: s.supportWhatsApp,
    currency: 'USD',
    freeDeliveryThresholdInKobo: s.freeDeliveryThresholdInKobo,
    returnPeriodDays: s.returnPeriodDays,
    deliveryZones: deliveryZones.map((z) => ({
      id: z.id,
      name: z.name,
      feeInKobo: z.feeInKobo,
      estimatedDelivery: z.estimatedDelivery,
      description: z.description,
      active: z.active,
    })),
    paymentProviders: {
      paystack: s.paystackEnabled,
      flutterwave: s.flutterwaveEnabled,
      stripe: s.stripeEnabled,
      showroomCollection: s.showroomCollectionEnabled,
    },
    promotions: parsePromotions(s.promotions),
  };
}

function mapDiscount(d: Awaited<ReturnType<typeof prisma.discountCode.findFirst>>): DiscountCode | undefined {
  if (!d) return undefined;
  return {
    id: d.id,
    code: d.code,
    type: d.type,
    value: d.value,
    minSpendInKobo: d.minSpendInKobo,
    active: d.active,
    usageCount: d.usageCount,
  };
}

function mapActivityLog(l: Awaited<ReturnType<typeof prisma.adminActivityLog.findMany>>[number]): AdminActivityLog {
  return {
    id: l.id,
    timestamp: l.timestamp.toISOString(),
    adminEmail: l.adminEmail,
    action: l.action,
    entityType: l.entityType,
    entityId: l.entityId,
    details: l.details,
  };
}

const PRODUCT_INCLUDE = { variants: true } satisfies Prisma.ProductInclude;
const ORDER_INCLUDE = { items: true, timeline: true } satisfies Prisma.OrderInclude;

export const db = {
  // --- PRODUCTS ---
  async getProducts(includeDraftsAndArchived = false): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: includeDraftsAndArchived ? undefined : { status: PrismaProductStatus.live },
      include: PRODUCT_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return products.map(mapProduct);
  },

  async getProductById(id: string): Promise<Product | undefined> {
    const product = await prisma.product.findUnique({ where: { id }, include: PRODUCT_INCLUDE });
    return product ? mapProduct(product) : undefined;
  },

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const product = await prisma.product.findUnique({ where: { slug }, include: PRODUCT_INCLUDE });
    return product ? mapProduct(product) : undefined;
  },

  async createProduct(
    data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'variants'> & { variants?: Omit<ProductVariant, 'id'>[] },
    adminEmail: string
  ): Promise<Product> {
    const created = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug || slugify(data.name),
        priceInKobo: data.priceInKobo,
        status: data.status,
        category: data.category,
        collection: data.collection,
        colors: data.colors as unknown as Prisma.InputJsonValue,
        sizes: data.sizes,
        primaryImage: data.primaryImage,
        secondaryImage: data.secondaryImage,
        galleryImages: data.galleryImages,
        badge: data.badge ?? null,
        rating: data.rating ?? 0,
        reviewsCount: data.reviewsCount ?? 0,
        stockWarning: data.stockWarning,
        description: data.description,
        fitAndSize: data.fitAndSize,
        delivery: data.delivery,
        care: data.care,
        editorialSubtitle: data.editorialSubtitle,
        isNewArrival: data.isNewArrival ?? false,
        isSignatureSelection: data.isSignatureSelection ?? false,
        isAsymmetricFeature: data.isAsymmetricFeature ?? false,
        asymmetricRole: data.asymmetricRole ?? null,
        variants: data.variants?.length
          ? {
              create: data.variants.map((v) => ({
                color: v.color,
                size: v.size,
                sku: v.sku,
                priceInKobo: v.priceInKobo,
                stock: v.stock,
                active: v.active,
              })),
            }
          : undefined,
      },
      include: PRODUCT_INCLUDE,
    });

    await db.logActivity({
      adminEmail,
      action: 'Product created',
      entityType: 'product',
      entityId: created.id,
      details: `Created new product "${created.name}" at ${formatMoney(created.priceInKobo)}`,
    });

    return mapProduct(created);
  },

  async updateProduct(
    id: string,
    updates: Partial<Omit<Product, 'variants'>> & { variants?: ProductVariant[] },
    adminEmail: string
  ): Promise<Product | null> {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return null;

    const updated = await prisma.$transaction(async (tx) => {
      if (updates.variants) {
        // Reconcile against what's actually stored, scoped to THIS product.
        // Previously: any row carrying an id was assumed to exist (so a new
        // row with a client-generated `v-...` id failed to save), updates were
        // filtered by variant id alone (so a bad payload could edit another
        // product's variants), and omitted rows were left untouched and
        // silently purchasable after being removed in the editor.
        const storedVariants = await tx.productVariant.findMany({ where: { productId: id } });
        const storedIds = new Set(storedVariants.map((v) => v.id));
        const submittedIds = new Set<string>();

        for (const v of updates.variants) {
          const isExisting = v.id && storedIds.has(v.id);

          if (isExisting) {
            submittedIds.add(v.id!);
            await tx.productVariant.updateMany({
              // Scoped by productId so an id from another product can't match.
              where: { id: v.id!, productId: id },
              data: {
                color: v.color,
                size: v.size,
                sku: v.sku,
                priceInKobo: v.priceInKobo,
                stock: v.stock,
                active: v.active,
              },
            });
          } else {
            const created = await tx.productVariant.create({
              data: {
                productId: id,
                color: v.color,
                size: v.size,
                sku: v.sku,
                priceInKobo: v.priceInKobo,
                stock: v.stock,
                active: v.active,
              },
            });
            submittedIds.add(created.id);
          }
        }

        // Variants removed in the editor are deactivated, not deleted —
        // historical order items reference them by foreign key.
        const removedIds = storedVariants.filter((v) => !submittedIds.has(v.id)).map((v) => v.id);
        if (removedIds.length > 0) {
          await tx.productVariant.updateMany({
            where: { id: { in: removedIds }, productId: id },
            data: { active: false },
          });
        }
      }

      return tx.product.update({
        where: { id },
        data: {
          ...(updates.name !== undefined && { name: updates.name }),
          ...(updates.slug !== undefined && { slug: updates.slug }),
          ...(updates.priceInKobo !== undefined && { priceInKobo: updates.priceInKobo }),
          ...(updates.status !== undefined && { status: updates.status }),
          ...(updates.category !== undefined && { category: updates.category }),
          ...(updates.collection !== undefined && { collection: updates.collection }),
          ...(updates.colors !== undefined && { colors: updates.colors as unknown as Prisma.InputJsonValue }),
          ...(updates.sizes !== undefined && { sizes: updates.sizes }),
          ...(updates.primaryImage !== undefined && { primaryImage: updates.primaryImage }),
          ...(updates.secondaryImage !== undefined && { secondaryImage: updates.secondaryImage }),
          ...(updates.galleryImages !== undefined && { galleryImages: updates.galleryImages }),
          ...(updates.badge !== undefined && { badge: updates.badge }),
          ...(updates.stockWarning !== undefined && { stockWarning: updates.stockWarning }),
          ...(updates.description !== undefined && { description: updates.description }),
          ...(updates.fitAndSize !== undefined && { fitAndSize: updates.fitAndSize }),
          ...(updates.delivery !== undefined && { delivery: updates.delivery }),
          ...(updates.care !== undefined && { care: updates.care }),
          ...(updates.editorialSubtitle !== undefined && { editorialSubtitle: updates.editorialSubtitle }),
          ...(updates.isNewArrival !== undefined && { isNewArrival: updates.isNewArrival }),
          ...(updates.isSignatureSelection !== undefined && { isSignatureSelection: updates.isSignatureSelection }),
          ...(updates.isAsymmetricFeature !== undefined && { isAsymmetricFeature: updates.isAsymmetricFeature }),
          ...(updates.asymmetricRole !== undefined && { asymmetricRole: updates.asymmetricRole }),
        },
        include: PRODUCT_INCLUDE,
      });
    });

    if (updates.priceInKobo !== undefined && updates.priceInKobo !== existing.priceInKobo) {
      await db.logActivity({
        adminEmail,
        action: 'Price changed',
        entityType: 'product',
        entityId: id,
        details: `Price changed for ${updated.name}: ${formatMoney(existing.priceInKobo)} → ${formatMoney(updates.priceInKobo)}`,
      });
    } else {
      await db.logActivity({
        adminEmail,
        action: 'Product updated',
        entityType: 'product',
        entityId: id,
        details: `Updated details for "${updated.name}"`,
      });
    }

    return mapProduct(updated);
  },

  // Routine destruction is Archive rather than permanent delete (preserves order history)
  async archiveProduct(id: string, adminEmail: string): Promise<Product | null> {
    return db.updateProduct(id, { status: 'archived' }, adminEmail);
  },

  async quickUpdatePricesAndStock(
    items: Array<{ productId: string; priceInKobo?: number; totalStock?: number; status?: 'live' | 'draft' | 'archived' }>,
    adminEmail: string
  ): Promise<void> {
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId }, include: PRODUCT_INCLUDE });
      if (!product) continue;

      const updates: Partial<Product> & { variants?: ProductVariant[] } = {};
      if (typeof item.priceInKobo === 'number') updates.priceInKobo = item.priceInKobo;
      if (item.status) updates.status = item.status;
      if (typeof item.totalStock === 'number') {
        // Distribute across ACTIVE variants only, preserving the exact total:
        // the old `Math.max(1, floor(total / count))` wrote at least one unit
        // to every variant (so setting stock to 0 restocked every size) and
        // silently dropped the remainder (5 units over 2 variants became 4).
        const activeVariants = product.variants.filter((v) => v.active);
        if (activeVariants.length > 0) {
          const base = Math.floor(item.totalStock / activeVariants.length);
          let remainder = item.totalStock % activeVariants.length;

          const activeIds = new Set(activeVariants.map((v) => v.id));
          updates.variants = product.variants.map((v) => {
            if (!activeIds.has(v.id)) return mapVariant(v);
            const extra = remainder > 0 ? 1 : 0;
            remainder -= extra;
            return { ...mapVariant(v), stock: base + extra };
          });
        }
      }
      await db.updateProduct(item.productId, updates, adminEmail);
    }
  },

  // --- ORDERS ---
  /**
   * Most recent orders first, bounded. This previously fetched every order
   * with all relations on each admin page load (and the overview endpoint
   * then did it again), which grows without limit as the store trades.
   */
  async getOrders(limit = 200): Promise<Order[]> {
    const orders = await prisma.order.findMany({
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return orders.map(mapOrder);
  },

  async getOrderById(id: string): Promise<Order | undefined> {
    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: ORDER_INCLUDE,
    });
    return order ? mapOrder(order) : undefined;
  },

  async getOrderByPaymentReference(reference: string): Promise<Order | undefined> {
    const order = await prisma.order.findFirst({
      where: { paymentReference: reference },
      include: ORDER_INCLUDE,
    });
    return order ? mapOrder(order) : undefined;
  },

  /** Direct indexed lookup — the previous path loaded every order into memory. */
  async getOrderByIdempotencyKey(key: string): Promise<Order | undefined> {
    const order = await prisma.order.findUnique({
      where: { idempotencyKey: key },
      include: ORDER_INCLUDE,
    });
    return order ? mapOrder(order) : undefined;
  },

  async hasIdempotencyKey(key: string): Promise<boolean> {
    const existing = await prisma.order.findUnique({ where: { idempotencyKey: key } });
    return !!existing;
  },

  async createOrder(
    orderData: Omit<Order, 'id' | 'orderNumber' | 'timeline' | 'createdAt' | 'updatedAt' | 'refundedInKobo'>
  ): Promise<Order> {
    const order = await prisma.$transaction(async (tx) => {
      // Wide enough not to collide in practice, and no check-then-insert race:
      // the old scheme drew from 90,000 values, checked availability before
      // inserting, and after five clashes inserted an unverified number anyway.
      const orderNumber = generateOrderNumber();

      const created = await tx.order.create({
        data: {
          orderNumber,
          idempotencyKey: orderData.idempotencyKey,
          status: orderData.status,
          customerEmail: orderData.customer.email,
          customerFirstName: orderData.customer.firstName,
          customerLastName: orderData.customer.lastName,
          customerPhone: orderData.customer.phone,
          shippingAddress: orderData.shippingAddress as unknown as Prisma.InputJsonValue,
          deliveryZoneId: orderData.deliveryZoneId,
          deliveryFeeInKobo: orderData.deliveryFeeInKobo,
          subtotalInKobo: orderData.subtotalInKobo,
          discountInKobo: orderData.discountInKobo,
          discountCodeId: orderData.discountCodeId ?? null,
          totalInKobo: orderData.totalInKobo,
          currency: orderData.currency,
          paymentMethod: orderData.paymentMethod,
          items: {
            create: orderData.items.map((i) => ({
              productId: i.productId,
              variantId: i.variantId,
              name: i.name,
              color: i.color,
              size: i.size,
              image: i.image,
              unitPriceInKobo: i.unitPriceInKobo,
              quantity: i.quantity,
              totalPriceInKobo: i.totalPriceInKobo,
            })),
          },
          timeline: {
            create: {
              status: orderData.status,
              title: 'Order Created',
              description: `Order initialized for ${orderData.customer.firstName} ${orderData.customer.lastName}`,
            },
          },
        },
        include: ORDER_INCLUDE,
      });

      return created;
    });

    return mapOrder(order);
  },

  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    reason?: string,
    adminEmail?: string
  ): Promise<Order | null> {
    const existing = await prisma.order.findFirst({
      where: { OR: [{ id: orderId }, { orderNumber: orderId }] },
      include: ORDER_INCLUDE,
    });
    if (!existing) return null;

    const updated = await prisma.$transaction(async (tx) => {
      if (newStatus === 'PAID' && existing.status !== 'PAID') {
        // Claim the PAID transition atomically. The status read above happens
        // outside the transaction, so a webhook and a browser callback can both
        // see the same unpaid order; without this guard both would deduct
        // stock, both would append a PAID event and both would email.
        const claimed = await tx.order.updateMany({
          where: { id: existing.id, status: { not: 'PAID' } },
          data: { status: 'PAID' },
        });
        if (claimed.count === 0) {
          throw new OrderAlreadyPaidError(existing.id);
        }

        // Aggregate per variant: one order can list the same variant on
        // several lines, and each line decrementing separately is how a
        // single order oversells a variant.
        const quantityByVariant = new Map<string, number>();
        for (const item of existing.items) {
          quantityByVariant.set(
            item.variantId,
            (quantityByVariant.get(item.variantId) ?? 0) + item.quantity
          );
        }

        for (const [variantId, quantity] of quantityByVariant) {
          // Conditional decrement: only succeeds if the stock is actually
          // there. The old condition was `stock >= 0`, which always matched
          // and then clamped a negative result to zero — concealing the
          // oversell while keeping the customer's money.
          const decremented = await tx.productVariant.updateMany({
            where: { id: variantId, stock: { gte: quantity } },
            data: { stock: { decrement: quantity } },
          });

          if (decremented.count === 0) {
            const variant = await tx.productVariant.findUnique({ where: { id: variantId } });
            throw new InsufficientStockError(variantId, quantity, variant?.stock ?? 0);
          }
        }
      }

      const order = await tx.order.update({
        where: { id: existing.id },
        data: {
          status: newStatus,
          ...(newStatus === 'PAID' && { paidAt: new Date() }),
          ...(newStatus === 'FULFILLED' && { dispatchedAt: new Date() }),
          timeline: {
            create: {
              status: newStatus,
              title: `Status: ${newStatus.replace(/_/g, ' ')}`,
              description: reason || `Order updated to ${newStatus}`,
            },
          },
        },
        include: ORDER_INCLUDE,
      });

      return order;
    });

    if (adminEmail) {
      await db.logActivity({
        adminEmail,
        action: 'Order status updated',
        entityType: 'order',
        entityId: updated.id,
        details: `Order #${updated.orderNumber} transitioned to ${newStatus}`,
      });
    }

    return mapOrder(updated);
  },

  async setOrderPaymentReference(orderId: string, reference: string, paymentMethod: Order['paymentMethod']): Promise<void> {
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentReference: reference, paymentMethod },
    });
  },

  /**
   * Adds to the cumulative refunded total (partial refunds stack).
   *
   * Optimistic concurrency: the write only applies if the stored total is
   * still what the caller read, so two requests can't both spend the same
   * remaining balance. Returns false when it lost the race.
   */
  async recordOrderRefund(
    orderId: string,
    refundedInKobo: number,
    expectedCurrentRefundedInKobo: number
  ): Promise<boolean> {
    const result = await prisma.order.updateMany({
      where: { id: orderId, refundedInKobo: expectedCurrentRefundedInKobo },
      data: { refundedInKobo: { increment: refundedInKobo } },
    });
    return result.count > 0;
  },

  async setOrderPaymentId(orderId: string, paymentId: string, paidAt: string): Promise<void> {
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentId, paidAt: new Date(paidAt) },
    });
  },

  // --- FINANCE / ANALYTICS ---
  // Revenue is recognised on `paidAt` (when money actually arrived), not
  // createdAt, and always reported net of refunds.
  async getFinanceSummary(since: Date): Promise<FinanceSummary> {
    const [collected, pending, awaitingDispatch, lost] = await Promise.all([
      prisma.order.aggregate({
        where: { paidAt: { gte: since }, status: { in: [...COLLECTED_STATUSES] } },
        _sum: {
          totalInKobo: true,
          refundedInKobo: true,
          deliveryFeeInKobo: true,
          discountInKobo: true,
          subtotalInKobo: true,
        },
        _count: { _all: true },
      }),
      prisma.order.aggregate({
        where: { createdAt: { gte: since }, status: { in: ['PENDING_PAYMENT', 'PAYMENT_PROCESSING'] } },
        _sum: { totalInKobo: true },
        _count: { _all: true },
      }),
      prisma.order.count({ where: { status: 'PAID' } }),
      prisma.order.count({
        where: { createdAt: { gte: since }, status: { in: ['PAYMENT_FAILED', 'CANCELLED'] } },
      }),
    ]);

    const grossSalesInKobo = collected._sum.totalInKobo ?? 0;
    const refundedInKobo = collected._sum.refundedInKobo ?? 0;
    const paidOrdersCount = collected._count._all;

    return {
      grossSalesInKobo,
      refundedInKobo,
      netRevenueInKobo: grossSalesInKobo - refundedInKobo,
      merchandiseInKobo: collected._sum.subtotalInKobo ?? 0,
      deliveryFeesInKobo: collected._sum.deliveryFeeInKobo ?? 0,
      discountsGivenInKobo: collected._sum.discountInKobo ?? 0,
      paidOrdersCount,
      averageOrderValueInKobo: paidOrdersCount > 0 ? Math.round(grossSalesInKobo / paidOrdersCount) : 0,
      pendingCollectionInKobo: pending._sum.totalInKobo ?? 0,
      pendingCollectionCount: pending._count._all,
      awaitingDispatchCount: awaitingDispatch,
      failedOrCancelledCount: lost,
    };
  },

  /** Daily net revenue, gap-filled so the chart has a bar per day. */
  async getRevenueSeries(days: number): Promise<RevenuePoint[]> {
    const since = startOfDayUtc(new Date(Date.now() - (days - 1) * 86_400_000));

    const rows = await prisma.$queryRaw<Array<{ day: Date; net: bigint | number }>>`
      SELECT date_trunc('day', "paidAt") AS day,
             COALESCE(SUM("totalInKobo"), 0) - COALESCE(SUM("refundedInKobo"), 0) AS net
      FROM "Order"
      WHERE "paidAt" >= ${since}
        AND "status" IN ('PAID', 'FULFILLED', 'REFUNDED', 'PARTIALLY_REFUNDED')
      GROUP BY 1
      ORDER BY 1
    `;

    const byDay = new Map(rows.map((row) => [startOfDayUtc(row.day).toISOString(), Number(row.net)]));

    return Array.from({ length: days }, (_, index) => {
      const date = startOfDayUtc(new Date(since.getTime() + index * 86_400_000));
      return {
        date: date.toISOString(),
        netRevenueInKobo: byDay.get(date.toISOString()) ?? 0,
      };
    });
  },

  /** How much money arrived through each payment route (cash vs gateway). */
  async getPaymentMethodBreakdown(since: Date): Promise<PaymentMethodTotal[]> {
    const rows = await prisma.$queryRaw<
      Array<{ method: PaymentMethodTotal['method']; net: bigint | number; orders: bigint | number }>
    >`
      SELECT "paymentMethod" AS method,
             COALESCE(SUM("totalInKobo"), 0) - COALESCE(SUM("refundedInKobo"), 0) AS net,
             COUNT(*) AS orders
      FROM "Order"
      WHERE "paidAt" >= ${since}
        AND "status" IN ('PAID', 'FULFILLED', 'REFUNDED', 'PARTIALLY_REFUNDED')
      GROUP BY "paymentMethod"
      ORDER BY net DESC
    `;

    return rows.map((row) => ({
      method: row.method,
      netInKobo: Number(row.net),
      ordersCount: Number(row.orders),
    }));
  },

  /**
   * Line-level totals for products sold in the period. Note this is gross of
   * order-level discounts and of partial refunds — it answers "what sold",
   * not "what we banked"; net revenue is the summary figure for that.
   */
  async getTopProducts(since: Date, limit = 5): Promise<TopProduct[]> {
    const rows = await prisma.$queryRaw<
      Array<{ productId: string; name: string | null; units: bigint | number; revenue: bigint | number }>
    >`
      SELECT i."productId" AS "productId",
             p."name" AS name,
             COALESCE(SUM(i."quantity"), 0) AS units,
             COALESCE(SUM(i."totalPriceInKobo"), 0) AS revenue
      FROM "OrderItem" i
      JOIN "Order" o ON o."id" = i."orderId"
      LEFT JOIN "Product" p ON p."id" = i."productId"
      WHERE o."paidAt" >= ${since}
        -- Fully refunded orders sold nothing in the end, so they must not
        -- inflate a product's units or revenue.
        AND o."status" IN ('PAID', 'FULFILLED', 'PARTIALLY_REFUNDED')
      GROUP BY i."productId", p."name"
      ORDER BY revenue DESC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      productId: row.productId,
      name: row.name ?? 'Removed garment',
      unitsSold: Number(row.units),
      revenueInKobo: Number(row.revenue),
    }));
  },

  // --- STORE SETTINGS ---
  /**
   * Storefront reads get active zones only; admin reads pass
   * includeInactiveZones so a disabled zone can still be seen and re-enabled.
   */
  async getSettings(options: { includeInactiveZones?: boolean } = {}): Promise<StoreSettings> {
    const [settings, zones] = await Promise.all([
      prisma.storeSettings.findUniqueOrThrow({ where: { id: SETTINGS_ID } }),
      prisma.deliveryZone.findMany({
        where: options.includeInactiveZones ? undefined : { active: true },
        orderBy: { sortOrder: 'asc' },
      }),
    ]);
    return mapSettings(settings, zones);
  },

  async updateSettings(updates: Partial<StoreSettings>, adminEmail: string): Promise<StoreSettings> {
    await prisma.storeSettings.update({
      where: { id: SETTINGS_ID },
      data: {
        ...(updates.storeName !== undefined && { storeName: updates.storeName }),
        ...(updates.supportEmail !== undefined && { supportEmail: updates.supportEmail }),
        ...(updates.supportWhatsApp !== undefined && { supportWhatsApp: updates.supportWhatsApp }),
        ...(updates.freeDeliveryThresholdInKobo !== undefined && {
          freeDeliveryThresholdInKobo: updates.freeDeliveryThresholdInKobo,
        }),
        ...(updates.returnPeriodDays !== undefined && { returnPeriodDays: updates.returnPeriodDays }),
        ...(updates.paymentProviders?.paystack !== undefined && { paystackEnabled: updates.paymentProviders.paystack }),
        ...(updates.paymentProviders?.flutterwave !== undefined && {
          flutterwaveEnabled: updates.paymentProviders.flutterwave,
        }),
        ...(updates.paymentProviders?.stripe !== undefined && { stripeEnabled: updates.paymentProviders.stripe }),
        ...(updates.paymentProviders?.showroomCollection !== undefined && {
          showroomCollectionEnabled: updates.paymentProviders.showroomCollection,
        }),
        ...(updates.promotions !== undefined && { promotions: updates.promotions }),
      },
    });

    // Delivery zones were accepted by the schema and shown as saved in the UI,
    // but never written — fee/name/activation edits silently vanished.
    if (updates.deliveryZones) {
      for (const zone of updates.deliveryZones) {
        await prisma.deliveryZone.updateMany({
          where: { id: zone.id },
          data: {
            name: zone.name,
            feeInKobo: zone.feeInKobo,
            estimatedDelivery: zone.estimatedDelivery,
            description: zone.description,
            active: zone.active,
          },
        });
      }
    }

    await db.logActivity({
      adminEmail,
      action: 'Settings updated',
      entityType: 'settings',
      details: updates.promotions
        ? 'Promotions (top bar messages or homepage banner) updated'
        : 'Store delivery, threshold, or payment configurations updated',
    });

    // Admins need to see inactive zones too, otherwise a zone switched off can
    // never be switched back on.
    return db.getSettings({ includeInactiveZones: true });
  },

  // --- DISCOUNTS ---
  async getDiscount(code: string): Promise<DiscountCode | undefined> {
    const discount = await prisma.discountCode.findFirst({
      where: { code: { equals: code.trim(), mode: 'insensitive' }, active: true },
    });
    return mapDiscount(discount);
  },

  async incrementDiscountUsage(id: string): Promise<void> {
    await prisma.discountCode.update({ where: { id }, data: { usageCount: { increment: 1 } } });
  },

  // --- ADMIN USERS ---
  async getAdminByEmail(email: string) {
    return prisma.adminUser.findUnique({ where: { email: email.toLowerCase().trim() } });
  },

  async getAdminById(id: string) {
    return prisma.adminUser.findUnique({ where: { id } });
  },

  /** Invalidates every existing session for this admin. */
  async revokeAdminSessions(adminId: string): Promise<void> {
    await prisma.adminUser.update({
      where: { id: adminId },
      data: { sessionVersion: { increment: 1 } },
    });
  },

  async recordAdminLogin(adminId: string): Promise<void> {
    await prisma.adminUser.update({ where: { id: adminId }, data: { lastLoginAt: new Date() } });
  },

  // --- LOGIN RATE LIMITING ---
  // Backed by the database (not in-memory) because serverless deployments
  // (e.g. Vercel) run each request on a potentially fresh instance — an
  // in-memory counter would silently stop limiting anything in production.
  async recordLoginAttempt(email: string, ipAddress: string, success: boolean): Promise<void> {
    await prisma.loginAttempt.create({
      data: { email: email.toLowerCase().trim(), ipAddress, success },
    });
  },

  async countRecentFailedLoginAttempts(email: string, ipAddress: string, windowMinutes: number): Promise<number> {
    const since = new Date(Date.now() - windowMinutes * 60_000);
    return prisma.loginAttempt.count({
      where: {
        success: false,
        createdAt: { gte: since },
        OR: [{ email: email.toLowerCase().trim() }, { ipAddress }],
      },
    });
  },

  // --- ACTIVITY LOGS ---
  async logActivity(data: Omit<AdminActivityLog, 'id' | 'timestamp'>): Promise<void> {
    await prisma.adminActivityLog.create({
      data: {
        adminEmail: data.adminEmail,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId ?? undefined,
        details: data.details,
      },
    });
  },

  async getActivityLogs(limit = 200): Promise<AdminActivityLog[]> {
    const logs = await prisma.adminActivityLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
    return logs.map(mapActivityLog);
  },
};

/** Another caller won the race to mark this order paid. Safe to treat as success. */
export class OrderAlreadyPaidError extends Error {
  constructor(public readonly orderId: string) {
    super(`Order ${orderId} was already marked paid by a concurrent request`);
    this.name = 'OrderAlreadyPaidError';
  }
}

/** Stock ran out between checkout validation and payment confirmation. */
export class InsufficientStockError extends Error {
  constructor(
    public readonly variantId: string,
    public readonly requested: number,
    public readonly available: number
  ) {
    super(`Insufficient stock for variant ${variantId}: needed ${requested}, ${available} available`);
    this.name = 'InsufficientStockError';
  }
}

/**
 * DNQ-<8 crockford-ish base32 chars>, ~1e12 values. Public-facing, so it is
 * deliberately not a credential — order lookup is authorised separately.
 */
function generateOrderNumber(): string {
  const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  const bytes = randomBytes(8);
  let out = '';
  for (let i = 0; i < 8; i += 1) out += ALPHABET[bytes[i] % ALPHABET.length];
  return `DNQ-${out}`;
}

function startOfDayUtc(date: Date): Date {
  const copy = new Date(date);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

function slugify(name: string): string {
  return `${name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')}-${Date.now().toString(36)}`;
}
