import type { MetadataRoute } from 'next';
import { PUBLIC_PAGES, absoluteUrl } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PAGES.map((p) => ({
    url: absoluteUrl(p.path),
    changeFrequency: 'monthly' as const,
    priority: p.priority,
  }));
}
