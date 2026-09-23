import type { Metadata } from 'next';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '../providers/QueryProvider';
import { StoreProvider } from '../context/StoreContext';
import { StoreLayout } from '../components/StoreLayout';
import { MswInit } from '../mocks/MswInit';
import { serializeJsonLd } from '../lib/json-ld';

// Cormorant for editorial headings, Jost for everything people read and tap.
const displayFont = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
});
const bodyFont = Jost({ subsets: ['latin'], variable: '--font-body' });

const siteUrl = process.env.APP_URL?.trim().replace(/\/+$/, '') || 'http://localhost:3000';
const siteName = 'Deniqwears';
const siteDescription =
  'Contemporary womenswear in sizes 10 to 20 — statement dresses, sets and occasion pieces in linen, Ankara cotton and amwete. Shipping across the USA.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Deniqwears — The Deniq Edit',
    template: '%s | Deniqwears',
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: ['Deniqwears', 'womenswear sizes 10-20', 'Ankara dresses', 'linen sets', 'occasion wear'],
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Deniqwears — The Deniq Edit',
    description: siteDescription,
    url: '/',
    siteName,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: siteName,
      url: siteUrl,
      description: siteDescription,
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      name: siteName,
      url: siteUrl,
      publisher: { '@id': `${siteUrl}/#organization` },
      inLanguage: 'en-US',
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="bg-[#F4F1EB] text-[#171714] antialiased selection:bg-[#681F2C] selection:text-[#FAF9F6]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd) }}
        />
        <MswInit>
          <QueryProvider>
            <StoreProvider>
              <StoreLayout>{children}</StoreLayout>
            </StoreProvider>
          </QueryProvider>
        </MswInit>
      </body>
    </html>
  );
}
