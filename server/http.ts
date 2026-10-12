import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ID } from './sanitize';

/** Either the validated data, or the response to send back. Check with `'response' in parsed`. */
export type Parsed<T> = { data: T } | { response: NextResponse };

const DEFAULT_MAX_BYTES = 100_000;

/**
 * The one way routes read a request body. It refuses anything that isn't a
 * reasonably small JSON document, validates it against a Zod schema, and
 * answers with the first plain-language problem. Unknown fields are dropped by
 * the schema, so callers can only ever set fields the schema names.
 */
export async function parseBody<S extends z.ZodTypeAny>(
  req: NextRequest,
  schema: S,
  options: { maxBytes?: number } = {}
): Promise<Parsed<z.output<S>>> {
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const fail = (error: string, status: number): Parsed<never> => ({
    response: NextResponse.json({ error }, { status }),
  });

  if (!(req.headers.get('content-type') ?? '').toLowerCase().includes('application/json')) {
    return fail('Unsupported request type', 415);
  }
  const declared = Number(req.headers.get('content-length') ?? 0);
  if (declared > maxBytes) return fail('Request too large', 413);

  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return fail('Invalid request', 400);
  }
  if (raw.length > maxBytes) return fail('Request too large', 413);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail('Invalid request', 400);
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return fail(result.error.issues[0]?.message || 'Please check the details you entered', 400);
  }
  return { data: result.data };
}

/** Route ids go straight into queries (parameterised, so safe) but should still look like ids. */
export const isValidId = (value: string) => ID.test(value);
export const invalidId = () => NextResponse.json({ error: 'Not found' }, { status: 404 });
