import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/server/payment/service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const signature = req.headers.get('x-paystack-signature') || undefined;
    const body = await req.json();

    const result = await paymentService.handleWebhook(provider, body, signature);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Webhook error:', err);
    return new NextResponse('Webhook processing failed', { status: 500 });
  }
}
