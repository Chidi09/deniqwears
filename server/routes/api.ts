import express from 'express';
import { db } from '../db';
import { paymentService } from '../payment/service';
import { OrderItem } from '../types';

const router = express.Router();

// 1. Catalog & Products
router.get('/products', (req, res) => {
  const products = db.getProducts(false); // live only
  res.json({ products });
});

router.get('/products/:slug', (req, res) => {
  const product = db.getProductBySlug(req.params.slug);
  if (!product || product.status === 'archived') {
    return res.status(404).json({ error: 'Garment not found' });
  }
  res.json({ product });
});

// 2. Public Store Settings (delivery zones, fees, thresholds)
router.get('/settings', (req, res) => {
  const settings = db.getSettings();
  res.json({ settings });
});

// 3. Discount Validation
router.post('/discounts/validate', (req, res) => {
  const { code, subtotalInKobo } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  const discount = db.getDiscount(code);
  if (!discount) {
    return res.status(404).json({ error: 'Invalid or expired promotional code' });
  }

  if (discount.minSpendInKobo && subtotalInKobo < discount.minSpendInKobo) {
    return res.status(400).json({
      error: `Promotion requires a minimum bag value of ₦${(discount.minSpendInKobo / 100).toLocaleString()}`,
    });
  }

  let discountInKobo = 0;
  if (discount.type === 'percentage') {
    discountInKobo = Math.round((subtotalInKobo * discount.value) / 100);
  } else {
    discountInKobo = Math.min(discount.value, subtotalInKobo);
  }

  res.json({
    valid: true,
    code: discount.code,
    type: discount.type,
    discountInKobo,
  });
});

// 4. Secure Checkout Endpoint (Never trust prices coming from React)
router.post('/checkout', async (req, res) => {
  try {
    const {
      items, // Array of { productId, variantId, quantity }
      customer, // { firstName, lastName, email, phone }
      shippingAddress, // full address details
      deliveryZoneId,
      discountCode,
      paymentMethod = 'paystack',
      idempotencyKey,
    } = req.body;

    // A. Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Your bag is empty' });
    }

    if (!customer?.email || !customer?.firstName || !customer?.lastName || !shippingAddress?.address) {
      return res.status(400).json({ error: 'Complete delivery details are required' });
    }

    // B. Idempotency Check
    const finalIdempotencyKey = idempotencyKey || `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    if (db.hasIdempotencyKey(finalIdempotencyKey)) {
      const existingOrder = db.getOrders().find((o) => o.idempotencyKey === finalIdempotencyKey);
      if (existingOrder) {
        const paymentSession = await paymentService.initializePayment(existingOrder, paymentMethod);
        return res.json({ order: existingOrder, paymentSession });
      }
    }

    // C. Server fetches actual database prices & validates inventory
    let serverSubtotalInKobo = 0;
    const validatedItems: OrderItem[] = [];

    for (const item of items) {
      const product = db.getProductById(item.productId);
      if (!product || product.status !== 'live') {
        return res.status(400).json({ error: `Garment ${item.productId} is no longer available` });
      }

      const variant = product.variants.find((v) => v.id === item.variantId);
      if (!variant || !variant.active) {
        return res.status(400).json({ error: `Selected size/color for ${product.name} is unavailable` });
      }

      if (variant.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name} (${variant.color} · ${variant.size}). Only ${variant.stock} remaining.`,
        });
      }

      // Server price authority: variant override or product base price
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

    // D. Server calculates shipping
    const settings = db.getSettings();
    let deliveryFeeInKobo = 0;
    const selectedZone = settings.deliveryZones.find((z) => z.id === deliveryZoneId) || settings.deliveryZones[0];

    // Free delivery threshold check
    if (serverSubtotalInKobo >= settings.freeDeliveryThresholdInKobo) {
      deliveryFeeInKobo = 0;
    } else {
      deliveryFeeInKobo = selectedZone.feeInKobo;
    }

    // E. Server calculates discount
    let discountInKobo = 0;
    if (discountCode) {
      const discount = db.getDiscount(discountCode);
      if (discount && (!discount.minSpendInKobo || serverSubtotalInKobo >= discount.minSpendInKobo)) {
        if (discount.type === 'percentage') {
          discountInKobo = Math.round((serverSubtotalInKobo * discount.value) / 100);
        } else {
          discountInKobo = Math.min(discount.value, serverSubtotalInKobo);
        }
        db.incrementDiscountUsage(discount.id);
      }
    }

    // F. Final total in kobo
    const serverTotalInKobo = Math.max(0, serverSubtotalInKobo + deliveryFeeInKobo - discountInKobo);

    // G. Create immutable order in PENDING_PAYMENT state
    const order = db.createOrder({
      idempotencyKey: finalIdempotencyKey,
      status: 'PENDING_PAYMENT',
      items: validatedItems,
      customer,
      shippingAddress,
      deliveryZoneId: selectedZone.id,
      deliveryFeeInKobo,
      subtotalInKobo: serverSubtotalInKobo,
      discountInKobo,
      totalInKobo: serverTotalInKobo,
      currency: 'NGN',
      paymentMethod,
    });

    // H. Initialize provider-independent payment with SERVER amount
    const paymentSession = await paymentService.initializePayment(order, paymentMethod);

    res.status(201).json({
      order,
      paymentSession,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: error.message || 'Unable to process checkout' });
  }
});

// 5. Verify Payment
router.post('/payments/verify', async (req, res) => {
  try {
    const { reference, orderId } = req.body;
    if (!reference || !orderId) {
      return res.status(400).json({ error: 'Reference and order ID are required' });
    }

    const result = await paymentService.verifyPayment(reference, orderId);
    res.json(result);
  } catch (err: any) {
    console.error('Payment verification failed:', err);
    res.status(400).json({ error: err.message || 'Payment verification failed' });
  }
});

// 6. Payment Webhook Endpoint
router.post('/payments/webhook/:provider', async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'] as string;
    const result = await paymentService.handleWebhook(req.params.provider, req.body, signature);
    res.json(result);
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).send('Webhook processing failed');
  }
});

// 7. Order Lookup / Tracking
router.get('/orders/:id', (req, res) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json({ order });
});

export default router;
