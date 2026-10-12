import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { requireAdminAuth } from '../auth-helper';
import { StoreSettingsUpdateSchema } from '@/src/lib/schemas';
import { getErrorMessage } from '@/src/lib/errors';
import { parseBody } from '@/server/http';

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
    const parsed = await parseBody(req, StoreSettingsUpdateSchema, { maxBytes: 100000 });
    if ('response' in parsed) return parsed.response;

    const updated = await db.updateSettings(
      parsed.data as Parameters<typeof db.updateSettings>[0],
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
