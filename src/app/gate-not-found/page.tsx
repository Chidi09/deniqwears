import { notFound } from 'next/navigation';

// Target of the admin gate's 404 rewrite: renders the site's normal not-found page.
export default function GateNotFound() {
  notFound();
}
