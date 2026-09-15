import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/server/prisma';

const SubscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address').max(200),
});

/**
 * Real subscription persistence. The form previously only flipped local state,
 * so every address a customer entered was discarded while the UI promised
 * them early access.
 */
export async function POST(req: NextRequest) {
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const parseResult = SubscribeSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.issues[0]?.message || 'Please enter a valid email address' },
      { status: 400 }
    );
  }

  const { email } = parseResult.data;

  try {
    // Re-subscribing is idempotent and clears any previous opt-out.
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { unsubscribedAt: null },
      create: { email },
    });

    return NextResponse.json({ subscribed: true });
  } catch (err) {
    console.error('Newsletter subscription failed:', err);
    return NextResponse.json(
      { error: 'We could not save your details just now. Please try again shortly.' },
      { status: 500 }
    );
  }
}
