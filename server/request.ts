import { NextRequest } from 'next/server';

/**
 * Best-effort client IP for rate limiting. Vercel (and most reverse proxies)
 * set x-forwarded-for to "client, proxy1, proxy2..." — the first entry is
 * the original client. Falls back to a constant so requests without the
 * header still get bucketed together for per-email rate limiting rather
 * than crashing.
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();

  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;

  return 'unknown';
}
