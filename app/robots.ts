import type { MetadataRoute } from 'next';
import { AI_CRAWLERS, DISALLOWED_PATHS, SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: AI_CRAWLERS, allow: '/', disallow: DISALLOWED_PATHS },
      { userAgent: '*', allow: '/', disallow: DISALLOWED_PATHS },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
