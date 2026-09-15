import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '../auth-helper';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) return auth.response!;
  return NextResponse.json({ authenticated: true, admin: { email: auth.adminEmail } });
}
