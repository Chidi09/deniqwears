import { after } from 'next/server';
import { db, OrderAlreadyPaidError } from '../db';
import { Order } from '../types';
import { sendOrderConfirmationEmail } from '../email/service';
import {
  PaymentProvider,
  PaymentSession,
  PaymentVerificationError,
  RefundNotSettledError,
} from './types';
import {
  PaystackProvider,
  FlutterwaveProvider,
  StripeProvider,
  ShowroomCollectionProvider,
} from './providers';
import { formatMoney } from '../../src/lib/money';

// The exact shape of an inbound webhook body varies by gateway; this covers
// only the handful of fields handleWebhook actually reads across all of them.
interface WebhookPayload {
  reference?: string;
  data?: {
    reference?: string; // Paystack
    tx_ref?: string; // Flutterwave
    object?: { id?: string }; // Stripe (checkout.session.* events)
  };
}

export class PaymentService {
  private providers: Map<string, PaymentProvider> = new Map();

  constructor() {
    this.registerProvider(new PaystackProvider());
    this.registerProvider(new FlutterwaveProvider());
    this.registerProvider(new StripeProvider());
    this.registerProvider(new ShowroomCollectionProvider());
  }

  registerProvider(provider: PaymentProvider) {
    this.providers.set(provider.id, provider);
  }

  getProvider(providerId: string): PaymentProvider {
    const provider = this.providers.get(providerId);
    if (!provider) {
      return this.providers.get('stripe')!;
    }
    return provider;
  }

  async initializePayment(order: Order, providerId: string): Promise<PaymentSession> {
    const provider = this.getProvider(providerId);
    const session = await provider.initializePayment(order);

    await db.setOrderPaymentReference(order.id, session.reference, provider.id as Order['paymentMethod']);
    await db.updateOrderStatus(
      order.id,
      'PAYMENT_PROCESSING',
      `Payment initiated via ${provider.name} (Ref: ${session.reference})`
    );

    return session;
  }

  async verifyPayment(reference: string, orderId: string): Promise<{ success: boolean; order: Order; message: string }> {
    const order = await db.getOrderById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Bind the reference to THIS order before doing anything else. Both
    // values arrive from the client, so without this a genuine reference for
    // a cheap order could be replayed against a different (or someone else's)
    // order of the same price and mark it paid.
    if (!order.paymentReference || order.paymentReference !== reference) {
      throw new PaymentVerificationError(
        `Payment reference does not belong to order ${order.orderNumber}`
      );
    }

    if (order.status === 'PAID' || order.status === 'FULFILLED') {
      return {
        success: true,
        order,
        message: 'Order already verified as paid',
      };
    }

    const provider = this.getProvider(order.paymentMethod);
    const verification = await provider.verifyPayment(reference);

    if (!verification.success) {
      if (order.paymentMethod !== 'showroom') {
        await db.updateOrderStatus(
          order.id,
          'PAYMENT_FAILED',
          `Payment verification failed: ${verification.gatewayResponse || 'Declined'}`
        );
      }
      const refreshed = (await db.getOrderById(orderId))!;
      return {
        success: false,
        order: refreshed,
        message: verification.gatewayResponse || 'Payment verification failed',
      };
    }

    // Security check: the server is the sole authority on price. The gateway
    // must report a finite amount that matches, in the order's currency.
    // A previous `amountInKobo > 0` guard meant a zero/absent amount skipped
    // validation entirely — any provider (or mock) returning 0 could confirm
    // an order for free.
    const amountValid =
      Number.isFinite(verification.amountInKobo) && verification.amountInKobo === order.totalInKobo;
    const currencyValid = verification.currency?.toUpperCase() === order.currency.toUpperCase();

    if (!amountValid || !currencyValid) {
      await db.updateOrderStatus(
        order.id,
        'PAYMENT_FAILED',
        `Payment mismatch — provider reported ${verification.currency} ${verification.amountInKobo / 100}, order is ${order.currency} ${order.totalInKobo / 100}`
      );
      throw new PaymentVerificationError(
        'Payment security violation: the amount or currency confirmed by the provider does not match this order'
      );
    }

    await db.setOrderPaymentId(order.id, verification.transactionId, verification.paidAt || new Date().toISOString());

    let updatedOrder: Order;
    try {
      updatedOrder = (await db.updateOrderStatus(
        order.id,
        'PAID',
        `Payment verified successfully via ${provider.name} (Ref: ${reference})`
      ))!;
    } catch (err) {
      // A webhook and the browser callback routinely arrive together. Whoever
      // loses the race reports the same success without re-deducting stock or
      // sending a second confirmation email.
      if (err instanceof OrderAlreadyPaidError) {
        return {
          success: true,
          order: (await db.getOrderById(order.id))!,
          message: 'Payment already confirmed',
        };
      }
      throw err;
    }

    // Best-effort, non-blocking: never delay or fail this response over email.
    after(() => sendOrderConfirmationEmail(updatedOrder));

    return {
      success: true,
      order: updatedOrder,
      message: 'Payment confirmed successfully',
    };
  }

