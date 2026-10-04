/**
 * Generates the static SEO images, committed to the repo:
 *   - public/og/<slug>.jpg   1200x630 share image per catalogue product
 *   - src/app/favicon.ico, icon.png, apple-icon.png and public/icons/*
 *   - src/lib/og-images.ts   which slugs have a share image
 *
 * Share images are JPEG on a solid background because social apps (WhatsApp,
 * iMessage, X, Facebook) don't reliably render the transparent WebP product
 * photos the site itself uses.
 *
 *   bun scripts/generate-seo-images.ts
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { CATALOG_PRODUCTS } from '../prisma/catalog';

const INDIGO = '#1E2656';
const CREAM = '#F4F1EB';
const INK = '#171714';
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Greedy word wrap using an average glyph width, good enough for headline text. */
function wrap(text: string, fontSize: number, maxWidth: number): string[] {
  const perChar = fontSize * 0.52;
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (next.length * perChar > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** A few faint adire rings on the indigo panel. */
function ringPattern(width: number, height: number, tile = 90): string {
  const rings: string[] = [];
  for (let y = tile / 2; y < height + tile; y += tile) {
    for (let x = tile / 2; x < width + tile; x += tile) {
      rings.push(
        `<circle cx="${x}" cy="${y}" r="26" fill="none" stroke="#FAF9F6" stroke-opacity="0.07" stroke-width="2"/>` +
          `<circle cx="${x}" cy="${y}" r="15" fill="none" stroke="#FAF9F6" stroke-opacity="0.07" stroke-width="2"/>` +
          `<circle cx="${x}" cy="${y}" r="5" fill="#FAF9F6" fill-opacity="0.07"/>`
      );
    }
  }
  return rings.join('');
}

async function productShareImage(name: string, subtitle: string, imagePath: string): Promise<Buffer> {
  const W = 1200;
  const H = 630;
  const panelW = 600;

  const titleSize = 62;
  const titleLines = wrap(name, titleSize, panelW - 120).slice(0, 3);
  const titleSvg = titleLines
    .map((l, i) => `<text x="64" y="${230 + i * (titleSize + 8)}" font-family="${SERIF}" font-size="${titleSize}" fill="#FAF9F6">${esc(l)}</text>`)
    .join('');
  const subY = 230 + titleLines.length * (titleSize + 8) + 14;
  const subLines = wrap(subtitle, 26, panelW - 120).slice(0, 2);
  const subSvg = subLines
    .map((l, i) => `<text x="64" y="${subY + i * 34}" font-family="${SANS}" font-size="26" fill="#FAF9F6" fill-opacity="0.78">${esc(l)}</text>`)
    .join('');

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="${CREAM}"/>
  <rect width="${panelW}" height="${H}" fill="${INDIGO}"/>
  <clipPath id="p"><rect width="${panelW}" height="${H}"/></clipPath>
  <g clip-path="url(#p)">${ringPattern(panelW, H)}</g>
  <text x="64" y="96" font-family="${SANS}" font-size="22" letter-spacing="7" fill="#FAF9F6" fill-opacity="0.85">DENIQWEARS</text>
  <rect x="64" y="118" width="56" height="2" fill="#B07A2E"/>
  ${titleSvg}
  ${subSvg}
  <text x="64" y="${H - 56}" font-family="${SANS}" font-size="22" letter-spacing="2" fill="#FAF9F6" fill-opacity="0.7">SIZES 10–20  ·  SHIPPING ACROSS THE USA</text>
  <text x="64" y="${H - 24}" font-family="${SANS}" font-size="20" letter-spacing="1" fill="#E9C9A0">deniqwears.com</text>
</svg>`;

  const garment = await sharp(imagePath)
    .resize({ height: H - 70, width: W - panelW - 80, fit: 'inside' })
    .toBuffer();
  const meta = await sharp(garment).metadata();

  return sharp(Buffer.from(svg))
    .composite([
      {
        input: garment,
        left: panelW + Math.round((W - panelW - (meta.width ?? 0)) / 2),
        top: Math.round((H - (meta.height ?? 0)) / 2),
      },
    ])
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
}

function iconSvg(size: number): string {
  const r = Math.round(size * 0.2);
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="${INDIGO}"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.42}" fill="none" stroke="#FAF9F6" stroke-opacity="0.22" stroke-width="${Math.max(1, size * 0.012)}"/>
  <text x="50%" y="${size * 0.69}" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="${size * 0.62}" fill="#FAF9F6">D</text>
</svg>`;
}

const icon = (size: number) => sharp(Buffer.from(iconSvg(size))).png().toBuffer();

/** ICO container holding PNG images (supported by every current browser). */
function buildIco(images: { size: number; png: Buffer }[]): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, png }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(png.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += png.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...images.map((i) => i.png)]);
}

async function main() {
  await mkdir('public/og', { recursive: true });
  await mkdir('public/icons', { recursive: true });

  const slugs: string[] = [];
  for (const p of CATALOG_PRODUCTS) {
    const file = `public${p.primaryImage}`;
    const jpg = await productShareImage(p.name, p.editorialSubtitle ?? '', file);
    await writeFile(`public/og/${p.slug}.jpg`, jpg);
    slugs.push(p.slug);
    console.log(`og/${p.slug}.jpg  ${(jpg.length / 1024).toFixed(0)} KB`);
  }

  await writeFile(
    'src/lib/og-images.ts',
    `// Generated by scripts/generate-seo-images.ts. Do not edit by hand.\n` +
      `/** Products that have a 1200x630 share image at /og/<slug>.jpg. */\n` +
      `export const PRODUCTS_WITH_SHARE_IMAGE = new Set<string>(${JSON.stringify(slugs, null, 2)});\n`
  );

  const [i16, i32, i48, i180, i192, i512] = await Promise.all([16, 32, 48, 180, 192, 512].map(icon));
  await writeFile('src/app/favicon.ico', buildIco([{ size: 16, png: i16 }, { size: 32, png: i32 }, { size: 48, png: i48 }]));
  await writeFile('src/app/icon.png', i512);
  await writeFile('src/app/apple-icon.png', i180);
  await writeFile('public/icons/icon-192.png', i192);
  await writeFile('public/icons/icon-512.png', i512);
  console.log('icons written');
}

main();
