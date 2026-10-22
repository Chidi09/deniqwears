import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { prisma } from '@/server/prisma';
import { requireAdminAuth } from '../auth-helper';

export const runtime = 'nodejs';

const MAX_FILE_BYTES = 4 * 1024 * 1024; // Vercel caps request bodies at 4.5 MB
const MAX_EDGE_PX = 1600;

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  let file: File | null = null;
  try {
    const form = await req.formData();
    const entry = form.get('file');
    file = entry instanceof File ? entry : null;
  } catch {
    return NextResponse.json({ error: 'Could not read the photo. Please try again.' }, { status: 400 });
  }
  if (!file || file.size === 0) {
    return NextResponse.json({ error: 'Choose a photo to upload.' }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: 'That photo is too large. Please use one under 4 MB.' }, { status: 413 });
  }

  try {
    // Decoding with sharp is the real check that this is an image (the browser's
    // file type can be anything). Re-encoding also strips metadata such as GPS.
    const data = await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 80_000_000 })
      .rotate()
      .resize({ width: MAX_EDGE_PX, height: MAX_EDGE_PX, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    const asset = await prisma.mediaAsset.create({ data: { mime: 'image/webp', data } });
    return NextResponse.json({ url: `/api/media/${asset.id}` }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'That file is not a photo we can use. Please upload a JPG, PNG or WebP image.' },
      { status: 400 }
    );
  }
}
