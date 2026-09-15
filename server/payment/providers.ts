import crypto from 'node:crypto';
import Stripe from 'stripe';
import { Order } from '../types';
import {
  PaymentProvider,
  PaymentSession,
  PaymentResult,
  RefundResult,
  PaymentProviderNotConfiguredError,
  PaymentGatewayError,
} from './types';
import { getErrorMessage } from '../../src/lib/errors';
import { getAppUrl } from '../config';

/**
 * Gateway calls sit in the customer's checkout path, so they must not hang
 * indefinitely when a provider stalls.
 */
const GATEWAY_TIMEOUT_MS = 15_000;

function gatewayTimeout(): AbortSignal {
  return AbortSignal.timeout(GATEWAY_TIMEOUT_MS);
}

function generateReference(prefix: string): string {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

function defaultCallbackUrl(reference: string, orderId: string): string {
  return `${getAppUrl()}/checkout?reference=${reference}&orderId=${orderId}`;
}

// --- Paystack ---
export class PaystackProvider implements PaymentProvider {
  readonly id = 'paystack';
  readonly name = 'Paystack (Card, Transfer, USSD)';

  private get secretKey(): string {
    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!key) throw new PaymentProviderNotConfiguredError(this.name, 'PAYSTACK_SECRET_KEY');
    return key;
  }

  async initializePayment(order: Order, options?: { callbackUrl?: string }): Promise<PaymentSession> {
    const reference = generateReference('pstk');

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      signal: gatewayTimeout(),
      body: JSON.stringify({
        email: order.customer.email,
        amount: order.totalInKobo,
        reference,
        callback_url: options?.callbackUrl || defaultCallbackUrl(reference, order.id),
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerName: `${order.customer.firstName} ${order.customer.lastName}`,
        },
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.status || !data.data) {
      throw new PaymentGatewayError(this.name, data.message || `HTTP ${response.status}`);
    }

    return {
      provider: this.id,
      reference,
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
      amountInKobo: order.totalInKobo,
      currency: 'NGN',
      expiresAt: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
    };
  }

  async verifyPayment(reference: string): Promise<PaymentResult> {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${this.secretKey}` },
      signal: gatewayTimeout(),
    });

    const data = await response.json();
    if (!response.ok || !data.status || !data.data) {
      throw new PaymentGatewayError(this.name, data.message || `HTTP ${response.status}`);
    }

    return {
      success: data.data.status === 'success',
      reference,
      provider: this.id,
      transactionId: String(data.data.id),
      amountInKobo: data.data.amount,
      currency: data.data.currency,
      status: data.data.status === 'success' ? 'success' : 'failed',
      gatewayResponse: data.data.gateway_response,
      paidAt: data.data.paid_at,
    };
  }

  async refundPayment(paymentId: string, amountInKobo?: number): Promise<RefundResult> {
    const response = await fetch('https://api.paystack.co/refund', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      signal: gatewayTimeout(),
      body: JSON.stringify({ transaction: paymentId, ...(amountInKobo && { amount: amountInKobo }) }),
    });

    const data = await response.json();
    if (!response.ok || !data.status) {
      throw new PaymentGatewayError(this.name, data.message || `HTTP ${response.status}`);
    }

    return {
      success: true,
      refundId: String(data.data.id ?? `ref_${Date.now()}`),
      amountInKobo: data.data.amount ?? amountInKobo ?? 0,
      status: 'processed',
    };
  }

  verifyWebhookSignature(rawBody: string, signature: string | undefined): boolean {
    if (!signature) return false;
    const hash = crypto.createHmac('sha512', this.secretKey).update(rawBody).digest('hex');
    return timingSafeEqualHex(hash, signature);
  }
}

// --- Flutterwave ---
export class FlutterwaveProvider implements PaymentProvider {
  readonly id = 'flutterwave';
  readonly name = 'Flutterwave';

  private get secretKey(): string {
    const key = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!key) throw new PaymentProviderNotConfiguredError(this.name, 'FLUTTERWAVE_SECRET_KEY');
    return key;
  }

  private get secretHash(): string {
    const hash = process.env.FLUTTERWAVE_SECRET_HASH;
    if (!hash) throw new PaymentProviderNotConfiguredError(this.name, 'FLUTTERWAVE_SECRET_HASH');
    return hash;
  }

  async initializePayment(order: Order, options?: { callbackUrl?: string }): Promise<PaymentSession> {
    const reference = generateReference('flw');

    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      signal: gatewayTimeout(),
      body: JSON.stringify({
        tx_ref: reference,
        amount: (order.totalInKobo / 100).toFixed(2),
        currency: order.currency,
        redirect_url: options?.callbackUrl || defaultCallbackUrl(reference, order.id),
        customer: {
          email: order.customer.email,
          name: `${order.customer.firstName} ${order.customer.lastName}`,
          phonenumber: order.customer.phone,
        },
        meta: { orderId: order.id, orderNumber: order.orderNumber },
      }),
    });

    const data = await response.json();
    if (!response.ok || data.status !== 'success' || !data.data) {
      throw new PaymentGatewayError(this.name, data.message || `HTTP ${response.status}`);
    }

    return {
      provider: this.id,
      reference,
      authorizationUrl: data.data.link,
      amountInKobo: order.totalInKobo,
      currency: order.currency,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
    };
  }

  async verifyPayment(reference: string): Promise<PaymentResult> {
    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${this.secretKey}` }, signal: gatewayTimeout() }
    );

    const data = await response.json();
    if (!response.ok || data.status !== 'success' || !data.data) {
      throw new PaymentGatewayError(this.name, data.message || `HTTP ${response.status}`);
    }

    const successful = data.data.status === 'successful';
    return {
      success: successful,
      reference,
      provider: this.id,
      transactionId: String(data.data.id),
      amountInKobo: Math.round(data.data.amount * 100),
      currency: data.data.currency,
      status: successful ? 'success' : 'failed',
      gatewayResponse: data.data.processor_response,
      paidAt: data.data.created_at,
    };
  }

  async refundPayment(paymentId: string, amountInKobo?: number): Promise<RefundResult> {
    const response = await fetch(`https://api.flutterwave.com/v3/transactions/${paymentId}/refund`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      signal: gatewayTimeout(),
      body: JSON.stringify(amountInKobo ? { amount: amountInKobo / 100 } : {}),
    });

    const data = await response.json();
    if (!response.ok || data.status !== 'success') {
      throw new PaymentGatewayError(this.name, data.message || `HTTP ${response.status}`);
    }

    return {
      success: true,
      refundId: String(data.data.id ?? `flw_ref_${Date.now()}`),
      amountInKobo: amountInKobo ?? 0,
      status: 'processed',
    };
  }

  verifyWebhookSignature(_rawBody: string, signature: string | undefined): boolean {
    if (!signature) return false;
    // Flutterwave sends the dashboard-configured secret hash verbatim (no HMAC) in verif-hash.
    return timingSafeEqualStr(signature, this.secretHash);
  }
}