  /**
   * Records payment taken in person (showroom cash/POS). This is the only
   * sanctioned way an order becomes PAID without a gateway: staff confirm the
   * money is in hand, and it records a payment id so the order can later be
   * refunded like any other.
   */
  async recordManualPayment(
    orderId: string,
    adminEmail: string,
    note?: string
  ): Promise<{ order: Order }> {
    const order = await db.getOrderById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    if (order.paymentMethod !== 'showroom') {
      throw new PaymentVerificationError(
        `Order #${order.orderNumber} is a ${order.paymentMethod} order — confirm it through the gateway, not by hand.`
      );
    }

    if (order.status === 'PAID' || order.status === 'FULFILLED') {
      return { order };
    }

    await db.setOrderPaymentId(order.id, `showroom_${Date.now()}`, new Date().toISOString());

    try {
      const updated = (await db.updateOrderStatus(
        order.id,
        'PAID',
        note?.trim()
          ? `Payment collected at the showroom by ${adminEmail} — ${note.trim()}`
          : `Payment collected at the showroom by ${adminEmail}`,
        adminEmail
      ))!;

      after(() => sendOrderConfirmationEmail(updated));
      return { order: updated };
    } catch (err) {
      if (err instanceof OrderAlreadyPaidError) {
        return { order: (await db.getOrderById(order.id))! };
      }
      throw err;
    }
  }

  async refundOrder(
    orderId: string,
    amountInKobo: number | undefined,
    adminEmail: string
  ): Promise<{ order: Order; refundId: string; refundedInKobo: number }> {
    const order = await db.getOrderById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    const refundable = ['PAID', 'FULFILLED', 'PARTIALLY_REFUNDED'];
    if (!refundable.includes(order.status)) {
      throw new Error(`Order #${order.orderNumber} cannot be refunded from status ${order.status}`);
    }

    if (!order.paymentId) {
      throw new Error(`Order #${order.orderNumber} has no captured payment to refund`);
    }

    // Partial refunds stack, so the ceiling is what's left, not the order total.
    const alreadyRefunded = order.refundedInKobo ?? 0;
    const remaining = order.totalInKobo - alreadyRefunded;
    const refundAmount = amountInKobo ?? remaining;

    if (refundAmount <= 0 || refundAmount > remaining) {
      throw new Error(
        alreadyRefunded > 0
          ? `Refund amount must be greater than zero and no more than the ${formatMoney(remaining)} still refundable on this order`
          : 'Refund amount must be greater than zero and no more than the order total'
      );
    }

    const provider = this.getProvider(order.paymentMethod);
    const refund = await provider.refundPayment(order.paymentId, refundAmount);

    // Only settled refunds move the books. Stripe returns `pending` routinely
    // and the showroom provider returns `pending` having moved no money at
    // all — previously any of those was recorded as a completed refund,
    // reducing reported revenue for funds the customer never received.
    if (!refund.success || refund.status !== 'processed') {
      await db.updateOrderStatus(
        order.id,
        order.status,
        `Refund of ${formatMoney(refundAmount)} submitted to ${provider.name} and is ${refund.status} (Refund ID: ${refund.refundId}). Not yet recorded as refunded.`,
        adminEmail
      );
      throw new RefundNotSettledError(refund.status, refund.refundId);
    }

    // Atomic: the balance is only incremented if nobody else refunded this
    // order since we read it, so two concurrent requests can't both spend the
    // same remaining balance.
    const recorded = await db.recordOrderRefund(order.id, refundAmount, alreadyRefunded);
    if (!recorded) {
      throw new Error(
        'Another refund was recorded against this order while this one was processing. Re-check the order before retrying.'
      );
    }

    const isFullRefund = alreadyRefunded + refundAmount >= order.totalInKobo;
    const updatedOrder = (await db.updateOrderStatus(
      order.id,
      isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
      `Refunded ${formatMoney(refundAmount)} via ${provider.name} (Refund ID: ${refund.refundId})`,
      adminEmail
    ))!;

    return { order: updatedOrder, refundId: refund.refundId, refundedInKobo: refundAmount };
  }

  async handleWebhook(
    providerId: string,
    rawBody: string,
    signature: string | undefined
  ): Promise<{ received: boolean; processed: boolean }> {
    const provider = this.getProvider(providerId);

    if (!provider.verifyWebhookSignature(rawBody, signature)) {
      throw new Error('Invalid webhook signature');
    }

    let payload: WebhookPayload;
    try {
      payload = JSON.parse(rawBody) as WebhookPayload;
    } catch {
      return { received: true, processed: false };
    }

    const reference =
      payload?.data?.reference || // Paystack
      payload?.data?.tx_ref || // Flutterwave
      payload?.data?.object?.id || // Stripe (checkout.session.* events)
      payload?.reference;
    if (!reference) {
      return { received: true, processed: false };
    }

    const order = await db.getOrderByPaymentReference(reference);
    if (!order) {
      return { received: true, processed: false };
    }

    if (order.status === 'PAID') {
      return { received: true, processed: true }; // repeat-safe idempotency
    }

    await this.verifyPayment(reference, order.id);
    return { received: true, processed: true };
  }
}

export const paymentService = new PaymentService();
