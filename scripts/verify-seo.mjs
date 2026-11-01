import assert from 'node:assert/strict';
const base = process.env.PANCHANG_TEST_URL || 'http://localhost:3000';
const indexed = process.env.PANCHANG_EXPECT_INDEXING === 'true';
let checks = 0;
function check(value, message) { assert.ok(value, message); checks++; }
async function html(path) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, path); checks++;
  return { text: await response.text(), response };
}
const home = await html('/');
check(home.text.includes('Today’s Hindu Panchang') || home.text.includes('Today&#x27;s Hindu Panchang'), 'Descriptive server-visible title');
check(home.text.includes('application/ld+json'), 'Structured data present');
check(home.text.includes('rel="canonical"'), 'Home has canonical');
check(home.text.includes('/panchang/new-delhi'), 'Crawlable city links');
check(home.text.includes('Change Panchang location'), 'Compact location control remains visible before interaction');
check(home.text.includes(indexed ? 'content="index, follow' : 'content="noindex, follow'), 'Preview/production index directive');
check(home.response.headers.get('permissions-policy')?.includes('geolocation=(self)'), 'Same-origin geolocation is permitted');
for (const slug of ['new-delhi', 'mumbai', 'bengaluru', 'varanasi', 'ujjain']) {
  const { text } = await html(`/panchang/${slug}`);
  check(text.includes('<table') && text.includes('Rahu Kalam') && text.includes('Nakshatra'), `${slug} data is in initial HTML`);
  check(text.includes(`rel="canonical" href="`) && text.includes(`/panchang/${slug}`), `${slug} has canonical`);
  check(text.includes('North Indian preset'), 'Conventions explicitly explained');
  check(text.includes('BreadcrumbList'), 'City breadcrumbs have structured data');
}
const missing = await fetch(new URL('/panchang/this-city-does-not-exist', base));
check(missing.status === 404, 'Unknown city gives 404');
await html('/about'); await html('/privacy');
const robots = (await html('/robots.txt')).text;
check(indexed ? robots.includes('Allow: /') && robots.includes('Sitemap: https://') : robots.includes('Disallow: /'), 'Robots follows deployment indexing mode');
const sitemap = (await html('/sitemap.xml')).text;
check(indexed ? sitemap.includes('/panchang/new-delhi</loc>') && sitemap.includes('https://') : !sitemap.includes('<loc>'), 'Only launch-configured URLs enter sitemap');
const api = await fetch(new URL('/api/panchang/source', base));
check(api.headers.get('x-robots-tag') === 'noindex, nofollow', 'API excluded from search results');
const image = await fetch(new URL('/opengraph-image', base));
check(image.status === 200 && image.headers.get('content-type')?.includes('image/png'), 'Generated social image works');
console.log(`Passed ${checks} SEO, server-rendered city-page, location-control and indexing checks (${indexed ? 'public' : 'preview'} configuration). This does not submit or guarantee Google indexing.`);
