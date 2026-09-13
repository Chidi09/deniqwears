import { NextRequest, NextResponse } from 'next/server';

export const VALID_TOKENS = new Set<string>(['deniq_admin_sess_2026_master']);

export function requireAdminAuth(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : req.headers.get('x-admin-token');

  if (!token || !VALID_TOKENS.has(token)) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Unauthorized: Valid admin authentication token required' },
        { status: 401 }
      ),
      adminEmail: null,
    };
  }

  return {
    authorized: true,
    response: null,
    adminEmail: 'admin@deniqwears.com',
  };
}
