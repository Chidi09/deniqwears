import React from 'react';
import { ArrowLeft, Mail, Ruler, Truck } from 'lucide-react';
import { ActivePage } from '../types';
import { useStoreSettingsQuery } from '../hooks/queries';
import { useStore } from '../context/StoreContext';
import { AdireBand, AdireMark, AdirePattern } from './Adire';

interface AboutPageProps {
  onNavigate: (page: ActivePage) => void;
}

const MATERIALS = ['Linen', 'Ankara cotton', 'Amwete', 'Cotton'];

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const { data: settings } = useStoreSettingsQuery();
  const { setSizeGuideOpen } = useStore();

  return (
    <div id="about-deniq-page" className="min-h-screen bg-[#F4F1EB] pt-8 pb-32">
      <div className="max-w-[1344px] mx-auto px-5 md:px-12">
        {/* Back Link */}
        <button
          onClick={() => onNavigate({ type: 'home' })}
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.16em] text-[#56554F] hover:text-[#171714] mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        {/* Hero: an oxblood cloth panel with adire rings — this page's own colour */}
        <div className="relative overflow-hidden bg-[#681F2C] text-[#FAF9F6] px-6 sm:px-12 py-16 md:py-24 mb-4">
          <AdirePattern motif="rings" size={60} className="absolute inset-0 text-[#FAF9F6] opacity-[0.1]" />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(90deg,#681F2C_0%,rgba(104,31,44,0.8)_50%,rgba(104,31,44,0.1)_100%)]"
          />
          <div className="relative">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] font-semibold text-[#E9C9A0]">
              <AdireMark />
              Our Story
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl mt-3 max-w-[900px] leading-[1.04]">
              Made for women who love to be seen.
            </h1>
            <p className="text-[#FAF9F6]/80 text-lg md:text-xl font-light max-w-[620px] mt-6 leading-relaxed">
              Deniqwears designs easy, beautiful pieces for women of every age — from their first job to their
              seventieth birthday and beyond — in sizes 10 to 20.
            </p>
          </div>
        </div>

        {/* Narrative Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 py-16 md:py-24 border-b border-[#D8D4CC]">
          <div className="lg:col-span-6 space-y-6 text-[#56554F] text-base md:text-lg font-light leading-relaxed">
            <h3 className="font-serif text-3xl text-[#171714]">Every design, every size.</h3>
            <p>
              Each Deniqwears design is cut in every size from 10 to 20, so no one has to fall in love with a piece
              only to find it stops a size short.
            </p>
            <p>
              We work in fabrics that feel as good as they look, and add new designs regularly — follow us on TikTok
              and Instagram to see them first.
            </p>
            <ul className="flex flex-wrap gap-2 pt-2">
              {MATERIALS.map((m) => (
                <li
                  key={m}
                  className="px-4 py-2 rounded-full border border-[#B07A2E]/40 bg-[#FAF9F6] text-sm text-[#171714]"
                >
                  {m}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-6">
            <div className="relative aspect-[4/5] bg-[#FAF9F6] border border-[#D8D4CC] overflow-hidden">
              <img
                src="/products/ember-circle-kaftan.webp"
                alt="The Ember Circle Kaftan by Deniqwears"
                className="w-full h-full object-contain p-8"
              />
            </div>
          </div>
        </div>

        {/* Practical details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
          <div className="relative overflow-hidden space-y-3 p-6 bg-[#FAF9F6] border border-[#D8D4CC]">
            <AdireBand height={14} className="absolute top-0 inset-x-0 text-[#B07A2E] opacity-60" />
            <Truck className="relative w-5 h-5 text-[#681F2C]" />
            <h4 className="relative font-serif text-2xl text-[#171714] pt-2">Shipping & Returns</h4>
            <p className="text-sm text-[#56554F] leading-relaxed">
              We ship across the United States.
              <br />
              Returns and exchanges within {settings?.returnPeriodDays ?? 5} days.
            </p>
          </div>

          <div className="relative overflow-hidden space-y-3 p-6 bg-[#FAF9F6] border border-[#D8D4CC]">
            <AdireBand height={14} className="absolute top-0 inset-x-0 text-[#B07A2E] opacity-60" />
            <Ruler className="relative w-5 h-5 text-[#681F2C]" />
            <h4 className="relative font-serif text-2xl text-[#171714] pt-2">Finding Your Size</h4>
            <p className="text-sm text-[#56554F] leading-relaxed">
              Sizes 10 to 20 in every design.
              <br />
              <button onClick={() => setSizeGuideOpen(true)} className="text-[#681F2C] underline underline-offset-2">
                View the size chart
              </button>
            </p>
          </div>

          <div className="relative overflow-hidden space-y-3 p-6 bg-[#FAF9F6] border border-[#D8D4CC]">
            <AdireBand height={14} className="absolute top-0 inset-x-0 text-[#B07A2E] opacity-60" />
            <Mail className="relative w-5 h-5 text-[#681F2C]" />
            <h4 className="relative font-serif text-2xl text-[#171714] pt-2">Get in Touch</h4>
            <p className="text-sm text-[#56554F] leading-relaxed">
              {settings?.supportEmail && (
                <>
                  <a href={`mailto:${settings.supportEmail}`} className="hover:text-[#171714]">
                    {settings.supportEmail}
                  </a>
                  <br />
                </>
              )}
              {settings?.supportWhatsApp && <>WhatsApp: {settings.supportWhatsApp}</>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
