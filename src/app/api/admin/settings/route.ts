import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { requireAdminAuth } from '../auth-helper';
import { StoreSettingsUpdateSchema } from '@/src/lib/schemas';
import { getErrorMessage } from '@/src/lib/errors';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  const settings = await db.getSettings({ includeInactiveZones: true });
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdminAuth(req);
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

    const updated = await db.updateSettings(
      parseResult.data as Parameters<typeof db.updateSettings>[0],
      auth.adminEmail!
    );
    return NextResponse.json({ settings: updated });
  } catch (err) {
    return NextResponse.json(
      { error: getErrorMessage(err, 'Failed to update settings') },
      { status: 500 }
    );
  }
}
