import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lookbook',
  description: 'Explore the Deniqwears lookbook: contemporary silhouettes, movement, and style from Lagos.',
  alternates: { canonical: '/lookbook' },
  openGraph: { url: '/lookbook' },
};

export default function LookbookLayout({ children }: { children: React.ReactNode }) {
  return children;
}
