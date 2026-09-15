import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Deniqwears',
  description: 'Learn about Deniqwears, a Lagos-based contemporary womenswear label shaped by considered design and personal expression.',
  alternates: { canonical: '/about' },
  openGraph: { url: '/about' },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
