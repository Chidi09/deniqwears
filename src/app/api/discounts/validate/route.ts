import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { DiscountValidateSchema } from '@/src/lib/schemas';
import { getErrorMessage } from '@/src/lib/errors';
import { calculateDiscountInKobo } from '@/server/pricing';
import { formatMoney } from '@/src/lib/money';

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

    const discount = await db.getDiscount(code);
    if (!discount) {
      return NextResponse.json(
        { error: 'Invalid or expired promotional code' },
        { status: 404 }
      );
    }

    if (discount.minSpendInKobo && subtotalInKobo < discount.minSpendInKobo) {
      return NextResponse.json(
        {
          error: `Promotion requires a minimum bag value of ${formatMoney(discount.minSpendInKobo)}`,
        },
        { status: 400 }
      );
    }

    const discountInKobo = calculateDiscountInKobo(subtotalInKobo, discount);

    return NextResponse.json({
      valid: true,
      code: discount.code,
      type: discount.type,
      discountInKobo,
    });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error, 'Error validating promotional code') },
      { status: 500 }
    );
  }
}
