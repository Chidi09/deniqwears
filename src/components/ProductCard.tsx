import React from 'react';
import { Plus } from 'lucide-react';
import { Product } from '../types';
import { formatMoney } from '../lib/money';

interface ProductCardProps {
  product: Product;
  onSelect: (slug: string) => void;
  onQuickAdd: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, onQuickAdd }) => {
  return (
    <a
      id={`product-card-${product.id}`}
      href={`/product/${product.slug}`}
      onClick={(e) => {
        // Let modified clicks (new tab/window) behave natively.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onSelect(product.slug);
      }}
      className="group cursor-pointer flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-[#681F2C] focus-visible:ring-offset-2"
    >
      {/* 3:4 Aspect Ratio Image Area (No container, no shadow, no border-radius) */}
      <div className="relative aspect-[3/4] w-full bg-[#FAF9F6] border border-[#D8D4CC]/80 overflow-hidden">
        <img
          src={product.primaryImage}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ease-editorial group-hover:scale-[1.03]"
          loading="lazy"
        />
        {/* Second photo cross-fades in on hover */}
        {product.secondaryImage && (
          <img
            src={product.secondaryImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-top opacity-0 transition-opacity duration-500 ease-editorial group-hover:opacity-100"
            loading="lazy"
          />
        )}

        {/* Subtle Badge (1 maximum) */}
        {product.badge && (
          <div className="absolute top-3 left-3">
            <span className="text-[11px] tracking-[0.2em] uppercase font-semibold text-[#171714] bg-[#FAF9F6]/90 px-2 py-0.5 border border-[#D8D4CC]">
              {product.badge}
            </span>
          </div>
        )}

        {/* Quick add: a round + on touch screens, a labelled bar on hover for desktop */}
        <button
          id={`quick-add-${product.id}`}
          onClick={(e) => {
            // The card is a link; stop the click from also opening the product page.
            e.preventDefault();
            e.stopPropagation();
            onQuickAdd(product);
          }}
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-[#FAF9F6]/95 text-[#171714] shadow-sm flex items-center justify-center md:hidden"
          aria-label={`Quick add ${product.name}`}
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onQuickAdd(product);
          }}
          aria-label={`Quick add ${product.name}`}
          className="hidden md:block absolute inset-x-3 bottom-3 py-3 bg-[#FAF9F6]/95 backdrop-blur-sm text-[#171714] hover:bg-[#171714] hover:text-[#FAF9F6] text-xs font-semibold tracking-[0.18em] uppercase translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 transition-all duration-300 ease-editorial"
        >
          Quick add
        </button>
      </div>

      {/* Product Information */}
      <div className="pt-3 pb-1 flex flex-col space-y-1">
        <div className="flex justify-between items-baseline gap-2">
          <h4 className="font-serif text-lg md:text-xl text-[#171714] group-hover:text-[#681F2C] transition-colors leading-snug">
            {product.name}
          </h4>
          <span className="font-sans text-sm font-semibold text-[#171714] whitespace-nowrap">
            {formatMoney(product.priceInKobo)}
          </span>
        </div>

        {/* Colorway / Variation description */}
        <div className="flex items-center justify-between text-xs text-[#56554F]">
          <span>
            {product.colors.map(c => c.name).join(' / ')}
          </span>

          {/* Color swatch dots */}
          <div className="flex items-center space-x-1">
            {product.colors.map((c, i) => (
              <span
                key={i}
                className="w-3 h-3 rounded-full border border-[#D8D4CC]"
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        </div>
      </div>
    </a>
  );
};
