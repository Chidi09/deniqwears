import type { Metadata } from 'next';
import { Instrument_Serif, Manrope } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '../providers/QueryProvider';
import { StoreProvider } from '../context/StoreContext';
import { StoreLayout } from '../components/StoreLayout';

const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const manrope = Manrope({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Deniqwears — The Deniq Edit',
  description: 'The Deniq Edit — Contemporary fashion boutique, editorial magazine, and private showroom.',
  openGraph: {
    title: 'Deniqwears — The Deniq Edit',
    description: 'The Deniq Edit — Contemporary fashion boutique, editorial magazine, and private showroom.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${manrope.variable}`}>
      <body className="bg-[#F4F1EB] text-[#171714] antialiased selection:bg-[#681F2C] selection:text-[#FAF9F6]">
        <QueryProvider>
          <StoreProvider>
            <StoreLayout>{children}</StoreLayout>
          </StoreProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
