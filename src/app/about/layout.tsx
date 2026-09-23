import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Deniqwears',
  description: 'Learn about Deniqwears, a US-based womenswear label designing statement pieces in sizes 10 to 20.',
  alternates: { canonical: '/about' },
  openGraph: { url: '/about' },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
