/**
 * Loads the Deniqwears catalogue (prisma/catalog.ts) into an existing
 * database, and archives anything live that isn't part of it (the original
 * demo pieces). Archiving keeps order history intact and can be undone from
 * Admin → Products.
 *
 * Existing catalogue products are left untouched, so prices, stock or copy
 * the owner has already edited are never overwritten.
 *
 *   bun scripts/import-catalog.ts
 */
import { PrismaClient } from '@prisma/client';
import { CATALOG_PRODUCTS, CATALOG_SLUGS } from '../prisma/catalog';

const prisma = new PrismaClient();

async function main() {
  let created = 0;
  for (const product of CATALOG_PRODUCTS) {
    const exists = await prisma.product.findUnique({ where: { slug: product.slug }, select: { id: true } });
    if (exists) continue;
    const { variants, ...rest } = product;
    await prisma.product.create({ data: { ...rest, variants: { create: variants } } });
    created++;
  }

  const archived = await prisma.product.updateMany({
    where: { slug: { notIn: CATALOG_SLUGS }, status: { not: 'archived' } },
    data: { status: 'archived' },
  });

  console.log(`Created ${created} catalogue products; archived ${archived.count} products not in the catalogue.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
