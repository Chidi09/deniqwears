import React from 'react';
import { Product } from '../types';
import { formatMoney } from '../lib/money';
import { ArrowUpRight } from 'lucide-react';

interface AsymmetricShowcaseProps {
  products: Product[];
  onSelectProduct: (slug: string) => void;
  onQuickAdd: (product: Product) => void;
}

export const AsymmetricShowcase: React.FC<AsymmetricShowcaseProps> = ({
  products,
  onSelectProduct,
  onQuickAdd,
}) => {
  // Prefer products the admin actually flagged as features, then fall back to
  // whatever the live catalog has — never to fixed indices (0/1/4/3), which
  // crashed the homepage for any store with fewer than five products.
  const featured = products.filter((p) => p.isAsymmetricFeature);
  const pool = featured.length >= 4 ? featured : products;

  const biasDress = pool[0];
  const sculptedCorset = pool[1];
  const lunaSet = pool[2];
  const pleatedMidi = pool[3];

  // Each slot renders only if the catalog actually has a product for it.
  if (!biasDress) return null;

  return (
    <section id="asymmetric-showcase" className="max-w-[1344px] mx-auto px-5 md:px-12 pb-24 md:pb-32 space-y-20 md:space-y-28">
      {/* Editorial Pair 01: Large Left, Detail Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14 items-end">
        {/* Large Model Item */}
        <div className="md:col-span-7 group cursor-pointer" onClick={() => onSelectProduct(biasDress.slug)}>
          <div className="relative aspect-[4/5] sm:aspect-[3/4] overflow-hidden bg-[#FAF9F6] border border-[#D8D4CC]">
            <img
              src={biasDress.primaryImage}
              alt={biasDress.name}
              className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              loading="lazy"
            />
            {biasDress.badge && (
              <span className="absolute top-4 left-4 bg-[#FAF9F6]/90 backdrop-blur-xs text-[11px] tracking-[0.2em] uppercase font-semibold text-[#171714] px-2.5 py-1 border border-[#D8D4CC]">
                {biasDress.badge}
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd(biasDress);
              }}
              className="absolute bottom-4 right-4 bg-[#FAF9F6]/95 hover:bg-[#171714] hover:text-[#FAF9F6] text-[#171714] text-xs font-semibold tracking-[0.16em] uppercase px-4 py-2.5 border border-[#D8D4CC] transition-all opacity-0 group-hover:opacity-100"
            >
              Quick Add +
            </button>
          </div>
          <div className="mt-4 flex justify-between items-baseline">
            <div>
              <h3 className="font-serif text-2xl md:text-3xl text-[#171714] group-hover:text-[#681F2C] transition-colors">
                {biasDress.name}
              </h3>
              <p className="text-xs text-[#56554F] tracking-wide mt-0.5">
                {biasDress.editorialSubtitle || 'Double-faced satin drape'}
              </p>
            </div>
            <span className="font-sans text-base md:text-lg font-medium text-[#171714]">
              {formatMoney(biasDress.priceInKobo)}
            </span>
          </div>
        </div>

        {/* Smaller / Detail Item */}
        {sculptedCorset && (
        <div className="md:col-span-5 md:pb-12 group cursor-pointer" onClick={() => onSelectProduct(sculptedCorset.slug)}>
          <div className="relative aspect-[4/5] overflow-hidden bg-[#FAF9F6] border border-[#D8D4CC]">
            <img
              src={sculptedCorset.primaryImage}
              alt={sculptedCorset.name}
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              loading="lazy"
            />
            {sculptedCorset.badge && (
              <span className="absolute top-4 left-4 bg-[#FAF9F6]/90 backdrop-blur-xs text-[11px] tracking-[0.2em] uppercase font-semibold text-[#681F2C] px-2.5 py-1 border border-[#D8D4CC]">
                {sculptedCorset.badge}
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd(sculptedCorset);
              }}
              className="absolute bottom-4 right-4 bg-[#FAF9F6]/95 hover:bg-[#171714] hover:text-[#FAF9F6] text-[#171714] text-xs font-semibold tracking-[0.16em] uppercase px-4 py-2.5 border border-[#D8D4CC] transition-all opacity-0 group-hover:opacity-100"
            >
              Quick Add +
            </button>
          </div>
          <div className="mt-4 flex justify-between items-baseline">
            <div>
              <h3 className="font-serif text-2xl md:text-3xl text-[#171714] group-hover:text-[#681F2C] transition-colors">
                {sculptedCorset.name}
              </h3>
              <p className="text-xs text-[#56554F] tracking-wide mt-0.5">
                {sculptedCorset.editorialSubtitle || 'Structural internal boning'}
              </p>
            </div>
            <span className="font-sans text-base md:text-lg font-medium text-[#171714]">
              {formatMoney(sculptedCorset.priceInKobo)}
            </span>
          </div>
        </div>
      )}
      </div>

      {/* Editorial Pair 02: Reversed Cadence (Smaller Left, Large Right) */}
      {lunaSet && pleatedMidi && (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14 items-end pt-4">
        {/* Detail Item (Left) */}
        <div className="md:col-span-5 md:pb-12 order-2 md:order-1 group cursor-pointer" onClick={() => onSelectProduct(lunaSet.slug)}>
          <div className="relative aspect-[4/5] overflow-hidden bg-[#FAF9F6] border border-[#D8D4CC]">
            <img
              src={lunaSet.primaryImage}
              alt={lunaSet.name}
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              loading="lazy"
            />
            {lunaSet.badge && (
              <span className="absolute top-4 left-4 bg-[#FAF9F6]/90 backdrop-blur-xs text-[11px] tracking-[0.2em] uppercase font-semibold text-[#171714] px-2.5 py-1 border border-[#D8D4CC]">
                {lunaSet.badge}
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd(lunaSet);
              }}
              className="absolute bottom-4 right-4 bg-[#FAF9F6]/95 hover:bg-[#171714] hover:text-[#FAF9F6] text-[#171714] text-xs font-semibold tracking-[0.16em] uppercase px-4 py-2.5 border border-[#D8D4CC] transition-all opacity-0 group-hover:opacity-100"
            >
              Quick Add +
            </button>
          </div>
          <div className="mt-4 flex justify-between items-baseline">
            <div>
              <h3 className="font-serif text-2xl md:text-3xl text-[#171714] group-hover:text-[#681F2C] transition-colors">
                {lunaSet.name}
              </h3>
              <p className="text-xs text-[#56554F] tracking-wide mt-0.5">
                Two-piece wrap silhouette
              </p>
            </div>
            <span className="font-sans text-base md:text-lg font-medium text-[#171714]">
              {formatMoney(lunaSet.priceInKobo)}
            </span>
          </div>
        </div>

        {/* Large Model Item (Right) */}
        <div className="md:col-span-7 order-1 md:order-2 group cursor-pointer" onClick={() => onSelectProduct(pleatedMidi.slug)}>
          <div className="relative aspect-[4/5] sm:aspect-[3/4] overflow-hidden bg-[#FAF9F6] border border-[#D8D4CC]">
            <img
              src={pleatedMidi.primaryImage}
              alt={pleatedMidi.name}
              className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              loading="lazy"
            />
            {pleatedMidi.badge && (
              <span className="absolute top-4 left-4 bg-[#FAF9F6]/90 backdrop-blur-xs text-[11px] tracking-[0.2em] uppercase font-semibold text-[#171714] px-2.5 py-1 border border-[#D8D4CC]">
                {pleatedMidi.badge}
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd(pleatedMidi);
              }}
              className="absolute bottom-4 right-4 bg-[#FAF9F6]/95 hover:bg-[#171714] hover:text-[#FAF9F6] text-[#171714] text-xs font-semibold tracking-[0.16em] uppercase px-4 py-2.5 border border-[#D8D4CC] transition-all opacity-0 group-hover:opacity-100"
            >
              Quick Add +
            </button>
          </div>
          <div className="mt-4 flex justify-between items-baseline">
            <div>
              <h3 className="font-serif text-2xl md:text-3xl text-[#171714] group-hover:text-[#681F2C] transition-colors">
                {pleatedMidi.name}
              </h3>
              <p className="text-xs text-[#56554F] tracking-wide mt-0.5">
                Ivory / Black / Oxblood
              </p>
            </div>
            <span className="font-sans text-base md:text-lg font-medium text-[#171714]">
              {formatMoney(pleatedMidi.priceInKobo)}
            </span>
          </div>
        </div>
      </div>
      )}
    </section>
  );
};
