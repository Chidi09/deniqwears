import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lookbook',
  description: 'Explore the Deniqwears lookbook: Deniqwears pieces styled and worn.',
  alternates: { canonical: '/lookbook' },
  openGraph: { url: '/lookbook' },
};

export default function LookbookLayout({ children }: { children: React.ReactNode }) {
  return children;
}
