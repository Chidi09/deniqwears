import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    store: 'Deniqwears API',
    timestamp: new Date().toISOString(),
  });
}
