import type { MetadataRoute } from 'next';
import { GUIDES, SITE_URL } from '@/lib/guides';

const STATIC_PATHS = ['/', '/audit', '/checklist', '/ai-risk-tier', '/guides'];

export default function sitemap(): MetadataRoute.Sitemap {
  return [...STATIC_PATHS, ...GUIDES.map((g) => g.path)].map((p) => ({
    url: `${SITE_URL}${p === '/' ? '' : p}`,
  }));
}
