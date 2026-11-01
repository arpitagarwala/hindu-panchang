const configuredUrl = process.env.SITE_URL?.trim();
const origin = new URL(configuredUrl || 'http://localhost:3000');
if (!['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) {
  throw new Error('SITE_URL must be a plain HTTP(S) site origin.');
}
export const SITE_URL = origin.origin;
export const SITE_NAME = 'Panchang by Arpit Agarwala';
export const INDEXING_ENABLED = process.env.SITE_INDEXING === 'true' && origin.protocol === 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname);
export const absoluteUrl = (pathname: string) => new URL(pathname, SITE_URL).href;
