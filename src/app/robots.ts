import type { MetadataRoute } from 'next';
import { getAppUrl } from '@/server/config';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.APP_URL ? getAppUrl() : 'http://localhost:3000';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The API and checkout are not content; keep them out of the index.
      // The admin is kept out of search by its noindex tag and the entry gate;
      // listing it here would only advertise where it is.
      disallow: ['/api/', '/checkout'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
