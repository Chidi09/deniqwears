import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { getClientIp } from '@/server/request';
import { AdminLoginSchema } from '@/src/lib/schemas';
import { getErrorMessage } from '@/src/lib/errors';
import {
  verifyPassword,
  createAdminSessionToken,
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  DUMMY_PASSWORD_HASH,
} from '@/server/auth';

const MAX_FAILED_ATTEMPTS = 8;
const RATE_LIMIT_WINDOW_MINUTES = 15;

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const parseResult = AdminLoginSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid credentials format' },
        { status: 400 }
      );
    }

    const { email, password } = parseResult.data;
    const ipAddress = getClientIp(req);

    const recentFailures = await db.countRecentFailedLoginAttempts(
      email,
      ipAddress,
      RATE_LIMIT_WINDOW_MINUTES
    );
    if (recentFailures >= MAX_FAILED_ATTEMPTS) {
      return NextResponse.json(
        { error: 'Too many failed sign-in attempts. Please try again in a few minutes.' },
        { status: 429 }
      );
    }

    const admin = await db.getAdminByEmail(email);

    // Always run bcrypt.compare, even on a missing account, so response timing
    // doesn't reveal which admin emails exist.
    const passwordValid = await verifyPassword(password, admin?.passwordHash ?? DUMMY_PASSWORD_HASH);

    if (admin && !admin.active) {
      await db.recordLoginAttempt(email, ipAddress, false);
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    if (!admin || !passwordValid) {
      await db.recordLoginAttempt(email, ipAddress, false);
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    await db.recordLoginAttempt(email, ipAddress, true);

    const token = await createAdminSessionToken({
      sub: admin.id,
      email: admin.email,
      name: admin.name,
      role: 'ADMIN',
      sv: admin.sessionVersion,
    });

    await db.recordAdminLogin(admin.id);
    await db.logActivity({
      adminEmail: admin.email,
      action: 'Admin signed in',
      entityType: 'settings',
      details: 'Showroom manager authenticated to back-office',
    });

    const response = NextResponse.json({
      success: true,
      admin: { email: admin.email, name: admin.name, role: 'ADMIN' as const },
    });

    response.cookies.set(ADMIN_SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (err) {
    console.error('Admin login error:', err);
    return NextResponse.json({ error: getErrorMessage(err, 'Login error') }, { status: 500 });
  }
}
