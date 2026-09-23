import { OrderStatus } from './types';

/**
 * Which status an order may move to from where.
 *
 * Without this, the admin endpoint accepted any enum value: an unpaid order
 * could be marked FULFILLED (dispatching goods nobody paid for), and a
 * REFUNDED order could be set back to PAID, which also re-ran the stock
 * deduction. Refund states are reached by issuing an actual refund, never by
 * setting the status directly.
 */
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  DRAFT: ['PENDING_PAYMENT', 'CANCELLED'],
  PENDING_PAYMENT: ['PAYMENT_PROCESSING', 'PAID', 'PAYMENT_FAILED', 'CANCELLED'],
  PAYMENT_PROCESSING: ['PAID', 'PAYMENT_FAILED', 'CANCELLED'],
  PAYMENT_FAILED: ['PENDING_PAYMENT', 'PAYMENT_PROCESSING', 'CANCELLED'],
  PAID: ['FULFILLED', 'CANCELLED'],
  FULFILLED: [],
  // Terminal for status purposes — further refunds go through the refund
  // service, which sets these itself.
  REFUNDED: [],
  PARTIALLY_REFUNDED: ['FULFILLED'],
  CANCELLED: [],
};

/** Statuses an admin may never set directly; they're side effects of money moving. */
const ADMIN_FORBIDDEN: OrderStatus[] = ['REFUNDED', 'PARTIALLY_REFUNDED', 'PAID'];

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertAdminTransition(from: OrderStatus, to: OrderStatus): void {
  if (ADMIN_FORBIDDEN.includes(to)) {
    const how =
      to === 'PAID'
        ? 'Record the payment instead. An order becomes PAID when payment is verified or collection is confirmed.'
        : 'Issue a refund instead. Refund states follow an actual refund.';
    throw new InvalidOrderTransitionError(from, to, how);
  }

  if (!canTransition(from, to)) {
    throw new InvalidOrderTransitionError(
      from,
      to,
      `Allowed from ${from}: ${ALLOWED_TRANSITIONS[from]?.join(', ') || 'none'}.`
    );
  }
}

export class InvalidOrderTransitionError extends Error {
  constructor(
    public readonly from: OrderStatus,
    public readonly to: OrderStatus,
    detail: string
  ) {
    super(`Cannot move an order from ${from} to ${to}. ${detail}`);
    this.name = 'InvalidOrderTransitionError';
  }
}
