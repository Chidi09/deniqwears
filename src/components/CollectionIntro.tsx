import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ActivePage } from '../types';

interface CollectionIntroProps {
  onNavigate: (page: ActivePage) => void;
}

export const CollectionIntro: React.FC<CollectionIntroProps> = ({ onNavigate }) => {
  return (
    <section 
      id="collection-intro"
      className="max-w-[1344px] mx-auto px-5 md:px-12 py-20 md:py-32 text-center flex flex-col items-center justify-center"
    >
      <div className="space-y-4 max-w-[680px]">
        <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#681F2C]">
          01 / NEW ARRIVALS
        </span>

        <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#171714] leading-[1.08] tracking-tight">
          The pieces everyone <br />
          will ask you about.
        </h2>

        <p className="text-[#56554F] text-base md:text-lg font-light leading-relaxed pt-2">
          Subtle tension between restraint and drama. Each piece is designed to command stillness rather than noise.
        </p>

        <div className="pt-6">
          <button
            id="shop-new-arrivals-link"
            onClick={() => onNavigate({ type: 'shop', category: 'all' })}
            className="group editorial-link inline-flex items-center space-x-2 text-xs md:text-sm font-semibold tracking-[0.2em] uppercase text-[#171714] hover:text-[#681F2C] transition-colors py-1 cursor-pointer"
          >
            <span>Shop New Arrivals</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1 text-[#681F2C]" />
          </button>
        </div>
      </div>
    </section>
  );
};