// --- Stripe ---
export class StripeProvider implements PaymentProvider {
  readonly id = 'stripe';
  readonly name = 'Stripe';

  private get client(): Stripe {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new PaymentProviderNotConfiguredError(this.name, 'STRIPE_SECRET_KEY');
    return new Stripe(key);
  }

  private get webhookSecret(): string {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new PaymentProviderNotConfiguredError(this.name, 'STRIPE_WEBHOOK_SECRET');
    return secret;
  }

  async initializePayment(order: Order, options?: { callbackUrl?: string }): Promise<PaymentSession> {
    const callbackBase = options?.callbackUrl || `${getAppUrl()}/checkout`;

    try {
      const session = await this.client.checkout.sessions.create({
        mode: 'payment',
        customer_email: order.customer.email,
        client_reference_id: order.id,
        line_items: [
          {
            price_data: {
              currency: order.currency.toLowerCase(),
              unit_amount: order.totalInKobo,
              product_data: { name: `Deniqwears Order ${order.orderNumber}` },
            },
            quantity: 1,
          },
        ],
        metadata: { orderId: order.id, orderNumber: order.orderNumber },
        // Stripe substitutes {CHECKOUT_SESSION_ID} into success_url server-side.
        // We use the session's own id as our `reference` everywhere (rather than
        // inventing one) so verifyPayment can retrieve it directly and reliably.
        success_url: `${callbackBase}?reference={CHECKOUT_SESSION_ID}&orderId=${order.id}`,
        cancel_url: `${callbackBase}?orderId=${order.id}&cancelled=true`,
      });

      return {
        provider: this.id,
        reference: session.id,
        checkoutUrl: session.url ?? undefined,
        // No clientSecret here: it is only populated for ui_mode 'embedded' or
        // 'custom'. This is a hosted-page session, where it is always null.
        amountInKobo: order.totalInKobo,
        currency: order.currency,
        expiresAt: session.expires_at
          ? new Date(session.expires_at * 1000).toISOString()
          : new Date(Date.now() + 1000 * 60 * 30).toISOString(),
      };
    } catch (err) {
      throw new PaymentGatewayError(this.name, getErrorMessage(err, 'Checkout session creation failed'));
    }
  }

