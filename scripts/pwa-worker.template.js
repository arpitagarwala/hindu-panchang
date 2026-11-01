/* Only the offline reader and its assets are cached. API responses, HTML app
 * shells and Next.js chunks stay on the network so updates cannot mix releases
 * or silently present saved astronomical data as a fresh calculation. */
const CACHE = 'panchang-pwa-__PWA_VERSION__';
const ASSETS = ['/offline.html', '/pwa/offline.js', '/pwa/icon-192.png', '/pwa/icon-512.png', '/pwa/maskable-512.png', '/pwa/apple-touch-icon.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('panchang-pwa-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  // Never cache or intercept calculation, geocoding or provider API responses.
  if (url.pathname.startsWith('/api/')) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () => (await caches.open(CACHE)).match('/offline.html')));
  } else if (ASSETS.includes(url.pathname)) {
    event.respondWith(caches.open(CACHE).then(async cache => (await cache.match(url.pathname)) || fetch(request)));
  }
});
