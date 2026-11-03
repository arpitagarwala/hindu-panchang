import type { MetadataRoute } from 'next';
import { absoluteUrl, INDEXING_ENABLED } from '@/lib/site-config';
import { SEO_CITIES } from '@/lib/seo-cities';

export default function sitemap(): MetadataRoute.Sitemap {
  if (!INDEXING_ENABLED) return [];
  return [
    { url: absoluteUrl('/'), changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/jyotish'), changeFrequency: 'monthly', priority: 0.8 },
    { url: absoluteUrl('/about'), changeFrequency: 'monthly', priority: 0.6 },
    { url: absoluteUrl('/privacy'), changeFrequency: 'monthly', priority: 0.3 },
    ...SEO_CITIES.map(city => ({ url: absoluteUrl(`/panchang/${city.slug}`), changeFrequency: 'daily' as const, priority: 0.8 })),
  ];
}