  async verifyPayment(reference: string): Promise<PaymentResult> {
    try {
      const session = await this.client.checkout.sessions.retrieve(reference);
      const paid = session.payment_status === 'paid';
      return {
        success: paid,
        reference,
        provider: this.id,
        transactionId: String(session.payment_intent ?? session.id),
        amountInKobo: session.amount_total ?? 0,
        currency: (session.currency ?? 'ngn').toUpperCase(),
        status: paid ? 'success' : 'pending',
        paidAt: paid ? new Date().toISOString() : undefined,
      };
    } catch (err) {
      if (err instanceof PaymentGatewayError) throw err;
      throw new PaymentGatewayError(this.name, getErrorMessage(err, 'Verification failed'));
    }
  }

  async refundPayment(paymentId: string, amountInKobo?: number): Promise<RefundResult> {
    try {
      const refund = await this.client.refunds.create({
        payment_intent: paymentId,
        ...(amountInKobo && { amount: amountInKobo }),
      });
      return {
        success: true,
        refundId: refund.id,
        amountInKobo: refund.amount,
        status: refund.status === 'succeeded' ? 'processed' : 'pending',
      };
    } catch (err) {
      throw new PaymentGatewayError(this.name, getErrorMessage(err, 'Refund failed'));
    }
  }

  verifyWebhookSignature(rawBody: string, signature: string | undefined): boolean {
    if (!signature) return false;
    try {
      this.client.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
      return true;
    } catch {
      return false;
    }
  }
}

// --- Showroom Fitting / POS Collection (no external gateway) ---
export class ShowroomCollectionProvider implements PaymentProvider {
  readonly id = 'showroom';
  // Generic on purpose: this string is written into customer-visible order
  // timelines, and the showroom's actual address belongs in store settings,
  // not baked into the payment layer.
  readonly name = 'Showroom Fitting / POS';

  async initializePayment(order: Order): Promise<PaymentSession> {
    const reference = generateReference('showroom');
    return {
      provider: this.id,
      reference,
      amountInKobo: order.totalInKobo,
      currency: order.currency,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    };
  }

  // There is nothing to verify against an external gateway: collection happens
  // in person, and only an admin marking the order PAID (after taking payment
  // at the showroom) is authoritative. Always reports "pending" so the
  // customer-facing verify/webhook paths never auto-confirm payment for cash.
  async verifyPayment(reference: string): Promise<PaymentResult> {
    return {
      success: false,
      reference,
      provider: this.id,
      transactionId: '',
      amountInKobo: 0,
      currency: 'NGN',
      status: 'pending',
      gatewayResponse: 'Awaiting in-person collection at the showroom; an admin must confirm payment manually.',
    };
  }

  async refundPayment(): Promise<RefundResult> {
    // No gateway-held funds to reverse; cancellation/refund is a manual showroom process.
    return { success: true, refundId: `showroom_manual_${Date.now()}`, amountInKobo: 0, status: 'pending' };
  }

  verifyWebhookSignature(): boolean {
    return false;
  }
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
