import { Order } from '../types';

export interface PaymentSession {
  provider: string;
  reference: string;
  checkoutUrl?: string;
  authorizationUrl?: string;
  accessCode?: string;
  clientSecret?: string;
  amountInKobo: number;
  currency: string;
  expiresAt: string;
}

export interface PaymentResult {
  success: boolean;
  reference: string;
  provider: string;
  transactionId: string;
  amountInKobo: number;
  currency: string;
  status: 'success' | 'failed' | 'abandoned' | 'pending';
  gatewayResponse?: string;
  paidAt?: string;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  amountInKobo: number;
  status: 'processed' | 'pending' | 'failed';
}

export interface PaymentProvider {
  readonly id: string;
  readonly name: string;
  initializePayment(order: Order, options?: { callbackUrl?: string }): Promise<PaymentSession>;
  verifyPayment(reference: string): Promise<PaymentResult>;
  refundPayment(paymentId: string, amountInKobo?: number): Promise<RefundResult>;
}
