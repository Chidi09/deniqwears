/**
 * The public base URL of this deployment.
 *
 * Payment gateways redirect the customer back here after paying, so an
 * incorrect value silently breaks checkout for real customers: they pay, then
 * land on a dead page and the order is never verified. It therefore throws in
 * production rather than falling back to a guess, and only defaults in
 * development where localhost is genuinely correct.
 */
export function getAppUrl(): string {
  const configured = process.env.APP_URL?.trim().replace(/\/+$/, '');
  if (configured) return configured;

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'APP_URL is not set. It is required in production so payment gateways can redirect customers back to this site.'
    );
  }

  return 'http://localhost:3000';
}
