import React from 'react';
import { LOOKBOOK_ITEMS } from '../data/products';
import { LookbookItem, ActivePage, Product } from '../types';
import { ArrowLeft } from 'lucide-react';

interface LookbookPageProps {
  onNavigate: (page: ActivePage) => void;
  onOpenLookModal: (item: LookbookItem) => void;
}

export const LookbookPage: React.FC<LookbookPageProps> = ({ onNavigate, onOpenLookModal }) => {
  return (
    <div id="lookbook-archive-page" className="min-h-screen bg-[#F4F1EB] pt-8 pb-32">
      <div className="max-w-[1344px] mx-auto px-5 md:px-12">
        <button
          onClick={() => onNavigate({ type: 'home' })}
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.16em] text-[#56554F] hover:text-[#171714] mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        <div className="py-12 border-b border-[#D8D4CC] mb-12">
          <span className="text-[11px] uppercase tracking-[0.3em] font-semibold text-[#681F2C]">
            Visual Chronicle
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-[#171714] mt-2">
            WORN DENIQ — ISSUE 01
          </h1>
          <p className="text-[#56554F] text-base md:text-lg font-light max-w-[580px] mt-4 leading-relaxed">
            Documented on the streets and rooftop salons of Victoria Island and Ikoyi. Click any frame to inspect the garments and shop the look.
          </p>
        </div>

        {/* Masonry Editorial Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {LOOKBOOK_ITEMS.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => onOpenLookModal(item)}
              className={`group cursor-pointer ${idx % 2 === 1 ? 'md:mt-16' : ''}`}
            >
              <div className="relative aspect-[3/4] bg-[#FAF9F6] border border-[#D8D4CC] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-[#171714]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-[#FAF9F6] text-[#171714] text-xs uppercase tracking-[0.2em] font-semibold px-4 py-2 border border-[#D8D4CC]">
                    Shop the Look +
                  </span>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-baseline">
                <div>
                  <h3 className="font-serif text-2xl text-[#171714] group-hover:text-[#681F2C] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#56554F] mt-1">{item.editorialNote}</p>
                </div>
                <span className="text-xs uppercase tracking-wider text-[#681F2C] font-semibold">
                  {item.caption}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
