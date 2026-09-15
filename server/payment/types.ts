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
  /**
   * Verifies an inbound webhook's authenticity (HMAC or equivalent signature check).
   * Must return false for any payload that cannot be cryptographically verified.
   */
  verifyWebhookSignature(rawBody: string, signature: string | undefined): boolean;
}

/**
 * Thrown when a provider is invoked without the credentials required to talk
 * to its real gateway API. Never caught and silently replaced with a fake
 * success response — that used to happen here and made the checkout flow
 * lie about payment status. Callers should surface this as a 5xx/"payments
 * temporarily unavailable" error, and dev/test environments should instead
 * run with MSW gateway mocks (see src/mocks) so the code path can be
 * exercised without real credentials.
 */
export class PaymentProviderNotConfiguredError extends Error {
  constructor(providerName: string, envVar: string) {
    super(
      `${providerName} is not configured: missing ${envVar}. Set it in your environment, or run in development with payment gateway mocking enabled (see src/mocks/README.md).`
    );
    this.name = 'PaymentProviderNotConfiguredError';
  }
}

/**
 * The provider answered, but the result cannot be trusted for THIS order —
 * a reference that belongs elsewhere, or an amount/currency that doesn't
 * match what the server calculated. Never retryable; surfaced as a 4xx.
 */
export class PaymentVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentVerificationError';
  }
}

/**
 * The gateway accepted the refund request but has not settled it (Stripe
 * `pending`, or a showroom refund that must be handled in person). The order
 * is deliberately NOT marked refunded — the money hasn't moved yet.
 */
export class RefundNotSettledError extends Error {
  constructor(
    public readonly refundStatus: string,
    public readonly refundId: string
  ) {
    super(
      `Refund ${refundId} is ${refundStatus}, not settled. The order has not been marked refunded; reconcile it once the provider confirms.`
    );
    this.name = 'RefundNotSettledError';
  }
}

export class PaymentGatewayError extends Error {
  constructor(providerName: string, detail: string) {
    super(`${providerName} request failed: ${detail}`);
    this.name = 'PaymentGatewayError';
  }
}
