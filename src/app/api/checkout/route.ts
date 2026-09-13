import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { paymentService } from '@/server/payment/service';
import { OrderItem } from '@/server/types';
import { CheckoutPayloadSchema } from '@/src/lib/schemas';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const parseResult = CheckoutPayloadSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Invalid checkout payload';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const {
      items,
      customer,
      shippingAddress,
      deliveryZoneId,
      discountCode,
      paymentMethod,
      idempotencyKey,
    } = parseResult.data;

    // Idempotency Check
    const finalIdempotencyKey =
      idempotencyKey ||
      `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    if (db.hasIdempotencyKey(finalIdempotencyKey)) {
      const existingOrder = db
        .getOrders()
        .find((o) => o.idempotencyKey === finalIdempotencyKey);
      if (existingOrder) {
        const paymentSession = await paymentService.initializePayment(
          existingOrder,
          paymentMethod
        );
        return NextResponse.json({ order: existingOrder, paymentSession });
      }
    }

    // Server fetches actual database prices & validates inventory
    let serverSubtotalInKobo = 0;
    const validatedItems: OrderItem[] = [];

    for (const item of items) {
      const product = db.getProductById(item.productId);
      if (!product || product.status !== 'live') {
        return NextResponse.json(
          { error: `Garment ${item.productId} is no longer available in the boutique` },
          { status: 400 }
        );
      }

      const variant = product.variants.find((v) => v.id === item.variantId);
      if (!variant || !variant.active) {
        return NextResponse.json(
          { error: `Selected size/color for ${product.name} is unavailable` },
          { status: 400 }
        );
      }

      if (variant.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${product.name} (${variant.color} · ${variant.size}). Only ${variant.stock} remaining.`,
          },
          { status: 400 }
        );
      }

      // Server price authority: variant override or product base price in kobo
      const unitPriceInKobo = variant.priceInKobo || product.priceInKobo;
      const itemTotalInKobo = unitPriceInKobo * item.quantity;
      serverSubtotalInKobo += itemTotalInKobo;

      validatedItems.push({
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        productId: product.id,
        variantId: variant.id,
        name: product.name,
        color: variant.color,
        size: variant.size,
        image: product.primaryImage,
        unitPriceInKobo,
        quantity: item.quantity,
        totalPriceInKobo: itemTotalInKobo,
      });
    }

    // Server calculates shipping according to zone & threshold
    const settings = db.getSettings();
    let deliveryFeeInKobo = 0;
    const selectedZone =
      settings.deliveryZones.find((z) => z.id === deliveryZoneId) ||
      settings.deliveryZones[0];

    // Free delivery threshold check (e.g. ₦100,000 / 10000000 kobo)
    if (serverSubtotalInKobo >= settings.freeDeliveryThresholdInKobo) {
      deliveryFeeInKobo = 0;
    } else {
      deliveryFeeInKobo = selectedZone.feeInKobo;
    }

    // Server calculates discount
    let discountInKobo = 0;
    if (discountCode) {
      const discount = db.getDiscount(discountCode);
      if (
        discount &&
        (!discount.minSpendInKobo || serverSubtotalInKobo >= discount.minSpendInKobo)
      ) {
        if (discount.type === 'percentage') {
          discountInKobo = Math.round((serverSubtotalInKobo * discount.value) / 100);
        } else {
          discountInKobo = Math.min(discount.value, serverSubtotalInKobo);
        }
        db.incrementDiscountUsage(discount.id);
      }
    }

    // Final total in kobo
    const serverTotalInKobo = Math.max(
      0,
      serverSubtotalInKobo + deliveryFeeInKobo - discountInKobo
    );

    // Create immutable order in PENDING_PAYMENT state
    const order = db.createOrder({
      idempotencyKey: finalIdempotencyKey,
      status: 'PENDING_PAYMENT',
      items: validatedItems,
      customer,
      shippingAddress: {
        ...shippingAddress,
        country: shippingAddress.country || 'Nigeria',
      },
      deliveryZoneId: selectedZone.id,
      deliveryFeeInKobo,
      subtotalInKobo: serverSubtotalInKobo,
      discountInKobo,
      totalInKobo: serverTotalInKobo,
      currency: 'NGN',
      paymentMethod,
    });

    // Initialize provider-independent payment with SERVER amount
    const paymentSession = await paymentService.initializePayment(
      order,
      paymentMethod
    );

    return NextResponse.json(
      {
        order,
        paymentSession,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Unable to process checkout' },
      { status: 500 }
    );
  }
}
