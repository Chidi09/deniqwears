-- Backfill refundedInKobo for orders refunded BEFORE the column existed.
-- Those rows defaulted to 0, so the finance queries counted a fully refunded
-- order's entire value as revenue and allowed it to be "refunded" again.
--
-- A full refund is unambiguous: the whole total was returned.
UPDATE "Order"
SET "refundedInKobo" = "totalInKobo"
WHERE "status" = 'REFUNDED' AND "refundedInKobo" = 0;

-- PARTIALLY_REFUNDED rows cannot be inferred safely — the amount only ever
-- existed in timeline prose. They are deliberately left at 0 and must be
-- reconciled by hand against gateway records. To list them:
--   SELECT "orderNumber", "totalInKobo" FROM "Order"
--   WHERE "status" = 'PARTIALLY_REFUNDED' AND "refundedInKobo" = 0;
