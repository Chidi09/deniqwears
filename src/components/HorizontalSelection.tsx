import React, { useRef } from 'react';
import { Product } from '../types';
import { formatPrice } from '../data/products';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalSelectionProps {
  products: Product[];
  onSelectProduct: (slug: string) => void;
  onQuickAdd: (product: Product) => void;
}

export const HorizontalSelection: React.FC<HorizontalSelectionProps> = ({
  products,
  onSelectProduct,
  onQuickAdd,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -360 : 360;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section id="horizontal-selection" className="py-20 md:py-32 border-t border-[#D8D4CC] overflow-hidden">
      <div className="max-w-[1344px] mx-auto px-5 md:px-12 mb-8 flex items-end justify-between">
        <div>
          <span className="text-[11px] tracking-[0.25em] uppercase font-semibold text-[#681F2C]">
            Signature Collection
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-[#171714] mt-1">
            The Deniq Selection
          </h2>
        </div>

        {/* Minimal Subtle Navigation Arrows */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => scroll('left')}
            className="w-10 h-10 border border-[#D8D4CC] flex items-center justify-center text-[#171714] hover:border-[#171714] hover:bg-[#FAF9F6] transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-10 h-10 border border-[#D8D4CC] flex items-center justify-center text-[#171714] hover:border-[#171714] hover:bg-[#FAF9F6] transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel with 15% visible peek for the trailing card */}
      <div
        ref={scrollContainerRef}
        className="flex space-x-6 overflow-x-auto no-scrollbar scroll-smooth pl-5 md:pl-12 pr-12 pb-6"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            id={`selection-card-${product.id}`}
            onClick={() => onSelectProduct(product.slug)}
            className="flex-shrink-0 w-[270px] sm:w-[320px] md:w-[360px] group cursor-pointer"
            style={{ scrollSnapAlign: 'start' }}
          >
            {/* Image Container with 3:4 Aspect Ratio */}
            <div className="relative aspect-[3/4] w-full bg-[#FAF9F6] border border-[#D8D4CC] overflow-hidden">
              <img
                src={product.primaryImage}
                alt={product.name}
                className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                loading="lazy"
              />

              {product.badge && (
                <span className="absolute top-3 left-3 bg-[#FAF9F6]/90 backdrop-blur-xs text-[10px] tracking-[0.2em] uppercase font-semibold text-[#171714] px-2 py-0.5 border border-[#D8D4CC]">
                  {product.badge}
                </span>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickAdd(product);
                }}
                className="absolute bottom-3 right-3 bg-[#171714] text-[#FAF9F6] hover:bg-[#681F2C] text-[10px] font-semibold tracking-[0.16em] uppercase px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Quick Add +
              </button>
            </div>

            {/* Product Meta */}
            <div className="mt-3 flex justify-between items-baseline">
              <div>
                <h4 className="font-serif text-xl text-[#171714] group-hover:text-[#681F2C] transition-colors">
                  {product.name}
                </h4>
                <p className="text-xs text-[#56554F] mt-0.5">
                  {product.collection || 'Collection 01'}
                </p>
              </div>
              <span className="font-sans text-sm font-semibold text-[#171714]">
                {formatPrice(product.price)}
              </span>
            </div>
          </div>
        ))}

        {/* 15% Peeking End Indicator Card */}
        <div className="flex-shrink-0 w-[160px] sm:w-[220px] flex flex-col justify-center items-center border border-dashed border-[#D8D4CC] p-6 text-center text-[#56554F] bg-[#FAF9F6]/50">
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#681F2C] mb-1">
            Archive
          </span>
          <p className="font-serif text-lg text-[#171714]">
            Explore All 24 Pieces
          </p>
        </div>
      </div>
    </section>
  );
};
