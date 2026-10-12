import { NextRequest, NextResponse } from 'next/server';

/**
 * Admin gate. When ADMIN_ENTRY_PATH is set, the admin panel and its API do not
 * exist for anyone who hasn't opened the private entry link first: `/admin`
 * and `/api/admin/*` answer with a plain 404, so the login page can't be
 * found and passwords can't be tried against it.
 *
 *   1. The owner opens  /enter/<ADMIN_ENTRY_PATH>  once.
 *   2. That sets a 30-day pass cookie and sends them to /admin.
 *   3. From then on /admin works, behind the normal login.
 *
 * The entry path lives in Vercel's environment, not in the (public) code, and
 * can be rotated at any time by changing it. The pass cookie is an HMAC of the
 * admin session secret, so it can't be forged without that secret. If
 * ADMIN_ENTRY_PATH is unset the gate is off (local development).
 */

const COOKIE = 'dq_gate';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

async function passToken(): Promise<string | null> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return null;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('deniqwears-admin-gate'));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Compare without exiting early, so timing doesn't leak how much matched. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const notFound = (req: NextRequest, isApi: boolean) =>
  isApi
    ? NextResponse.json({ error: 'Not found' }, { status: 404 })
    : NextResponse.rewrite(new URL('/gate-not-found', req.url), { status: 404 });

export async function proxy(req: NextRequest) {
  const entry = process.env.ADMIN_ENTRY_PATH?.trim();
  if (!entry) return NextResponse.next();

  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith('/api/');
  const token = await passToken();
  if (!token) return notFound(req, isApi);

  if (pathname.startsWith('/enter/')) {
    if (!safeEqual(pathname.slice('/enter/'.length), entry)) return notFound(req, false);
    const res = NextResponse.redirect(new URL('/admin', req.url), 303);
    res.cookies.set({
      name: COOKIE,
      value: token,
      httpOnly: true,
      secure: req.nextUrl.protocol === 'https:',
      sameSite: 'lax',
      path: '/',
      maxAge: MAX_AGE_SECONDS,
    });
    return res;
  }

  const pass = req.cookies.get(COOKIE)?.value ?? '';
  return safeEqual(pass, token) ? NextResponse.next() : notFound(req, isApi);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/enter/:path*'],
};
