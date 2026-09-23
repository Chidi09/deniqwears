import type { MetadataRoute } from 'next';
import { db } from '@/server/db';
import { getAppUrl } from '@/server/config';

/**
 * Generated from the live catalog, so newly published garments are
 * discoverable and archived ones drop out on their own.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.APP_URL ? getAppUrl() : 'http://localhost:3000';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/shop`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/about`, changeFrequency: 'yearly', priority: 0.4 },
  ];

  try {
    const products = await db.getProducts(); // live only
    return [
      ...staticRoutes,
      ...products.map((product) => ({
        url: `${base}/product/${product.slug}`,
        lastModified: new Date(product.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
    ];
  } catch {
    // A database hiccup shouldn't take the sitemap down entirely.
    return staticRoutes;
  }
}
