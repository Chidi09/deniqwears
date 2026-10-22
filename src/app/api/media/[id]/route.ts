import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/prisma';
import { isValidId } from '@/server/http';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!isValidId(id)) return new NextResponse('Not found', { status: 404 });

  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return new NextResponse('Not found', { status: 404 });

  // Uploaded photos never change (a replacement gets a new id), so cache them for good.
  return new NextResponse(new Uint8Array(asset.data), {
    headers: {
      'Content-Type': asset.mime,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
