import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ActivePage } from '../types';

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
          <span>EDITION 01 — LAGOS</span>
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
            Pieces created with architectural intention. Unhurried tailoring, heavy satin drapes, and an unapologetic Nigerian presence.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-6">
            <button
              id="hero-explore-button"
              onClick={() => onNavigate({ type: 'shop', category: 'all' })}
              className="group editorial-link inline-flex items-center space-x-3 text-sm md:text-base font-semibold tracking-[0.16em] uppercase text-[#171714] hover:text-[#681F2C] transition-colors py-2 cursor-pointer"
            >
              <span>Explore Collection 01</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 text-[#681F2C]" />
            </button>

            <button
              onClick={() => onExploreProduct('the-amara-dress')}
              className="text-xs tracking-[0.14em] uppercase text-[#56554F] hover:text-[#171714] border-b border-[#D8D4CC] pb-0.5"
            >
              Featured: The Amara Dress (₦48,000)
            </button>
          </div>
        </div>

        {/* Right Asymmetric Editorial Photography */}
        <div className="lg:col-span-6 xl:col-span-7 order-1 lg:order-2 flex justify-center lg:justify-end">
          <div 
            onClick={() => onExploreProduct('the-amara-dress')}
            className="relative w-full max-w-[580px] aspect-[3/4] overflow-hidden bg-[#FAF9F6] border border-[#D8D4CC] cursor-pointer group"
          >
            <img
              src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1400&auto=format&fit=crop"
              alt="The Deniq Edit — Editorial Campaign Model in Lagos"
              className="w-full h-full object-cover object-center image-subtle-zoom transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              loading="eager"
            />
            
            {/* Subtle photographic metadata badge */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end text-[11px] uppercase tracking-[0.16em] text-white mix-blend-difference bg-[#171714]/30 backdrop-blur-xs p-3 border border-white/20">
              <div>
                <p className="font-semibold">Fig 01. The Amara Dress</p>
                <p className="text-[10px] text-stone-200">Victoria Island, Lagos</p>
              </div>
              <span className="font-serif italic text-sm">₦48,000</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Ticker Bar */}
      <div className="pt-6 border-t border-[#D8D4CC] flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-[#56554F] gap-2">
        <div className="flex items-center space-x-6">
          <span className="text-[#171714] font-medium">SHOWROOM & ATELIER</span>
          <span className="hidden sm:inline text-[#D8D4CC]">|</span>
          <span>14 OKO AWO ST, VICTORIA ISLAND</span>
        </div>
        <div className="flex items-center space-x-6 tracking-wider">
          <span>WORLDWIDE EXPRESS</span>
          <span>·</span>
          <span>CURATED DROPS</span>
        </div>
      </div>
    </section>
  );
};
