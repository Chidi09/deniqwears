import React, { useState } from 'react';
import { ArrowRight, Check, Copy } from 'lucide-react';
import { ActivePage } from '../types';
import { PromoBanner as PromoBannerData, PromoLinkTarget } from '../lib/promotions';

interface PromoBannerProps {
  banner: PromoBannerData;
  onNavigate: (page: ActivePage) => void;
  /** Admin preview: render inert, without navigating or copying. */
  preview?: boolean;
}

export function promoTargetPage(target: PromoLinkTarget): ActivePage {
  return target === 'new' ? { type: 'shop', newOnly: true } : { type: 'shop', category: target };
}

/** The homepage promotion, edited from the admin "Promotions" tab. */
export const PromoBanner: React.FC<PromoBannerProps> = ({ banner, onNavigate, preview = false }) => {
  const [copied, setCopied] = useState(false);

  if (!banner.enabled && !preview) return null;

  const copyCode = async () => {
    if (preview || !banner.discountCode) return;
    try {
      await navigator.clipboard.writeText(banner.discountCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the code is still visible to type in.
    }
  };

  return (
    <section
      id="promo-banner"
      className={preview ? '' : 'max-w-[1344px] mx-auto px-5 md:px-12 py-10 md:py-16'}
      aria-label="Current promotion"
    >
      <div className="relative overflow-hidden bg-[#171714] text-[#FAF9F6] grid md:grid-cols-2 min-h-[380px]">
        {/* Image */}
        <div className="relative promo-grain order-1 md:order-2 min-h-[240px]">
          {banner.image && (
            <img
              src={banner.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#171714] via-[#171714]/20 to-transparent" />
        </div>

        {/* Copy */}
        <div className="relative order-2 md:order-1 p-7 sm:p-10 lg:p-14 flex flex-col justify-center gap-5">
          <span
            aria-hidden
            className="absolute -left-6 -top-10 font-serif italic text-[180px] leading-none text-[#FAF9F6]/[0.04] select-none pointer-events-none"
          >
            D
          </span>
          {banner.eyebrow && (
            <span className="inline-flex w-fit items-center gap-2 text-xs uppercase tracking-[0.26em] font-semibold text-[#E4B5BC]">
              <span className="w-6 h-px bg-[#E4B5BC]" />
              {banner.eyebrow}
            </span>
          )}
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.02] text-balance">
            {banner.headline}
          </h2>
          {banner.body && (
            <p className="text-base text-[#FAF9F6]/75 max-w-[440px] leading-relaxed">{banner.body}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => !preview && onNavigate(promoTargetPage(banner.ctaTarget))}
              className="group inline-flex items-center gap-3 px-7 py-4 bg-[#FAF9F6] text-[#171714] text-xs uppercase tracking-[0.18em] font-semibold hover:bg-[#E4B5BC] transition-colors"
            >
              {banner.ctaLabel}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            {banner.discountCode && (
              <button
                onClick={copyCode}
                className="inline-flex items-center gap-3 px-5 py-4 border border-dashed border-[#FAF9F6]/50 text-xs uppercase tracking-[0.18em] hover:border-[#FAF9F6] transition-colors"
                aria-label={`Copy discount code ${banner.discountCode}`}
              >
                <span className="text-[#FAF9F6]/60">Code</span>
                <span className="font-semibold">{banner.discountCode}</span>
                {copied ? <Check className="w-4 h-4 text-[#E4B5BC]" /> : <Copy className="w-4 h-4 opacity-70" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
