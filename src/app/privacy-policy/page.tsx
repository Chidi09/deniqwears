import type { Metadata } from 'next';
import { LegalPage } from '../../components/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Deniqwears collects, uses and protects your personal information when you shop or subscribe.',
  alternates: { canonical: '/privacy-policy' },
  openGraph: { title: 'Privacy Policy | Deniqwears', url: '/privacy-policy' },
};

export default function PrivacyPolicy() {
  return <LegalPage policy="privacy" />;
}
