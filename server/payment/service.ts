import { db } from '../db';
import { Order, OrderStatus } from '../types';
import { PaymentProvider, PaymentSession, PaymentResult } from './types';
import {
  PaystackProvider,
  FlutterwaveProvider,
  StripeProvider,
  ShowroomCollectionProvider,
} from './providers';

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
      // Default to paystack
      return this.providers.get('paystack')!;
    }
    return provider;
  }

  async initializePayment(order: Order, providerId: string): Promise<PaymentSession> {
    const provider = this.getProvider(providerId);
    const session = await provider.initializePayment(order);

    // Update order with reference and set to PAYMENT_PROCESSING
    order.paymentReference = session.reference;
    order.paymentMethod = provider.id as any;
    db.updateOrderStatus(
      order.id,
      'PAYMENT_PROCESSING',
      `Payment initiated via ${provider.name} (Ref: ${session.reference})`
    );

    return session;
  }

  async verifyPayment(reference: string, orderId: string): Promise<{ success: boolean; order: Order; message: string }> {
    const order = db.getOrderById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
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
      db.updateOrderStatus(
        order.id,
        'PAYMENT_FAILED',
        `Payment verification failed: ${verification.gatewayResponse || 'Declined'}`
      );
      return {
        success: false,
        order,
        message: verification.gatewayResponse || 'Payment verification failed',
      };
    }

    // Security Check: Server verifies transaction
    // If provider returns an amount, it MUST match server-calculated order total
    if (verification.amountInKobo > 0 && verification.amountInKobo !== order.totalInKobo) {
      db.updateOrderStatus(
        order.id,
        'PAYMENT_FAILED',
        `Amount mismatch! Provider: ₦${verification.amountInKobo / 100}, Server order: ₦${order.totalInKobo / 100}`
      );
      throw new Error('Payment security violation: amount does not match server calculation');
    }

    // Mark PAID & deduct inventory & add timeline event
    order.paymentId = verification.transactionId;
    order.paidAt = verification.paidAt || new Date().toISOString();
    const updatedOrder = db.updateOrderStatus(
      order.id,
      'PAID',
      `Payment verified successfully via ${provider.name} (Ref: ${reference})`
    )!;

    return {
      success: true,
      order: updatedOrder,
      message: 'Payment confirmed successfully',
    };
  }

  async handleWebhook(providerId: string, payload: any, signature?: string): Promise<{ received: boolean; processed: boolean }> {
    // In production, verify HMAC signature with PAYSTACK_SECRET_KEY / FLUTTERWAVE_SECRET_HASH
    const reference = payload?.data?.reference || payload?.reference;
    if (!reference) {
      return { received: true, processed: false };
    }

    const orders = db.getOrders();
    const order = orders.find((o) => o.paymentReference === reference);
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
