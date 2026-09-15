# Mocking (MSW)

This directory holds Mock Service Worker (MSW) handlers used only in
development and tests. Nothing here runs in a production request path.

## Two independent mocks

1. **`handlers.ts` / `browser.ts`** — mirrors this app's own `/api/*` routes
   in the browser, backed by the fixtures in `fixtures.ts`. Turn it on with:

   ```
   NEXT_PUBLIC_API_MOCKING=enabled bun run dev
   ```

   Use this when you want to work on the storefront UI without a configured
   `DATABASE_URL`. State (orders, etc.) lives in memory in the browser tab
   and resets on reload.

2. **`gateway-handlers.ts` / `server.ts`** — intercepts the *outbound* HTTP
   calls `server/payment/providers.ts` makes to the real Paystack and
   Flutterwave APIs, so the checkout → verify → webhook flow can be
   exercised end-to-end without real gateway credentials. Turn it on with:

   ```
   PAYMENT_MOCKING=enabled PAYSTACK_SECRET_KEY=sk_test_anything bun run dev
   ```

   Started from `instrumentation.ts` (the Next.js server-start hook). The
   provider code is unchanged — it always makes a real `fetch`/Stripe SDK
   call; MSW just answers Paystack/Flutterwave URLs with canned responses.
   Stripe isn't intercepted here (its SDK doesn't go through global
   `fetch` in a way MSW can hook in Node reliably) — test Stripe against
   its own test-mode keys instead.

   The same `gatewayHandlers` are used by `tests/setup.ts` for the
   Vitest suite (`bun run test`).

## What this is not

It is not a replacement for real integration testing against a provider's
sandbox before going live, and it must never be enabled in a deployed
environment — both flags default to `disabled` and are only meant to be
exported in a local shell or `.env.local` (never `.env`/`.env.production`).
