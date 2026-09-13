import React from 'react';
import { LookbookItem, Product } from '../types';
import { formatPrice } from '../data/products';
import { X, ArrowRight } from 'lucide-react';

interface LookbookModalProps {
  look: LookbookItem | null;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (slug: string) => void;
  onQuickAdd: (product: Product) => void;
}

export const LookbookModal: React.FC<LookbookModalProps> = ({
  look,
  onClose,
  products,
  onSelectProduct,
  onQuickAdd,
}) => {
  if (!look) return null;

  const taggedProducts = products.filter((p) => look.productIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 md:p-8 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#FAF9F6] border border-[#D8D4CC] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-[#FAF9F6] text-[#171714] hover:text-[#681F2C] border border-[#D8D4CC]"
          aria-label="Close look modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Lookbook Photograph */}
        <div className="md:col-span-7 bg-[#F4F1EB] relative aspect-[4/5] md:aspect-auto">
          <img
            src={look.image}
            alt={look.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute bottom-4 left-4 right-4 bg-[#171714]/60 backdrop-blur-xs text-[#FAF9F6] p-3 text-xs tracking-wider uppercase flex justify-between items-end">
            <div>
              <p className="font-semibold">{look.title}</p>
              <p className="text-[10px] text-stone-300">{look.caption}</p>
            </div>
            <span className="text-[10px] text-[#B78D91]">WORN DENIQ</span>
          </div>
        </div>

        {/* Right: Shop The Look Breakdown */}
        <div className="md:col-span-5 p-6 md:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#681F2C]">
              Look Chronicle
            </span>
            <h3 className="font-serif text-3xl text-[#171714]">
              Shop The Look
            </h3>
            <p className="text-xs text-[#56554F] leading-relaxed font-light">
              {look.editorialNote}
            </p>

            {/* Tagged Products list */}
            <div className="space-y-4 pt-4 border-t border-[#D8D4CC]">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#171714]">
                Pieces in this look ({taggedProducts.length})
              </span>

              {taggedProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="p-3 border border-[#D8D4CC] bg-[#F4F1EB] flex items-center space-x-3"
                >
                  <img
                    src={prod.primaryImage}
                    alt={prod.name}
                    className="w-14 h-18 object-cover border border-[#D8D4CC] flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5
                      onClick={() => {
                        onSelectProduct(prod.slug);
                        onClose();
                      }}
                      className="font-serif text-base text-[#171714] hover:text-[#681F2C] cursor-pointer truncate"
                    >
                      {prod.name}
                    </h5>
                    <p className="font-sans text-xs font-semibold text-[#171714]">
                      {formatPrice(prod.price)}
                    </p>
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => onQuickAdd(prod)}
                        className="text-[10px] uppercase tracking-wider font-semibold text-[#681F2C] hover:underline"
                      >
                        Quick Add +
                      </button>
                      <span className="text-stone-300">·</span>
                      <button
                        onClick={() => {
                          onSelectProduct(prod.slug);
                          onClose();
                        }}
                        className="text-[10px] uppercase tracking-wider text-[#56554F] hover:text-[#171714]"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#D8D4CC] text-[11px] text-[#56554F]">
            <span>Complimentary styling advice available via private concierge.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
