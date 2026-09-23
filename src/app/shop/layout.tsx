import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop Contemporary Womenswear',
  description: 'Explore Deniqwears: contemporary womenswear, considered silhouettes, and signature occasion pieces in sizes 10 to 20.',
  alternates: { canonical: '/shop' },
  openGraph: { url: '/shop' },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
