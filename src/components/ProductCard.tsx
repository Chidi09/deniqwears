import React, { useState } from 'react';
import { Product } from '../types';
import { formatKobo } from '../lib/money';

interface ProductCardProps {
  product: Product;
  onSelect: (slug: string) => void;
  onQuickAdd: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, onQuickAdd }) => {
  const [isHovered, setIsHovered] = useState(false);

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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3:4 Aspect Ratio Image Area (No container, no shadow, no border-radius) */}
      <div className="relative aspect-[3/4] w-full bg-[#FAF9F6] border border-[#D8D4CC]/80 overflow-hidden">
        <img
          src={isHovered && product.secondaryImage ? product.secondaryImage : product.primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-top transition-opacity duration-300 ease-in-out"
          loading="lazy"
        />

        {/* Subtle Badge (1 maximum) */}
        {product.badge && (
          <div className="absolute top-3 left-3">
            <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#171714] bg-[#FAF9F6]/90 px-2 py-0.5 border border-[#D8D4CC]">
              {product.badge}
            </span>
          </div>
        )}

        {/* Subtle Quick Add Overlay Button */}
        <div className="absolute inset-x-0 bottom-0 p-3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <button
            id={`quick-add-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd(product);
            }}
            className="pointer-events-auto bg-[#171714] text-[#FAF9F6] hover:bg-[#681F2C] text-[11px] font-semibold tracking-[0.16em] uppercase px-3.5 py-2 transition-colors border border-[#171714]"
            aria-label={`Quick add ${product.name}`}
          >
            Quick Add +
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="pt-3 pb-1 flex flex-col space-y-1">
        <div className="flex justify-between items-baseline gap-2">
          <h4 className="font-serif text-lg md:text-xl text-[#171714] group-hover:text-[#681F2C] transition-colors leading-snug">
            {product.name}
          </h4>
          <span className="font-sans text-sm font-semibold text-[#171714] whitespace-nowrap">
            {formatKobo(product.priceInKobo)}
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
                className="w-2 h-2 rounded-full border border-[#D8D4CC]"
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
