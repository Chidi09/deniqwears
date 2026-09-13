import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { requireAdminAuth } from '../auth-helper';
import { StoreSettingsUpdateSchema } from '@/src/lib/schemas';

export async function GET(req: NextRequest) {
  const auth = requireAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  const settings = db.getSettings();
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const auth = requireAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  try {
    const rawBody = await req.json();
    const parseResult = StoreSettingsUpdateSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid store settings payload' },
        { status: 400 }
      );
    }

    const updated = db.updateSettings(parseResult.data as any, auth.adminEmail!);
    return NextResponse.json({ settings: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
