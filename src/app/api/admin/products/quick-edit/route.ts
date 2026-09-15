import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { requireAdminAuth } from '../../auth-helper';
import { QuickEditPayloadSchema } from '@/src/lib/schemas';
import { getErrorMessage } from '@/src/lib/errors';

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  try {
    const rawBody = await req.json();
    const parseResult = QuickEditPayloadSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid quick edit payload' },
        { status: 400 }
      );
    }

    const { items } = parseResult.data;
    await db.quickUpdatePricesAndStock(items, auth.adminEmail!);
    return NextResponse.json({ success: true, count: items.length });
  } catch (err) {
    return NextResponse.json(
      { error: getErrorMessage(err, 'Quick edit failed') },
      { status: 500 }
    );
  }
}
