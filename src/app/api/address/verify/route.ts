import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAddress } from '@/server/address/verify';
import { getClientIp } from '@/server/request';
import { parseBody } from '@/server/http';
import { US_STATE_CODES, ZIP_PATTERN } from '@/src/lib/address';
import { text } from '@/server/sanitize';

const VerifyRequestSchema = z.object({
  address: text(200, { min: 3, label: 'Street address' }),
  apartment: text(40, { label: 'Apartment' }).optional(),
  city: text(80, { min: 1, label: 'City' }),
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

  const parsed = await parseBody(req, VerifyRequestSchema, { maxBytes: 2_000 });
  if ('response' in parsed) return parsed.response;

  const result = await verifyAddress(parsed.data);
  return NextResponse.json(result);
}
