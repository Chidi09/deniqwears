import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { requireAdminAuth } from '../../auth-helper';
import { QuickEditPayloadSchema } from '@/src/lib/schemas';
import { getErrorMessage } from '@/src/lib/errors';
import { parseBody } from '@/server/http';

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  try {
    const parsed = await parseBody(req, QuickEditPayloadSchema, { maxBytes: 200000 });
    if ('response' in parsed) return parsed.response;

    const { items } = parsed.data;
    await db.quickUpdatePricesAndStock(items, auth.adminEmail!);
    return NextResponse.json({ success: true, count: items.length });
  } catch (err) {
    return NextResponse.json(
      { error: getErrorMessage(err, 'Quick edit failed') },
      { status: 500 }
    );
  }
}
