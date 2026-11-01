import PanchangApp from '@/components/Panchang/PanchangApp';
import { absoluteUrl, SITE_NAME } from '@/lib/site-config';

export const metadata = { alternates: { canonical: '/' } };

export default function Home() {
  const structuredData = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebSite', '@id': absoluteUrl('/#website'), url: absoluteUrl('/'), name: SITE_NAME, inLanguage: ['en', 'hi'] },
    { '@type': 'WebApplication', name: SITE_NAME, url: absoluteUrl('/'), applicationCategory: 'LifestyleApplication', operatingSystem: 'Any', browserRequirements: 'JavaScript required for personalization', isAccessibleForFree: true, author: { '@type': 'Person', name: 'Arpit Agarwala', url: 'https://arpitagarwala.com' } },
  ] };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replaceAll('<', '\\u003c') }}/><PanchangApp /></>;
}
