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
      unitPriceInKobo: 4_800_000,
      quantity: 1,
      totalPriceInKobo: 4_800_000,
    },
    {
      id: 'item-2',
      productId: 'prod-pleated-trousers',
      variantId: 'v-tr-iv-m',
      name: 'Wide-Leg Pleated Trousers',
      color: 'Ivory',
      size: 'M',
      image: 'https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=200&auto=format&fit=crop',
      unitPriceInKobo: 3_800_000,
      quantity: 1,
      totalPriceInKobo: 3_800_000,
    },
    {
      id: 'item-3',
      productId: 'prod-sculpted-corset',
      variantId: 'v-corset-ox-s',
      name: 'Sculpted Satin Corset',
      color: 'Oxblood',
      size: 'S',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=200&auto=format&fit=crop',
      unitPriceInKobo: 3_450_000,
      quantity: 1,
      totalPriceInKobo: 3_450_000,
    },
  ],
  customer: {
    email: 'ada.okafor@gmail.com',
    firstName: 'Ada',
    lastName: 'Okafor',
    phone: '+234 803 123 4567',
  },
  shippingAddress: {
    firstName: 'Ada',
    lastName: 'Okafor',
    email: 'ada.okafor@gmail.com',
    phone: '+234 803 123 4567',
    address: '14 Admiralty Way',
    apartment: 'Apt 4B',
    city: 'Lekki Phase 1',
    state: 'Lagos',
    country: 'Nigeria',
  },
  deliveryZoneId: 'zone-lagos-island',
  deliveryFeeInKobo: 0,
  subtotalInKobo: 12_050_000,
  discountInKobo: 1_205_000,
  totalInKobo: 10_845_000,
  refundedInKobo: 0,
  currency: 'NGN',
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
  deliveryFeeInKobo: 450_000,
  totalInKobo: 12_500_000,
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
  { name: '04-refund-issued', email: refundIssuedEmail(baseOrder, 4_800_000) },
];

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'preview');
mkdirSync(outDir, { recursive: true });

for (const scenario of scenarios) {
  const file = join(outDir, `${scenario.name}.html`);
  writeFileSync(file, scenario.email.html, 'utf8');
  console.log(`${scenario.name.padEnd(26)} ${scenario.email.subject}`);
}

console.log(`\nWrote ${scenarios.length} previews to ${outDir}`);
