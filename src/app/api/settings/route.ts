import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function GET() {
  const settings = await db.getSettings();
  return NextResponse.json({ settings });
}
