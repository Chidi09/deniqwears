import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSessionToken, ADMIN_SESSION_COOKIE_NAME } from '@/server/auth';
import { db } from '@/server/db';

export async function requireAdminAuth(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifyAdminSessionToken(token) : null;

  // A valid signature isn't enough: confirm the admin still exists, is still
  // active, and hasn't had sessions revoked (password rotation bumps
  // sessionVersion). Previously a copied token stayed usable for its full
  // seven days regardless.
  const admin = session ? await db.getAdminById(session.sub) : null;
  const sessionCurrent = !!admin && admin.active && admin.sessionVersion === session!.sv;

  if (!session || !sessionCurrent) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: 'Unauthorized: a valid admin session is required' },
        { status: 401 }
      ),
      adminEmail: null,
    };
  }

  return { authorized: true as const, response: null, adminEmail: session.email };
}
