import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { DiscountValidateSchema } from '@/src/lib/schemas';
import { getErrorMessage } from '@/src/lib/errors';
import { calculateDiscountInKobo } from '@/server/pricing';
import { formatMoney } from '@/src/lib/money';
import { parseBody } from '@/server/http';

export async function POST(req: NextRequest) {
  try {
    const parsed = await parseBody(req, DiscountValidateSchema, { maxBytes: 2000 });
    if ('response' in parsed) return parsed.response;

    const { code, subtotalInKobo } = parsed.data;

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
