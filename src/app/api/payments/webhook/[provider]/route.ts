import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/server/payment/service';

const SIGNATURE_HEADERS: Record<string, string> = {
  paystack: 'x-paystack-signature',
  flutterwave: 'verif-hash',
  stripe: 'stripe-signature',
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;

    // Signature verification requires the exact, unmodified request body —
    // never JSON.parse first, or the HMAC/hash will never match.
    const rawBody = await req.text();
    const signatureHeader = SIGNATURE_HEADERS[provider];
    const signature = signatureHeader ? req.headers.get(signatureHeader) || undefined : undefined;

    const result = await paymentService.handleWebhook(provider, rawBody, signature);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === 'Invalid webhook signature') {
      console.warn('Rejected webhook with invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    console.error('Webhook error:', err);
    return new NextResponse('Webhook processing failed', { status: 500 });
  }
}
