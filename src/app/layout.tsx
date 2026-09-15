import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '../providers/QueryProvider';
import { StoreProvider } from '../context/StoreContext';
import { StoreLayout } from '../components/StoreLayout';
import { MswInit } from '../mocks/MswInit';

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
    <html lang="en">
      <body className="bg-[#F4F1EB] text-[#171714] antialiased selection:bg-[#681F2C] selection:text-[#FAF9F6]">
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
