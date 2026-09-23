/**
 * Renders every transactional email scenario to preview/*.html with sample
 * data, so templates can be eyeballed without sending anything.
 * Run: bun run preview:email
 *
 * Add a scenario here whenever you add one to server/email/emails.ts.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  orderConfirmationEmail,
  orderDispatchedEmail,
  refundIssuedEmail,
  showroomReservationEmail,
} from '../server/email/emails';
import type { Order } from '../server/types';

const baseOrder: Order = {
  id: 'ord-preview',
  orderNumber: 'DNQ-18421',
  idempotencyKey: 'idemp-preview',
  status: 'PAID',
  items: [
    {
      id: 'item-1',
      productId: 'prod-amara-dress',
      variantId: 'v-amara-blk-m',
      name: 'The Amara Dress',
      color: 'Black',
      size: 'M',
      image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=200&auto=format&fit=crop',
      unitPriceInKobo: 12_800,
      quantity: 1,
      totalPriceInKobo: 12_800,
    },
    {
      id: 'item-2',
      productId: 'prod-pleated-trousers',
      variantId: 'v-tr-iv-m',
      name: 'Wide-Leg Pleated Trousers',
      color: 'Ivory',
      size: 'M',
      image: 'https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=200&auto=format&fit=crop',
      unitPriceInKobo: 9_800,
      quantity: 1,
      totalPriceInKobo: 9_800,
    },
    {
      id: 'item-3',
      productId: 'prod-sculpted-corset',
      variantId: 'v-corset-ox-s',
      name: 'Sculpted Satin Corset',
      color: 'Oxblood',
      size: 'S',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=200&auto=format&fit=crop',
      unitPriceInKobo: 8_900,
      quantity: 1,
      totalPriceInKobo: 8_900,
    },
  ],
  customer: {
    email: 'ada.okafor@gmail.com',
    firstName: 'Ada',
    lastName: 'Okafor',
    phone: '(713) 555-0142',
  },
  shippingAddress: {
    firstName: 'Ada',
    lastName: 'Okafor',
    email: 'ada.okafor@gmail.com',
    phone: '(713) 555-0142',
    address: '120 Main Street',
    apartment: 'Apt 4B',
    city: 'Houston',
    state: 'TX',
    postalCode: '77002',
    country: 'United States',
  },
  deliveryZoneId: 'zone-us-standard',
  deliveryFeeInKobo: 0,
  subtotalInKobo: 31_500,
  discountInKobo: 3_150,
  totalInKobo: 28_350,
  refundedInKobo: 0,
  currency: 'USD',
  paymentMethod: 'paystack',
  paymentReference: 'pstk_1757800000_9f3a2c',
  paidAt: new Date().toISOString(),
  timeline: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const showroomOrder: Order = {
  ...baseOrder,
  status: 'PAYMENT_PROCESSING',
  paymentMethod: 'showroom',
  paymentReference: 'showroom_1757800000_4b2e1a',
  discountInKobo: 0,
  deliveryFeeInKobo: 795,
  totalInKobo: 32_295,
};

const dispatchedOrder: Order = {
  ...baseOrder,
  status: 'FULFILLED',
  dispatchedAt: new Date().toISOString(),
};

const scenarios = [
  { name: '01-order-confirmation', email: orderConfirmationEmail(baseOrder) },
  { name: '02-showroom-reservation', email: showroomReservationEmail(showroomOrder) },
  { name: '03-order-dispatched', email: orderDispatchedEmail(dispatchedOrder) },
  { name: '04-refund-issued', email: refundIssuedEmail(baseOrder, 12_800) },
];

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'preview');
mkdirSync(outDir, { recursive: true });

for (const scenario of scenarios) {
  const file = join(outDir, `${scenario.name}.html`);
  writeFileSync(file, scenario.email.html, 'utf8');
  console.log(`${scenario.name.padEnd(26)} ${scenario.email.subject}`);
}

console.log(`\nWrote ${scenarios.length} previews to ${outDir}`);
