import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAddress } from '@/server/address/verify';
import { getClientIp } from '@/server/request';
import { US_STATE_CODES, ZIP_PATTERN } from '@/src/lib/address';

const VerifyRequestSchema = z.object({
  address: z.string().trim().min(3).max(200),
  apartment: z.string().trim().max(100).optional(),
  city: z.string().trim().min(1).max(80),
  state: z.string().refine((s) => US_STATE_CODES.has(s), 'Choose a valid US state'),
  postalCode: z.string().trim().regex(ZIP_PATTERN, 'Enter a valid ZIP code'),
});

// Verification calls can be metered by the provider, so cap them per visitor.
// In-memory means the cap is per server instance, which is plenty to stop a
// script from burning the quota without needing a shared store.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [key, times] of hits) if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
  }
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(req: NextRequest) {
  if (rateLimited(getClientIp(req))) {
    // Not an error for the customer: they continue without the extra check.
    return NextResponse.json({ status: 'unverified' });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const parsed = VerifyRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid address' }, { status: 400 });
  }

  const result = await verifyAddress(parsed.data);
  return NextResponse.json(result);
}
