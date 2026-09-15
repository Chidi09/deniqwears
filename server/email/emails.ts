import { Order } from '../types';
import { getAppUrl } from '../config';
import { renderEmailLayout, StoreContact } from './layout';
import {
  EmailLineItem,
  detailColumns,
  escapeHtml,
  formatDate,
  formatNaira,
  lineItems,
  metaStrip,
  notice,
  subdued,
  summary,
} from './components';

/**
 * A built email: subject and body live together so the sending layer never
 * has to know which scenario it's delivering.
 */
export interface BuiltEmail {
  subject: string;
  html: string;
}

// Same resolver the payment callbacks use, so a link in an email can never
// point somewhere different from the one the gateway redirects to.
function appUrl(): string {
  return getAppUrl();
}

function toLineItems(order: Order): EmailLineItem[] {
  return order.items.map((item) => ({
    name: item.name,
    meta: `${item.color} · Size ${item.size} · Qty ${item.quantity}`,
    amount: formatNaira(item.totalPriceInKobo),
    image: item.image,
  }));
}

function orderMeta(order: Order): string {
  return metaStrip([
    { label: 'Order Number', value: escapeHtml(order.orderNumber) },
    { label: 'Placed On', value: formatDate(order.createdAt) },
  ]);
}

function orderTotals(order: Order, totalLabel: string): string {
  return summary([
    { label: 'Subtotal', value: formatNaira(order.subtotalInKobo) },
    {
      label: 'Delivery',
      value: order.deliveryFeeInKobo === 0 ? 'Complimentary' : formatNaira(order.deliveryFeeInKobo),
      accent: order.deliveryFeeInKobo === 0,
    },
    ...(order.discountInKobo > 0
      ? [{ label: 'Discount', value: `&minus;${formatNaira(order.discountInKobo)}`, accent: true }]
      : []),
    { label: totalLabel, value: formatNaira(order.totalInKobo), emphasis: true },
  ]);
}

function deliveryAndPayment(order: Order, paymentStatus: string): string {
  const address = order.shippingAddress;
  return detailColumns([
    {
      label: 'Delivering To',
      lines: [
        `${escapeHtml(address.firstName)} ${escapeHtml(address.lastName)}`,
        subdued(`${address.address}${address.apartment ? ', ' + address.apartment : ''}`),
        subdued(`${address.city}, ${address.state}`),
        subdued(address.country),
      ],
    },
    {
      label: 'Payment',
      lines: [
        `<span style="text-transform:capitalize;">${escapeHtml(order.paymentMethod)}</span>`,
        subdued(paymentStatus),
        ...(order.paymentReference ? [subdued(`Ref: ${order.paymentReference}`)] : []),
      ],
    },
  ]);
}

/** Payment verified — the standard receipt. */
export function orderConfirmationEmail(order: Order, store?: StoreContact): BuiltEmail {
  return {
    subject: `Payment confirmed — Order ${order.orderNumber}`,
    html: renderEmailLayout({
      store,
      preheader: `Order ${order.orderNumber} confirmed · ${formatNaira(order.totalInKobo)}`,
      eyebrow: 'Payment Confirmed',
      headline: `Thank you, ${escapeHtml(order.customer.firstName)}.`,
      intro:
        'Your payment has been verified and your pieces are being prepared for dispatch. You will receive courier details once your order leaves the atelier.',
      blocks: [
        orderMeta(order),
        lineItems(toLineItems(order)),
        orderTotals(order, 'Total Paid'),
        deliveryAndPayment(order, 'Verified'),
      ],
      cta: { href: `${appUrl()}/shop`, label: 'Continue Browsing' },
    }),
  };
}

/** Placed with in-person showroom collection — payment still outstanding. */
export function showroomReservationEmail(order: Order, store?: StoreContact): BuiltEmail {
  return {
    subject: `Reserved — Order ${order.orderNumber}`,
    html: renderEmailLayout({
      store,
      preheader: `Order ${order.orderNumber} reserved · pay at the showroom`,
      eyebrow: 'Order Reserved',
      headline: `Reserved for you, ${escapeHtml(order.customer.firstName)}.`,
      intro:
        'Your pieces are set aside pending payment. Visit the showroom to settle and collect, or arrange a fitting — the team will confirm availability when you arrive.',
      blocks: [
        notice(
          'This order is <strong>not yet paid</strong>. Bring your order number to the showroom and our team will complete the transaction at the counter. Stock is confirmed at the counter, so do come by soon.',
          'accent'
        ),
        orderMeta(order),
        lineItems(toLineItems(order)),
        orderTotals(order, 'Total Due'),
        deliveryAndPayment(order, 'Awaiting collection'),
      ],
      cta: { href: `${appUrl()}/about`, label: 'Showroom Details' },
    }),
  };
}

/** Admin marked the order dispatched. */
export function orderDispatchedEmail(order: Order, store?: StoreContact): BuiltEmail {
  return {
    subject: `On its way — Order ${order.orderNumber}`,
    html: renderEmailLayout({
      store,
      preheader: `Order ${order.orderNumber} has left the atelier`,
      eyebrow: 'Out for Delivery',
      headline: `On its way, ${escapeHtml(order.customer.firstName)}.`,
      intro:
        'Your order has been packed and handed to our courier. Keep your phone close — the driver will call ahead before arriving.',
      blocks: [
        notice(
          `Dispatched ${order.dispatchedAt ? formatDate(order.dispatchedAt) : formatDate(new Date().toISOString())} from the Victoria Island atelier.`
        ),
        orderMeta(order),
        lineItems(toLineItems(order)),
        deliveryAndPayment(order, 'Verified'),
      ],
      cta: { href: `${appUrl()}/shop`, label: 'Continue Browsing' },
    }),
  };
}

/** A refund was issued against the order (full or partial). */
export function refundIssuedEmail(
  order: Order,
  refundedInKobo: number,
  store?: StoreContact
): BuiltEmail {
  // `refundedInKobo` is THIS refund. Whether the order is now fully refunded
  // depends on the cumulative total on the order — refunding the last ₦6,000
  // of a ₦10,000 order is a partial payment but a full settlement.
  const cumulativeRefunded = order.refundedInKobo || refundedInKobo;
  const isFull = cumulativeRefunded >= order.totalInKobo;
  const remainingInKobo = Math.max(0, order.totalInKobo - cumulativeRefunded);

  return {
    subject: `Refund issued — Order ${order.orderNumber}`,
    html: renderEmailLayout({
      store,
      preheader: `${formatNaira(refundedInKobo)} refunded for order ${order.orderNumber}`,
      eyebrow: isFull ? 'Refund Issued' : 'Partial Refund Issued',
      headline: 'Your refund is on its way.',
      intro: `We have issued a ${isFull ? 'full' : 'partial'} refund for order ${escapeHtml(order.orderNumber)}. Funds typically settle back to your account within 5–10 business days, depending on your bank.`,
      blocks: [
        summary([
          { label: 'Order Total', value: formatNaira(order.totalInKobo) },
          ...(cumulativeRefunded > refundedInKobo
            ? [{ label: 'Previously Refunded', value: formatNaira(cumulativeRefunded - refundedInKobo) }]
            : []),
          ...(isFull ? [] : [{ label: 'Remaining Balance', value: formatNaira(remainingInKobo) }]),
          { label: 'Refunded Now', value: formatNaira(refundedInKobo), emphasis: true, accent: true },
        ]),
        orderMeta(order),
        lineItems(toLineItems(order)),
        notice(
          'If the funds have not appeared after 10 business days, reply to this email with your order number and we will chase it with the payment provider.'
        ),
      ],
    }),
  };
}
