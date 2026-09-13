import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { requireAdminAuth } from '../../auth-helper';
import { QuickEditPayloadSchema } from '@/src/lib/schemas';

export async function POST(req: NextRequest) {
  const auth = requireAdminAuth(req);
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
    db.quickUpdatePricesAndStock(items, auth.adminEmail!);
    return NextResponse.json({ success: true, count: items.length });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Quick edit failed' },
      { status: 500 }
    );
  }
}
