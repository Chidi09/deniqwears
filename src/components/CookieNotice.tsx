'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const NOTICE_STORAGE_KEY = 'deniq_cookie_notice';

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Read after hydration so the server and first client render agree.
    const frame = window.requestAnimationFrame(() => {
      try {
        setVisible(window.localStorage.getItem(NOTICE_STORAGE_KEY) !== 'seen');
      } catch {
        // The notice still works when the browser blocks storage.
        setVisible(true);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      window.localStorage.setItem(NOTICE_STORAGE_KEY, 'seen');
    } catch {
      // Dismiss for this visit even when the preference cannot be saved.
    }
  }

  if (!visible) return null;

  return (
    <section
      aria-labelledby="cookie-notice-title"
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:bottom-6 sm:left-6 sm:max-w-[420px] z-50 border border-[#D8D4CC] bg-[#FAF9F6] p-5 sm:p-6 shadow-[0_8px_32px_rgba(23,23,20,0.16)]"
    >
      <h2 id="cookie-notice-title" className="font-serif text-2xl text-[#171714] mb-3">A little note on cookies.</h2>
      <p className="text-sm leading-relaxed text-[#56554F]">
        We use browser storage to remember your bag and checkout details, and cookies for staff sign-in.
        We don’t use advertising or analytics trackers.
      </p>
      <div className="flex items-center justify-between gap-5 mt-5">
        <Link href="/cookie-policy" className="text-xs text-[#56554F] underline underline-offset-4 hover:text-[#681F2C]">Read our Cookie Policy</Link>
        <button type="button" onClick={dismiss} className="shrink-0 bg-[#171714] px-5 py-3 text-xs uppercase tracking-[0.16em] font-semibold text-[#FAF9F6] hover:bg-[#681F2C] transition-colors">Got it</button>
      </div>
    </section>
  );
}
