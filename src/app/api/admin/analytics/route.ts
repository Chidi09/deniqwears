import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { requireAdminAuth } from '../auth-helper';
import { getErrorMessage } from '@/src/lib/errors';

const PERIOD_DAYS: Record<string, number> = {
  today: 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
  all: 3650,
};

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  try {
    const periodKey = req.nextUrl.searchParams.get('period') ?? '30d';
    const days = PERIOD_DAYS[periodKey] ?? PERIOD_DAYS['30d'];

    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - (days - 1));

    // Trend is capped at 90 bars so "all time" doesn't render a decade of them.
    const seriesDays = Math.min(days, 90);

    const [summary, series, paymentMethods, topProducts] = await Promise.all([
      db.getFinanceSummary(since),
      db.getRevenueSeries(seriesDays),
      db.getPaymentMethodBreakdown(since),
      db.getTopProducts(since),
    ]);

    return NextResponse.json({
      period: periodKey,
      since: since.toISOString(),
      summary,
      series,
      paymentMethods,
      topProducts,
    });
  } catch (err) {
    console.error('Analytics error:', err);
    return NextResponse.json({ error: getErrorMessage(err, 'Failed to load analytics') }, { status: 500 });
  }
}
