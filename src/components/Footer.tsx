import React from 'react';
import { ActivePage, Category } from '../types';

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
    <footer id="brand-footer" className="w-full bg-[#FAF9F6] border-t border-[#D8D4CC] pt-20 pb-12">
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
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#681F2C]">
              Shop
            </h4>
            <ul className="space-y-2.5 text-[#56554F]">
              <li>
                <button
                  onClick={() => onNavigate({ type: 'shop', category: 'all' })}
                  className="hover:text-[#171714] transition-colors text-left"
                >
                  New Arrivals
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
                  onClick={() => onNavigateCategory('tops')}
                  className="hover:text-[#171714] transition-colors text-left"
                >
                  Tops & Corsets
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory('bottoms')}
                  className="hover:text-[#171714] transition-colors text-left"
                >
                  Bottoms
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
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#681F2C]">
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
                  Size Guide & Conversions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate({ type: 'about' })}
                  className="hover:text-[#171714] transition-colors text-left"
                >
                  Private Showroom Bookings
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate({ type: 'about' })}
                  className="hover:text-[#171714] transition-colors text-left"
                >
                  Contact Concierge
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: SOCIAL */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#681F2C]">
              Social & Editorial
            </h4>
            <ul className="space-y-2.5 text-[#56554F]">
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#171714] transition-colors"
                >
                  Instagram (@deniqwears)
                </a>
              </li>
              <li>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#171714] transition-colors"
                >
                  TikTok
                </a>
              </li>
              <li>
                <a
                  href="https://pinterest.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#171714] transition-colors"
                >
                  Pinterest Lookbook
                </a>
              </li>
              <li>
                <button
                  onClick={() => onNavigate({ type: 'lookbook' })}
                  className="hover:text-[#171714] transition-colors text-left"
                >
                  Worn Deniq Archive
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: ATELIER */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#681F2C]">
              Atelier & Flagship
            </h4>
            <div className="text-xs text-[#56554F] leading-relaxed space-y-2">
              <p className="text-[#171714] font-medium">Victoria Island, Lagos</p>
              <p>Plot 14 Oko Awo Street, Victoria Island, Lagos, Nigeria.</p>
              <p className="text-[#681F2C] font-semibold pt-1">Mon – Sat: 10:00 – 19:00</p>
              <p className="text-[11px]">Private fitting sessions by appointment.</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Location */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-[#56554F] tracking-[0.14em] uppercase gap-3">
          <span>© 2026 DENIQWEARS. ALL RIGHTS RESERVED.</span>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>TERMS</span>
            <span>·</span>
            <span>PRIVACY</span>
            <span>·</span>
            <span className="text-[#171714] font-semibold">LAGOS, NG</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
