import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center bg-[#F4F1EB]">
      <span className="text-xs uppercase tracking-[0.3em] text-[#681F2C] font-semibold mb-3">Not found</span>
      <h1 className="font-serif text-3xl md:text-5xl text-[#171714] mb-6">We couldn&rsquo;t find that page</h1>
      <p className="text-[#56554F] text-sm max-w-md mb-8">
        It may have sold out or been removed. Have a look at what&rsquo;s new instead.
      </p>
      <Link
        href="/shop"
        className="inline-flex items-center text-xs uppercase tracking-widest bg-[#171714] text-[#FAF9F6] px-6 py-3.5 hover:bg-[#681F2C] transition-colors"
      >
        Shop new in
      </Link>
    </div>
  );
}
