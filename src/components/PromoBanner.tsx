import React, { useState } from 'react';
import { ArrowRight, Check, Copy } from 'lucide-react';
import { ActivePage } from '../types';
import { PromoBanner as PromoBannerData, PromoLinkTarget } from '../lib/promotions';
import { AdirePattern } from './Adire';

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
  const hasImage = !!banner.image;

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
      <div
        className={`relative overflow-hidden bg-[#1E2656] text-[#FAF9F6] min-h-[320px] ${
          hasImage ? 'grid md:grid-cols-2' : 'flex'
        }`}
      >
        {/* Indigo adire cloth: the lattice motif, fading out behind the words */}
        <AdirePattern motif="lattice" size={48} className="absolute inset-0 text-[#FAF9F6] opacity-[0.09]" />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(90deg,#1E2656_0%,rgba(30,38,86,0.85)_45%,rgba(30,38,86,0.2)_100%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_90%_50%,rgba(104,31,44,0.45),transparent_55%)]"
        />

        {hasImage && (
          <div className="relative order-1 md:order-2 min-h-[300px] bg-transparent">
            <img
              src={banner.image}
              alt=""
              className="absolute inset-0 w-full h-full object-contain p-6 md:p-10"
              loading="lazy"
            />
          </div>
        )}

        {/* Copy */}
        <div
          className={`relative order-2 md:order-1 p-7 sm:p-10 lg:p-14 flex flex-col justify-center gap-5 ${
            hasImage ? '' : 'max-w-[760px]'
          }`}
        >
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
