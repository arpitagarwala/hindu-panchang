import type { MetadataRoute } from 'next';
import { INDEXING_ENABLED, absoluteUrl } from '@/lib/site-config';

export default function robots(): MetadataRoute.Robots {
  if (!INDEXING_ENABLED) return { rules: { userAgent: '*', disallow: '/' } };
  return { rules: { userAgent: '*', allow: '/', disallow: ['/api/'] }, sitemap: absoluteUrl('/sitemap.xml') };
}
