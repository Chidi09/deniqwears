import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Category, Product } from '../types';

interface CategoryShowcaseProps {
  products: Product[];
  onNavigateCategory: (category: Category) => void;
}

type ShopCategory = Exclude<Category, 'all'>;

const CATEGORY_ORDER: { id: ShopCategory; label: string }[] = [
  { id: 'sets', label: 'Sets' },
  { id: 'dresses', label: 'Dresses' },
  { id: 'occasion', label: 'Occasion' },
  { id: 'tops', label: 'Tops' },
  { id: 'bottoms', label: 'Bottoms' },
];

// Static class names so Tailwind can see them.
const DESKTOP_COLUMNS: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
};

/**
 * One tile per category that actually has pieces, pictured with a real
 * product from it — so the tiles always match the catalogue and never lead to
 * an empty page.
 */
export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({ products, onNavigateCategory }) => {
  const tiles = CATEGORY_ORDER.map((cat) => {
    const inCategory = products.filter((p) => p.category === cat.id);
    return { ...cat, count: inCategory.length, image: inCategory[0]?.primaryImage };
  }).filter((tile) => tile.count > 0);

  if (tiles.length === 0) return null;

  return (
    <section id="category-showcase" className="max-w-[1344px] mx-auto px-5 md:px-12 py-16 md:py-24">
      <div className="flex items-end justify-between mb-8 md:mb-10">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#681F2C]">Find your piece</span>
          <h2 className="font-serif text-4xl md:text-5xl text-[#171714]">Shop by Category</h2>
        </div>
        <button
          onClick={() => onNavigateCategory('all')}
          className="editorial-link hidden sm:inline-flex text-xs uppercase tracking-[0.18em] font-semibold text-[#171714] hover:text-[#681F2C]"
        >
          View all
        </button>
      </div>

      <div className={`grid grid-cols-2 ${DESKTOP_COLUMNS[tiles.length]} gap-3 md:gap-5`}>
        {tiles.map((tile, i) => (
          <button
            key={tile.id}
            onClick={() => onNavigateCategory(tile.id)}
            className={`group text-left ${tiles.length % 2 === 1 && i === tiles.length - 1 ? 'col-span-2 lg:col-span-1' : ''}`}
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-[#FAF9F6] border border-[#D8D4CC]">
              {tile.image && (
                <img
                  src={tile.image}
                  alt=""
                  className="w-full h-full object-contain p-5 transition-transform duration-700 ease-editorial group-hover:scale-[1.04]"
                  loading="lazy"
                />
              )}
              <span className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#171714] text-[#FAF9F6] flex items-center justify-center transition-colors group-hover:bg-[#681F2C]">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-3">
              <h3 className="font-serif text-2xl md:text-3xl text-[#171714] group-hover:text-[#681F2C] transition-colors">
                {tile.label}
              </h3>
              <span className="text-xs text-[#56554F]">
                {tile.count} {tile.count === 1 ? 'piece' : 'pieces'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
