import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { DiscountValidateSchema } from '@/src/lib/schemas';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const parseResult = DiscountValidateSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid discount request' },
        { status: 400 }
      );
    }

    const { code, subtotalInKobo } = parseResult.data;

    const discount = db.getDiscount(code);
    if (!discount) {
      return NextResponse.json(
        { error: 'Invalid or expired promotional code' },
        { status: 404 }
      );
    }

    if (discount.minSpendInKobo && subtotalInKobo < discount.minSpendInKobo) {
      return NextResponse.json(
        {
          error: `Promotion requires a minimum bag value of ₦${(discount.minSpendInKobo / 100).toLocaleString()}`,
        },
        { status: 400 }
      );
    }

    let discountInKobo = 0;
    if (discount.type === 'percentage') {
      discountInKobo = Math.round((subtotalInKobo * discount.value) / 100);
    } else {
      discountInKobo = Math.min(discount.value, subtotalInKobo);
    }

    return NextResponse.json({
      valid: true,
      code: discount.code,
      type: discount.type,
      discountInKobo,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error validating promotional code' },
      { status: 500 }
    );
  }
}
