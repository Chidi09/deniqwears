import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { VALID_TOKENS } from '../auth-helper';
import { AdminLoginSchema } from '@/src/lib/schemas';

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

    // Secure showroom admin credentials
    if (
      email === 'admin@deniqwears.com' &&
      (password === 'deniq2026' || password === 'admin')
    ) {
      const token = 'deniq_admin_sess_2026_master';
      VALID_TOKENS.add(token);

      db.logActivity({
        adminEmail: email,
        action: 'Admin signed in',
        entityType: 'settings',
        details: 'Showroom manager authenticated to back-office',
      });

      return NextResponse.json({
        success: true,
        token,
        admin: {
          email,
          name: 'Deniq Showroom Manager',
          role: 'ADMIN',
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid admin credentials' },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Login error' },
      { status: 500 }
    );
  }
}
