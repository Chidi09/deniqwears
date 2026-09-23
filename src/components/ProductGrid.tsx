import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  onViewAll?: () => void;
  onSelectProduct: (slug: string) => void;
  onQuickAdd: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  title = "Current Collection",
  subtitle = "Defined silhouettes designed for lasting rotation",
  eyebrow = 'The collection',
  onViewAll,
  onSelectProduct,
  onQuickAdd,
}) => {
  return (
    <section id="product-grid-section" className="max-w-[1344px] mx-auto px-5 md:px-12 pb-24 md:pb-32">
      <div className="flex items-end justify-between gap-4 mb-8 md:mb-10">
        <div>
          <span className="text-xs tracking-[0.25em] uppercase font-semibold text-[#681F2C]">{eyebrow}</span>
          <h2 className="font-serif text-4xl md:text-5xl text-[#171714] mt-1">{title}</h2>
          {subtitle && <p className="text-sm text-[#56554F] mt-2">{subtitle}</p>}
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="editorial-link shrink-0 text-xs uppercase tracking-[0.18em] font-semibold text-[#171714] hover:text-[#681F2C]"
          >
            View all
          </button>
        )}
      </div>

      {/* 4 columns desktop / 2 columns mobile */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10 md:gap-y-14">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onSelect={onSelectProduct}
            onQuickAdd={onQuickAdd}
          />
        ))}
      </div>
    </section>
  );
};
