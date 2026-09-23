import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ActivePage } from '../types';

/** The one piece pictured in the hero; the homepage leaves it out of New In. */
export const HERO_PRODUCT_SLUG = 'iris-gown';

interface EditorialHeroProps {
  onNavigate: (page: ActivePage) => void;
  onExploreProduct: (slug: string) => void;
}

export const EditorialHero: React.FC<EditorialHeroProps> = ({ onNavigate, onExploreProduct }) => {
  return (
    <section 
      id="editorial-hero"
      className="relative min-h-[calc(100vh-110px)] flex flex-col justify-between border-b border-[#D8D4CC] overflow-hidden px-5 md:px-12 py-10 md:py-16"
    >
      {/* Top subtle metadata */}
      <div className="flex justify-between items-start text-xs tracking-[0.2em] uppercase font-medium text-[#56554F]">
        <div className="flex items-center space-x-3">
          <span className="w-2 h-2 rounded-full bg-[#681F2C]"></span>
          <span className="text-[#171714]">THE DENIQ EDIT</span>
          <span className="text-[#D8D4CC]">/</span>
          <span>AUTUMN · RAIN ’26</span>
        </div>
        <div className="hidden sm:block text-right">
          <span>EDITION 01</span>
        </div>
      </div>

      {/* Main Asymmetric Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto py-8">
        {/* Left Editorial Copy: bold typographic statement */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center order-2 lg:order-1 space-y-6">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.28em] font-semibold text-[#681F2C]">
              New Season — Deniq ’26
            </span>
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[80px] leading-[0.96] text-[#171714] tracking-tight">
              Clothes for the <br />
              <span className="italic font-normal">entrance.</span>
            </h1>
          </div>

          <p className="text-[#56554F] text-base md:text-lg font-normal max-w-[440px] leading-relaxed">
            Statement pieces in linen, Ankara cotton and amwete — designed for women who love to be seen, in sizes 10 to 20.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-3">
            <button
              id="hero-explore-button"
              onClick={() => onNavigate({ type: 'shop', newOnly: true })}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-[#171714] text-[#FAF9F6] text-xs md:text-sm font-semibold tracking-[0.18em] uppercase hover:bg-[#681F2C] transition-colors cursor-pointer"
            >
              <span>Shop New In</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => onNavigate({ type: 'shop', category: 'all' })}
              className="inline-flex items-center px-8 py-4 border border-[#171714] text-[#171714] text-xs md:text-sm font-semibold tracking-[0.18em] uppercase hover:bg-[#171714] hover:text-[#FAF9F6] transition-colors cursor-pointer"
            >
              Shop All
            </button>
          </div>

          <button
            onClick={() => onExploreProduct(HERO_PRODUCT_SLUG)}
            className="w-fit text-xs tracking-[0.14em] uppercase text-[#56554F] hover:text-[#171714] border-b border-[#D8D4CC] pb-0.5"
          >
            Featured: The Iris Gown
          </button>
        </div>

        {/* Right Asymmetric Editorial Photography */}
        <div className="lg:col-span-6 xl:col-span-7 order-1 lg:order-2 flex justify-center lg:justify-end">
          <div 
            onClick={() => onExploreProduct(HERO_PRODUCT_SLUG)}
            className="relative w-full max-w-[580px] aspect-[3/4] overflow-hidden bg-[#FAF9F6] border border-[#D8D4CC] cursor-pointer group"
          >
            <img
              src="/products/iris-gown.webp"
              alt="The Deniq Edit — campaign image"
              className="w-full h-full object-contain p-6 pb-20 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              loading="eager"
            />
            
            {/* Subtle photographic metadata badge */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end text-xs uppercase tracking-[0.16em] text-white mix-blend-difference bg-[#171714]/30 backdrop-blur-xs p-3 border border-white/20">
              <div>
                <p className="font-semibold">Fig 01. The Iris Gown</p>
              </div>
              <span className="font-serif italic text-sm">Shop now →</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Ticker Bar */}
      <div className="pt-6 border-t border-[#D8D4CC] flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-[#56554F] gap-2">
        <div className="flex items-center space-x-6">
          <span className="text-[#171714] font-medium">SHOP ONLINE</span>
          <span className="hidden sm:inline text-[#D8D4CC]">|</span>
          <span>SHIPPING ACROSS THE USA</span>
        </div>
        <div className="flex items-center space-x-6 tracking-wider">
          <span>SIZES 10 – 20</span>
          <span>·</span>
          <span>NEW DESIGNS MONTHLY</span>
        </div>
      </div>
    </section>
  );
};
