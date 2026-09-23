import { NextRequest, NextResponse, after } from 'next/server';
import { STORE_CURRENCY } from '@/src/lib/money';
import { sendOrderConfirmationEmail } from '@/server/email/service';
import { db } from '@/server/db';
import { paymentService } from '@/server/payment/service';
import { PaymentProviderNotConfiguredError, PaymentGatewayError } from '@/server/payment/types';
import { OrderItem } from '@/server/types';
import {
  calculateDeliveryFeeInKobo,
  calculateDiscountInKobo,
  calculateOrderTotalInKobo,
} from '@/server/pricing';
import { CheckoutPayloadSchema } from '@/src/lib/schemas';
import { getErrorMessage } from '@/src/lib/errors';

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

    // Idempotency: an indexed direct lookup, not a full table scan.
    const finalIdempotencyKey =
      idempotencyKey ||
      `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const existingOrder = await db.getOrderByIdempotencyKey(finalIdempotencyKey);
    if (existingOrder) {
      // A retry must never restart payment on an order that already moved on:
      // re-initializing overwrote the payment reference and forced the order
      // back to PAYMENT_PROCESSING, orphaning the original gateway session
      // (so its webhook could no longer find the order) — and could do that
      // to an order that was already paid, fulfilled or refunded.
      const settled = ['PAID', 'FULFILLED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'CANCELLED'];
      if (settled.includes(existingOrder.status)) {
        return NextResponse.json({ order: existingOrder, paymentSession: null });
      }

      const paymentSession = await paymentService.initializePayment(existingOrder, paymentMethod);
      return NextResponse.json({ order: existingOrder, paymentSession });
    }

    // Only methods the store has switched on may be used, rechecked here on
    // the server rather than trusting whatever the client offered.
    const storeSettings = await db.getSettings();
    const enabledProviders: Record<string, boolean> = {
      paystack: storeSettings.paymentProviders.paystack,
      flutterwave: storeSettings.paymentProviders.flutterwave,
      stripe: storeSettings.paymentProviders.stripe,
      showroom: storeSettings.paymentProviders.showroomCollection,
    };
    if (!enabledProviders[paymentMethod]) {
      return NextResponse.json(
        { error: 'That payment method is not currently available. Please choose another.' },
        { status: 400 }
      );
    }

    // Collapse duplicate lines for the same variant before validating stock.
    // Two lines of 1 each against a variant with 1 unit both passed the
    // per-line check, and the order then sold 2.
    const mergedItems = new Map<string, { productId: string; variantId: string; quantity: number }>();
    for (const item of items) {
      const key = `${item.productId}::${item.variantId}`;
      const current = mergedItems.get(key);
      mergedItems.set(
        key,
        current ? { ...current, quantity: current.quantity + item.quantity } : { ...item }
      );
    }

    // Server fetches actual database prices & validates inventory
    let serverSubtotalInKobo = 0;
    const validatedItems: OrderItem[] = [];

    for (const item of mergedItems.values()) {
      const product = await db.getProductById(item.productId);
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

    // Server calculates shipping according to zone & threshold.
    // An unknown or inactive zone is rejected rather than quietly falling back
    // to deliveryZones[0] — which is the free Lagos Island zone, so a bad zone
    // ID meant free nationwide delivery.
    const settings = storeSettings;
    if (settings.deliveryZones.length === 0) {
      return NextResponse.json(
        { error: 'Delivery is temporarily unavailable. Please contact us to complete your order.' },
        { status: 503 }
      );
    }

    const selectedZone = settings.deliveryZones.find((z) => z.id === deliveryZoneId);
    if (!selectedZone) {
      return NextResponse.json(
        { error: 'Please choose a valid delivery area.' },
        { status: 400 }
      );
    }

    const deliveryFeeInKobo = calculateDeliveryFeeInKobo(
      serverSubtotalInKobo,
      settings.freeDeliveryThresholdInKobo,
      selectedZone.feeInKobo
    );

    // Server calculates discount. Redemption is NOT counted here — the usage
    // count used to increment before the order existed, so an abandoned or
    // failed checkout still burned a redemption.
    let discountInKobo = 0;
    let appliedDiscountId: string | undefined;
    if (discountCode) {
      const discount = await db.getDiscount(discountCode);
      if (discount && (!discount.minSpendInKobo || serverSubtotalInKobo >= discount.minSpendInKobo)) {
        discountInKobo = calculateDiscountInKobo(serverSubtotalInKobo, discount);
        appliedDiscountId = discount.id;
      }
    }

    // Final total in kobo
    const serverTotalInKobo = calculateOrderTotalInKobo(
      serverSubtotalInKobo,
      deliveryFeeInKobo,
      discountInKobo
    );

    // Create immutable order in PENDING_PAYMENT state
    const order = await db.createOrder({
      idempotencyKey: finalIdempotencyKey,
      status: 'PENDING_PAYMENT',
      items: validatedItems,
      customer,
      shippingAddress: {
        ...shippingAddress,
        country: shippingAddress.country || 'United States',
      },
      deliveryZoneId: selectedZone.id,
      deliveryFeeInKobo,
      subtotalInKobo: serverSubtotalInKobo,
      discountInKobo,
      totalInKobo: serverTotalInKobo,
      currency: STORE_CURRENCY,
      paymentMethod,
      // Persist the relation the schema already models, so a redemption can be
      // traced back to the order that used it.
      discountCodeId: appliedDiscountId,
    });

    // Count the redemption only once the order actually exists.
    if (appliedDiscountId) {
      await db.incrementDiscountUsage(appliedDiscountId);
    }

    // Initialize provider-independent payment with SERVER amount
    const paymentSession = await paymentService.initializePayment(
      order,
      paymentMethod
    );

    // Showroom orders never go through online verification, so this is the
    // only point at which we know the order was placed — send the "come pay
    // in person" confirmation here rather than waiting for a PAID transition
    // that will never come through this path.
    if (paymentMethod === 'showroom') {
      after(() => sendOrderConfirmationEmail(order));
    }

    return NextResponse.json(
      {
        order,
        paymentSession,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Checkout error:', error);
    if (error instanceof PaymentProviderNotConfiguredError || error instanceof PaymentGatewayError) {
      return NextResponse.json(
        { error: 'This payment method is temporarily unavailable. Please choose another or try again shortly.' },
        { status: 503 }
      );
    }
    // Never forward a raw Error.message to a public client: Prisma errors
    // carry model names, query text and connection details.
    return NextResponse.json(
      { error: 'We could not complete your order. Please try again, or contact us if it keeps happening.' },
      { status: 500 }
    );
  }
}
