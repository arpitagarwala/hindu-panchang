import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel packages its own Node functions; retain standalone output for Docker/local hosts.
  output: process.env.VERCEL === '1' ? undefined : 'standalone',
  serverExternalPackages: ['sweph'],
  outputFileTracingIncludes: { '/**': [
    './data/ephemeris/*.se1',
    './node_modules/sweph/prebuilds/**/*.node',
    './node_modules/sweph/build/Release/*.node',
    './node_modules/sweph/LICENSE',
  ] },
  outputFileTracingExcludes: { '/**': ['./.env*'] },
  async headers() {
    return [
      { source: '/:path*', headers: [
        { key: 'Permissions-Policy', value: 'geolocation=(self), camera=(), microphone=()' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
      ] },
      { source: '/api/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      { source: '/sw.js', headers: [
        {key:'Cache-Control',value:'public, max-age=0, must-revalidate'},
        {key:'Service-Worker-Allowed',value:'/'},
        {key:'Content-Type',value:'application/javascript; charset=utf-8'},
      ] },
      { source: '/offline.html', headers: [{key:'X-Robots-Tag',value:'noindex, nofollow'}] },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'substackcdn.com' },
      { protocol: 'https', hostname: 'substack-post-media.s3.amazonaws.com' },
    ],
  },
};

export default nextConfig;
