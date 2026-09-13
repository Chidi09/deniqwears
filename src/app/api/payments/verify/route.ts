import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/server/payment/service';
import { PaymentVerifySchema } from '@/src/lib/schemas';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const parseResult = PaymentVerifySchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Reference and order ID are required' },
        { status: 400 }
      );
    }

    const { reference, orderId } = parseResult.data;
    const result = await paymentService.verifyPayment(reference, orderId);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Payment verification failed:', err);
    return NextResponse.json(
      { error: err.message || 'Payment verification failed' },
      { status: 400 }
    );
  }
}
