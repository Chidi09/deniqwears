import type { Metadata } from 'next';
import { LegalPage } from '../../components/LegalPage';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Learn about cookies, saved cart and checkout data, and how to manage browser storage at Deniqwears.',
  alternates: { canonical: '/cookie-policy' },
  openGraph: { title: 'Cookie Policy | Deniqwears', url: '/cookie-policy' },
};

export default function CookiePolicy() {
  return <LegalPage policy="cookies" />;
}
