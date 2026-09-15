// Next.js instrumentation hook: runs once when the server process starts.
// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
export async function register() {
  const paymentMocking = process.env.PAYMENT_MOCKING === 'enabled';
  const apiMocking = process.env.NEXT_PUBLIC_API_MOCKING === 'enabled';

  // Refuse to boot rather than run a production deployment where any gateway
  // reference verifies successfully. These flags previously gated only on
  // themselves, so setting one in a production environment silently turned
  // real checkout into a simulation.
  if (process.env.NODE_ENV === 'production' && (paymentMocking || apiMocking)) {
    const enabled = [paymentMocking && 'PAYMENT_MOCKING', apiMocking && 'NEXT_PUBLIC_API_MOCKING']
      .filter(Boolean)
      .join(' and ');
    throw new Error(
      `${enabled} is enabled in a production build. Mocking must never run in production — it makes arbitrary payment references verify as successful. Unset it and redeploy.`
    );
  }

  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (!paymentMocking) return;

  const { server } = await import('./src/mocks/server');
  server.listen({ onUnhandledRequest: 'bypass' });
  console.log('[msw] Payment gateway mocking enabled — Paystack/Flutterwave calls are intercepted.');
}
