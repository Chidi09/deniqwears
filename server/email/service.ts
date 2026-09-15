import { Resend } from 'resend';
import { Order } from '../types';
import { db } from '../db';
import { StoreContact } from './layout';
import {
  BuiltEmail,
  orderConfirmationEmail,
  orderDispatchedEmail,
  refundIssuedEmail,
  showroomReservationEmail,
} from './emails';

export class EmailNotConfiguredError extends Error {
  constructor() {
    super('RESEND_API_KEY is not set; email sending is disabled.');
    this.name = 'EmailNotConfiguredError';
  }
}

function getClient(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new EmailNotConfiguredError();
  return new Resend(key);
}

function getFromAddress(): string {
  return process.env.EMAIL_FROM || 'Deniqwears Concierge <concierge@deniqwears.com>';
}

/**
 * Support contact lives in admin-editable store settings — read it rather
 * than hardcoding a second copy that would drift. Falls back to the
 * template defaults if settings are unreachable.
 */
async function loadStoreContact(): Promise<StoreContact | undefined> {
  try {
    const settings = await db.getSettings();
    return {
      storeName: settings.storeName,
      supportEmail: settings.supportEmail,
      supportWhatsApp: settings.supportWhatsApp,
    };
  } catch {
    return undefined;
  }
}

/**
 * Single delivery path for every transactional email.
 *
 * Unlike payments, an email failure must never break a checkout, dispatch or
 * refund that already succeeded — so this always resolves, logging loudly
 * instead of throwing. Call it as a best-effort side effect (e.g. via Next's
 * `after()`), never something a customer-facing response waits on.
 */
async function deliver(to: string, build: (store?: StoreContact) => BuiltEmail, context: string): Promise<void> {
  try {
    const resend = getClient();
    const store = await loadStoreContact();
    const { subject, html } = build(store);

    const result = await resend.emails.send({ from: getFromAddress(), to, subject, html });

    if (result.error) {
      console.error(`Email "${context}" failed for ${to}:`, result.error);
    }
  } catch (err) {
    if (err instanceof EmailNotConfiguredError) {
      console.warn(`Skipped email "${context}" for ${to}: ${err.message}`);
    } else {
      console.error(`Email "${context}" failed for ${to}:`, err);
    }
  }
}

export async function sendOrderConfirmationEmail(order: Order): Promise<void> {
  const isShowroomPending =
    order.paymentMethod === 'showroom' && order.status !== 'PAID' && order.status !== 'FULFILLED';

  return deliver(
    order.customer.email,
    (store) =>
      isShowroomPending ? showroomReservationEmail(order, store) : orderConfirmationEmail(order, store),
    `order-confirmation:${order.orderNumber}`
  );
}

export async function sendOrderDispatchedEmail(order: Order): Promise<void> {
  return deliver(
    order.customer.email,
    (store) => orderDispatchedEmail(order, store),
    `order-dispatched:${order.orderNumber}`
  );
}

export async function sendRefundIssuedEmail(order: Order, refundedInKobo: number): Promise<void> {
  return deliver(
    order.customer.email,
    (store) => refundIssuedEmail(order, refundedInKobo, store),
    `refund-issued:${order.orderNumber}`
  );
}
