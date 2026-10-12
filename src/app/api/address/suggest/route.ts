import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { autocompleteEnabled, placeToAddress, suggestAddresses } from '@/server/address/autocomplete';
import { getClientIp } from '@/server/request';
import { text } from '@/server/sanitize';
import { parseBody } from '@/server/http';

const SessionToken = z.string().uuid();

const SuggestSchema = z.object({
  action: z.literal('suggest'),
  input: text(120, { min: 3, label: 'Search' }),
  sessionToken: SessionToken,
});
const PlaceSchema = z.object({
  action: z.literal('place'),
  placeId: z.string().min(5).max(300),
  sessionToken: SessionToken,
});

// Typing sends a request per pause, so this is higher than the verify limit,
// but still caps what a script could spend on the key.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 150;
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

/**
 * One endpoint for both steps of autocomplete: `suggest` (as the customer
 * types) and `place` (when they pick one). Every failure degrades to "no
 * suggestions", so the plain form keeps working if Google is unavailable.
 */
export async function POST(req: NextRequest) {
  if (!autocompleteEnabled() || rateLimited(getClientIp(req))) {
    return NextResponse.json({ enabled: false, suggestions: [] });
  }

  const parsed = await parseBody(req, z.union([SuggestSchema, PlaceSchema]), { maxBytes: 2_000 });
  if ('response' in parsed) return parsed.response;
  const body = parsed.data;

  try {
    if (body.action === 'suggest') {
      const suggestions = await suggestAddresses(body.input, body.sessionToken);
      return NextResponse.json({ enabled: true, suggestions });
    }

    const address = await placeToAddress(body.placeId, body.sessionToken);
    return NextResponse.json({ address });
  } catch {
    return NextResponse.json({ enabled: true, suggestions: [], address: null });
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}
