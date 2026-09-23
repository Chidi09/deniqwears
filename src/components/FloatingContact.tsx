import React from 'react';
import { Mail } from 'lucide-react';

interface FloatingContactProps {
  whatsApp?: string;
  email?: string;
  /** Sit higher on phones where a page has its own sticky bottom bar. */
  raised?: boolean;
}

const WhatsAppGlyph: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.2-3.58.93.96-3.49-.23-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.22 4.25-9.47 9.48-9.47 2.53 0 4.9.99 6.7 2.78a9.4 9.4 0 0 1 2.77 6.7c0 5.22-4.25 9.46-9.47 9.46zm8.06-17.53A11.33 11.33 0 0 0 12.04.63C5.76.63.65 5.74.65 12.02c0 2 .52 3.96 1.52 5.69L.55 23.6l6.03-1.58a11.36 11.36 0 0 0 5.45 1.39h.01c6.28 0 11.39-5.11 11.39-11.39 0-3.04-1.18-5.9-3.33-8.05z" />
  </svg>
);

/** wa.me only accepts the number as digits, with country code and no "+". */
function whatsAppLink(number: string): string | null {
  const digits = number.replace(/\D/g, '');
  if (digits.length < 8) return null;
  const text = encodeURIComponent(`Hi Deniqwears, I have a question: ${window.location.href}`);
  return `https://wa.me/${digits}?text=${text}`;
}

/**
 * Always-visible contact shortcuts, bottom-right. WhatsApp is the big one —
 * a single tap opens the chat — with email stacked just above it.
 */
export const FloatingContact: React.FC<FloatingContactProps> = ({ whatsApp, email, raised = false }) => {
  if (!whatsApp && !email) return null;

  const openWhatsApp = () => {
    const link = whatsApp && whatsAppLink(whatsApp);
    if (link) window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={`fixed right-4 sm:right-6 z-40 flex flex-col items-end gap-3 transition-[bottom] duration-300 ${
        raised ? 'bottom-24 sm:bottom-6' : 'bottom-5 sm:bottom-6'
      }`}
    >
      {email && (
        <a
          href={`mailto:${email}?subject=${encodeURIComponent('Question for Deniqwears')}`}
          className="group relative w-12 h-12 rounded-full bg-[#FAF9F6] text-[#171714] border border-[#D8D4CC] shadow-[0_6px_20px_rgba(23,23,20,0.12)] flex items-center justify-center hover:bg-[#171714] hover:text-[#FAF9F6] transition-colors"
          aria-label={`Email us at ${email}`}
        >
          <Mail className="w-5 h-5 stroke-[1.6]" />
          <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap bg-[#171714] text-[#FAF9F6] text-xs px-3 py-1.5 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all hidden sm:block">
            Email us
          </span>
        </a>
      )}

      {whatsApp && (
        <button
          onClick={openWhatsApp}
          className="group relative w-14 h-14 rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(37,211,102,0.35)] flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="Chat with us on WhatsApp"
        >
          <WhatsAppGlyph className="w-7 h-7" />
          <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap bg-[#171714] text-[#FAF9F6] text-xs px-3 py-1.5 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all hidden sm:block">
            Chat on WhatsApp
          </span>
        </button>
      )}
    </div>
  );
};
