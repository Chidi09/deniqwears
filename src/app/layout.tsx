import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '../providers/QueryProvider';
import { StoreProvider } from '../context/StoreContext';
import { StoreLayout } from '../components/StoreLayout';
import { MswInit } from '../mocks/MswInit';
import { serializeJsonLd } from '../lib/json-ld';

const siteUrl = process.env.APP_URL?.trim().replace(/\/+$/, '') || 'http://localhost:3000';
const siteName = 'Deniqwears';
const siteDescription =
  'Contemporary womenswear from Lagos — considered silhouettes, editorial pieces, and a private showroom experience.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Deniqwears — The Deniq Edit',
    template: '%s | Deniqwears',
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: ['Deniqwears', 'Nigerian fashion', 'Lagos womenswear', 'contemporary fashion'],
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Deniqwears — The Deniq Edit',
    description: siteDescription,
    url: '/',
    siteName,
    locale: 'en_NG',
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
      inLanguage: 'en-NG',
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F4F1EB] text-[#171714] antialiased selection:bg-[#681F2C] selection:text-[#FAF9F6]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd) }}
        />
        <MswInit />
        <QueryProvider>
          <StoreProvider>
            <StoreLayout>{children}</StoreLayout>
          </StoreProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
