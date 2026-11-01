import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import SiteFooter from '@/components/Panchang/SiteFooter';
import PwaProvider from '@/components/Pwa/PwaProvider';
import { SITE_URL, SITE_NAME, INDEXING_ENABLED } from '@/lib/site-config';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Today’s Hindu Panchang | Tithi, Muhurat & Vrat — Arpit Agarwala', template: '%s | Panchang' },
  description:
    'Today’s Hindu Panchang for your location: Tithi, Nakshatra, sunrise, Rahu Kalam, Choghadiya, festivals, fasting and parana. Personalize your regional calendar.',
  applicationName: 'Panchang',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Panchang', statusBarStyle: 'default' },
  icons: { icon: [{url:'/icon.svg',type:'image/svg+xml'}, {url:'/pwa/icon-192.png',sizes:'192x192',type:'image/png'}], apple: [{url:'/pwa/apple-touch-icon.png',sizes:'180x180',type:'image/png'}] },
  authors: [{ name: 'Arpit Agarwala', url: 'https://arpitagarwala.com' }],
  creator: 'Arpit Agarwala',
  robots: { index: INDEXING_ENABLED, follow: true, googleBot: { index: INDEXING_ENABLED, follow: true, 'max-image-preview': 'large' } },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || undefined },
  twitter: { card: 'summary_large_image' },
  openGraph: {
    title: 'Panchang — Your Sacred Everyday',
    description: 'Ancient wisdom. Everyday clarity. A personal, location-aware Hindu Panchang and lunar calendar.',
    type: 'website',
    locale: 'en_IN',
    siteName: SITE_NAME,
    url: SITE_URL,
  },
};

export const viewport: Viewport = { width:'device-width', initialScale:1, viewportFit:'cover', themeColor:'#a45b2c' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        {/* RemixIcon CDN */}
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
          rel="stylesheet"
        />
        {/* Noto Serif Devanagari — for Sanskrit/Devanagari text */}
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <PwaProvider>{children}<SiteFooter/></PwaProvider>
      </body>
    </html>
  );
}
