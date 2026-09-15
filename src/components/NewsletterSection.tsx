import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success is only shown once the server has actually stored the address.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not subscribe');
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not subscribe');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="private-access-newsletter" className="max-w-[1344px] mx-auto px-5 md:px-12 py-24 md:py-32 border-t border-[#D8D4CC]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
        {/* Left Copy */}
        <div className="lg:col-span-6 space-y-4">
          <span className="text-[11px] uppercase tracking-[0.3em] font-semibold text-[#681F2C]">
            Client Privilege
          </span>
          <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#171714] leading-[1.08]">
            Private access.
          </h3>
          <p className="text-[#56554F] text-base md:text-lg font-light leading-relaxed max-w-[440px]">
            New drops, restocks, and private showroom invitations — before everyone else.
          </p>
        </div>

        {/* Right Form */}
        <div className="lg:col-span-6">
          {submitted ? (
            <div className="p-5 bg-[#FAF9F6] border border-[#D8D4CC] flex items-center space-x-3 text-[#171714] animate-in fade-in">
              <span className="w-6 h-6 rounded-full bg-[#681F2C] text-[#FAF9F6] flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5" />
              </span>
              <div>
                <p className="text-sm font-semibold">You have been granted private access.</p>
                <p className="text-xs text-[#56554F]">Look for preview dispatches in your inbox prior to public drops.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative flex items-center border-b border-[#171714] focus-within:border-[#681F2C] transition-colors pb-2">
                <input
                  id="newsletter-email-input"
                  type="email"
                  required
                  placeholder="EMAIL ADDRESS"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-sm md:text-base font-sans tracking-[0.14em] uppercase text-[#171714] placeholder-[#56554F]/70 focus:outline-none py-1"
                />
                <button
                  id="newsletter-submit-btn"
                  type="submit"
                  disabled={submitting}
                  className="editorial-link p-2 text-[#171714] hover:text-[#681F2C] transition-colors cursor-pointer disabled:opacity-50"
                  aria-label="Subscribe to Private Access"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
              {error && (
                <p role="alert" className="text-[11px] text-[#681F2C] tracking-wide">
                  {error}
                </p>
              )}
              <div className="flex justify-between items-center text-[10px] text-[#56554F] tracking-wide uppercase">
                <span>Direct correspondence only · No spam</span>
                <span>Unsubscribe anytime</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
