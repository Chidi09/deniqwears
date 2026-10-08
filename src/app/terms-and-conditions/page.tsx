import type { Metadata } from 'next';
import { LegalPage } from '../../components/LegalPage';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Read the Deniqwears terms for orders, payments, delivery, returns and use of our website.',
  alternates: { canonical: '/terms-and-conditions' },
  openGraph: { title: 'Terms & Conditions | Deniqwears', url: '/terms-and-conditions' },
};

export default function TermsAndConditions() {
  return <LegalPage policy="terms" />;
}
