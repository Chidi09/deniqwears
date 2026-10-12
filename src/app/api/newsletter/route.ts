import { NextRequest, NextResponse } from 'next/server';
import { NewsletterSubscribeSchema } from '@/src/lib/schemas';
import { parseBody } from '@/server/http';
import { prisma } from '@/server/prisma';

/**
 * Real subscription persistence. The form previously only flipped local state,
 * so every address a customer entered was discarded while the UI promised
 * them early access.
 */
export async function POST(req: NextRequest) {
  const parsed = await parseBody(req, NewsletterSubscribeSchema, { maxBytes: 1_000 });
  if ('response' in parsed) return parsed.response;
  const { email } = parsed.data;

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
