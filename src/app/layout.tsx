import type { Metadata } from 'next';
import '@/styles/globals.css';
import { SITE_URL, SITE_NAME, INDEXING_ENABLED } from '@/lib/site-config';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Today’s Hindu Panchang | Tithi, Muhurat & Vrat — Arpit Agarwala', template: '%s | Panchang' },
  description:
    'Today’s Hindu Panchang for your location: Tithi, Nakshatra, sunrise, Rahu Kalam, Choghadiya, festivals, fasting and parana. Personalize your regional calendar.',
  applicationName: 'Panchang',
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
        {children}
        <footer style={{ padding: '16px 24px', textAlign: 'center', fontSize: 14, background: '#fcfaf5', color: '#514c43', borderTop: '1px solid #ded8cb' }}><a href="https://github.com/arpitagarwala/hindu-panchang" style={{ color: '#88401b', textDecoration: 'underline' }}>Source code · GNU AGPL</a></footer>
      </body>
    </html>
  );
}
