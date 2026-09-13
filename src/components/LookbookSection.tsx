import React from 'react';
import { LOOKBOOK_ITEMS } from '../data/products';
import { LookbookItem } from '../types';

interface LookbookSectionProps {
  onOpenLookModal: (item: LookbookItem) => void;
}

export const LookbookSection: React.FC<LookbookSectionProps> = ({ onOpenLookModal }) => {
  return (
    <section id="worn-deniq-lookbook" className="max-w-[1344px] mx-auto px-5 md:px-12 py-20 md:py-32 border-t border-[#D8D4CC]">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-4 border-b border-[#D8D4CC]">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#681F2C]">
            Visual Chronicle
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#171714] mt-1">
            WORN DENIQ
          </h2>
        </div>
        <p className="text-xs tracking-[0.16em] uppercase text-[#56554F] mt-2 md:mt-0">
          Click any frame to Shop the Look
        </p>
      </div>

      {/* Editorial Masonry Grid with varying aspect ratios and offsets */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10 items-start">
        {/* Item 1: Large Left Portrait */}
        <div
          onClick={() => onOpenLookModal(LOOKBOOK_ITEMS[0])}
          className="md:col-span-7 group cursor-pointer"
        >
          <div className="relative aspect-[3/4] overflow-hidden bg-[#FAF9F6] border border-[#D8D4CC]">
            <img
              src={LOOKBOOK_ITEMS[0].image}
              alt={LOOKBOOK_ITEMS[0].title}
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.025]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-[#171714]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="bg-[#FAF9F6] text-[#171714] text-xs uppercase tracking-[0.2em] font-semibold px-4 py-2 border border-[#D8D4CC]">
                Shop the Look +
              </span>
            </div>
          </div>
          <div className="mt-3 flex justify-between items-baseline">
            <h4 className="font-serif text-2xl text-[#171714] group-hover:text-[#681F2C] transition-colors">
              {LOOKBOOK_ITEMS[0].title}
            </h4>
            <span className="text-xs text-[#56554F] tracking-wider uppercase">
              {LOOKBOOK_ITEMS[0].caption}
            </span>
          </div>
        </div>

        {/* Column Right: Two stacked asymmetrical images */}
        <div className="md:col-span-5 space-y-12">
          {/* Item 2: Square Detail */}
          <div
            onClick={() => onOpenLookModal(LOOKBOOK_ITEMS[1])}
            className="group cursor-pointer"
          >
            <div className="relative aspect-square overflow-hidden bg-[#FAF9F6] border border-[#D8D4CC]">
              <img
                src={LOOKBOOK_ITEMS[1].image}
                alt={LOOKBOOK_ITEMS[1].title}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[#171714]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-[#FAF9F6] text-[#171714] text-xs uppercase tracking-[0.2em] font-semibold px-4 py-2 border border-[#D8D4CC]">
                  Shop the Look +
                </span>
              </div>
            </div>
            <div className="mt-3 flex justify-between items-baseline">
              <h4 className="font-serif text-xl text-[#171714] group-hover:text-[#681F2C] transition-colors">
                {LOOKBOOK_ITEMS[1].title}
              </h4>
              <span className="text-xs text-[#56554F] tracking-wider uppercase">
                {LOOKBOOK_ITEMS[1].caption}
              </span>
            </div>
          </div>

          {/* Item 3: Tall Kinetic Portrait */}
          <div
            onClick={() => onOpenLookModal(LOOKBOOK_ITEMS[2])}
            className="group cursor-pointer pt-4"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-[#FAF9F6] border border-[#D8D4CC]">
              <img
                src={LOOKBOOK_ITEMS[2].image}
                alt={LOOKBOOK_ITEMS[2].title}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[#171714]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-[#FAF9F6] text-[#171714] text-xs uppercase tracking-[0.2em] font-semibold px-4 py-2 border border-[#D8D4CC]">
                  Shop the Look +
                </span>
              </div>
            </div>
            <div className="mt-3 flex justify-between items-baseline">
              <h4 className="font-serif text-xl text-[#171714] group-hover:text-[#681F2C] transition-colors">
                {LOOKBOOK_ITEMS[2].title}
              </h4>
              <span className="text-xs text-[#56554F] tracking-wider uppercase">
                {LOOKBOOK_ITEMS[2].caption}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
