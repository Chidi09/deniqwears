import React from 'react';
import { ActivePage, Category } from '../types';
import { AdireBand } from './Adire';

interface FooterProps {
  onNavigate: (page: ActivePage) => void;
  onNavigateCategory: (cat: Category) => void;
  onOpenSizeGuide: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onNavigateCategory,
  onOpenSizeGuide,
}) => {
  return (
    <footer id="brand-footer" className="w-full bg-[#FAF9F6] pb-12">
      <AdireBand height={32} className="text-[#1E2656] bg-[#F4F1EB] border-y border-[#1E2656]/20 mb-20" />
      <div className="max-w-[1344px] mx-auto px-5 md:px-12">
        {/* Massive Lettering Almost Spanning Viewport */}
        <div className="overflow-hidden border-b border-[#D8D4CC] pb-10 mb-16 select-none">
          <h1 className="font-serif text-[13vw] leading-[0.85] tracking-tight text-[#171714] text-center w-full uppercase">
            DENIQWEARS
          </h1>
        </div>

        {/* 3 Main Columns: SHOP, HELP, SOCIAL */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-10 pb-16 border-b border-[#D8D4CC] text-[13px] tracking-[0.1em]">
          {/* Column 1: SHOP */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-[#681F2C]">
              Shop
            </h4>
            <ul className="space-y-2.5 text-[#56554F]">
              <li>
                <button
                  onClick={() => onNavigate({ type: 'shop', newOnly: true })}
                  className="hover:text-[#171714] transition-colors text-left"
                >
                  New In
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory('dresses')}
                  className="hover:text-[#171714] transition-colors text-left"
                >
                  Dresses
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory('sets')}
                  className="hover:text-[#171714] transition-colors text-left"
                >
                  Sets
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory('occasion')}
                  className="hover:text-[#171714] transition-colors text-left"
                >
                  Occasion
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory('occasion')}
                  className="hover:text-[#171714] transition-colors text-left"
                >
                  Occasion
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: HELP */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-[#681F2C]">
              Help & Client Care
            </h4>
            <ul className="space-y-2.5 text-[#56554F]">
              <li>
                <button
                  onClick={() => onNavigate({ type: 'about' })}
                  className="hover:text-[#171714] transition-colors text-left"
                >
                  Delivery & Shipping
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate({ type: 'about' })}
                  className="hover:text-[#171714] transition-colors text-left"
                >
                  Returns & Exchanges
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSizeGuide}
                  className="hover:text-[#171714] transition-colors text-left"
                >
                  Size Chart
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate({ type: 'about' })}
                  className="hover:text-[#171714] transition-colors text-left"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: SOCIAL */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-[#681F2C]">
              Social & Editorial
            </h4>
            <ul className="space-y-2.5 text-[#56554F]">
              <li>
                <a
                  href="https://tiktok.com/@deniqwears"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#171714] transition-colors"
                >
                  TikTok (@deniqwears)
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/deniqwears"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#171714] transition-colors"
                >
                  Instagram (@deniqwears)
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: HELP */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-[#681F2C]">
              Deniqwears
            </h4>
            <div className="text-xs text-[#56554F] leading-relaxed space-y-2">
              <p className="text-[#171714] font-medium">Based in the USA</p>
              <p>Shipping across the United States.</p>
              <p>Sizes 10–20 in every design.</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Location */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-[#56554F] tracking-[0.14em] uppercase gap-3">
          <span>© 2026 DENIQWEARS. ALL RIGHTS RESERVED.</span>
          <div className="flex items-center space-x-4 text-xs">
            <span>TERMS</span>
            <span>·</span>
            <span>PRIVACY</span>
            <span>·</span>
            <button
              onClick={() => onNavigate({ type: 'admin' })}
              className="hover:text-[#171714] transition-colors"
            >
              STAFF LOGIN
            </button>
            <span>·</span>
            <span className="text-[#171714] font-semibold">USA</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
