import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  onSelectProduct: (slug: string) => void;
  onQuickAdd: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  title = "Current Collection",
  subtitle = "Defined silhouettes designed for lasting rotation",
  onSelectProduct,
  onQuickAdd,
}) => {
  return (
    <section id="product-grid-section" className="max-w-[1344px] mx-auto px-5 md:px-12 pb-24 md:pb-32">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-[#D8D4CC]">
        <div>
          <span className="text-[11px] tracking-[0.25em] uppercase font-semibold text-[#681F2C]">
            Inventory 01
          </span>
          <h3 className="font-serif text-3xl md:text-4xl text-[#171714] mt-1">
            {title}
          </h3>
        </div>
        <p className="text-xs tracking-wider uppercase text-[#56554F] mt-2 sm:mt-0">
          {products.length} Selected Pieces
        </p>
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
