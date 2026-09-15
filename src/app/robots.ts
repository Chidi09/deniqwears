import type { MetadataRoute } from 'next';
import { getAppUrl } from '@/server/config';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.APP_URL ? getAppUrl() : 'http://localhost:3000';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The back-office and API are not content; keep them out of the index.
      disallow: ['/admin', '/api/', '/checkout'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
