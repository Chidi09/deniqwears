-- The store trades in the United States: switch from NGN (kobo) to USD (cents).
-- Existing orders keep the currency they were placed in; only new rows and
-- store configuration change.

ALTER TABLE "StoreSettings" ALTER COLUMN "currency" SET DEFAULT 'USD';
ALTER TABLE "Order" ALTER COLUMN "currency" SET DEFAULT 'USD';

-- Store settings: USD, free standard shipping over $150, 5-day returns, and
-- Stripe (cards, Apple Pay, Google Pay, Klarna…) as the payment method.
-- Paystack/Flutterwave are Nigeria-only; showroom collection has no US venue.
UPDATE "StoreSettings"
SET "currency" = 'USD',
    "freeDeliveryThresholdInKobo" = 15000,
    "returnPeriodDays" = 5,
    "paystackEnabled" = false,
    "flutterwaveEnabled" = false,
    "stripeEnabled" = true,
    "showroomCollectionEnabled" = false;

-- Nigerian delivery zones are switched off (not deleted — past orders
-- reference them) and replaced by US shipping. Fees are in cents.
UPDATE "DeliveryZone" SET "active" = false
WHERE "id" NOT IN ('zone-us-standard', 'zone-us-express');

INSERT INTO "DeliveryZone" ("id", "name", "feeInKobo", "estimatedDelivery", "description", "active", "sortOrder")
VALUES
  ('zone-us-standard', 'Standard Shipping', 795, '3 – 7 business days', 'Tracked delivery anywhere in the United States', true, 0),
  ('zone-us-express', 'Express Shipping', 1995, '1 – 3 business days', 'Priority tracked delivery', true, 1)
ON CONFLICT ("id") DO NOTHING;

-- Demo discount codes carried naira amounts (DENIQVIP was ₦5,000 off, which
-- would read as $5,000 off in cents). Only rows still on their seeded values
-- are touched.
UPDATE "DiscountCode" SET "minSpendInKobo" = 7500
WHERE "code" = 'WELCOME10' AND "minSpendInKobo" = 3000000;
UPDATE "DiscountCode" SET "value" = 1500, "minSpendInKobo" = 15000
WHERE "code" = 'DENIQVIP' AND "value" = 500000;

-- Demo catalog prices, converted only where still on their seeded naira
-- values, so any price the owner has already edited is left alone.
UPDATE "Product" SET "priceInKobo" = 12800 WHERE "slug" = 'the-amara-dress' AND "priceInKobo" = 4800000;
UPDATE "Product" SET "priceInKobo" = 8900 WHERE "slug" = 'sculpted-satin-corset' AND "priceInKobo" = 3450000;
UPDATE "Product" SET "priceInKobo" = 14800 WHERE "slug" = 'the-luna-two-piece-set' AND "priceInKobo" = 5500000;
UPDATE "Product" SET "priceInKobo" = 16800 WHERE "slug" = 'sade-column-gown' AND "priceInKobo" = 6200000;
UPDATE "Product" SET "priceInKobo" = 9800 WHERE "slug" = 'wide-leg-pleated-trousers' AND "priceInKobo" = 3800000;
UPDATE "Product" SET "priceInKobo" = 11800 WHERE "slug" = 'silk-georgette-slip' AND "priceInKobo" = 4200000;
