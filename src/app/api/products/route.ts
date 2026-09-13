import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function GET() {
  const products = db.getProducts(false); // live only
  return NextResponse.json({ products });
}
