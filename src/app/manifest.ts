import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/', name: 'Panchang · Hindu Calendar', short_name: 'Panchang',
    description: 'Daily Hindu Panchang, festivals, fasting and timings in English and Hindi.',
    start_url: '/', scope: '/', display: 'standalone',
    background_color: '#fcfaf5', theme_color: '#a45b2c', lang: 'en',
    categories: ['lifestyle', 'education'], prefer_related_applications: false,
    icons: [
      { src: '/pwa/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/pwa/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/pwa/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Today’s Panchang', short_name: 'Today', url: '/' },
      { name: 'हिन्दी पंचांग', short_name: 'हिन्दी', url: '/?lang=hi' },
      { name: 'Saved offline readings', short_name: 'Saved', url: '/offline.html' },
    ],
  };
}
