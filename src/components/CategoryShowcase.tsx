import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Category, Product } from '../types';

interface CategoryShowcaseProps {
  products: Product[];
  onNavigateCategory: (category: Category) => void;
}

type ShopCategory = Exclude<Category, 'all'>;

// Typographic tiles in brand colours — the product photos already appear in
// New In, so repeating them here only made the page feel cluttered.
const CATEGORY_TILES: { id: ShopCategory; label: string; caption: string; tone: string }[] = [
  { id: 'sets', label: 'Sets', caption: 'Matching two-pieces', tone: 'bg-[#171714] text-[#FAF9F6]' },
  { id: 'dresses', label: 'Dresses', caption: 'Gowns & kaftans', tone: 'bg-[#681F2C] text-[#FAF9F6]' },
  { id: 'occasion', label: 'Occasion', caption: 'For the big days', tone: 'bg-[#E7DFD2] text-[#171714]' },
  { id: 'tops', label: 'Tops', caption: 'Shirts & blouses', tone: 'bg-[#FAF9F6] text-[#171714] border border-[#D8D4CC]' },
  { id: 'bottoms', label: 'Bottoms', caption: 'Trousers & skirts', tone: 'bg-[#56554F] text-[#FAF9F6]' },
];

// Static class names so Tailwind can see them.
const DESKTOP_COLUMNS: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
};

/** One tile per category that actually has pieces, so no tile leads to an empty page. */
export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({ products, onNavigateCategory }) => {
  const tiles = CATEGORY_TILES.map((tile) => ({
    ...tile,
    count: products.filter((p) => p.category === tile.id).length,
  })).filter((tile) => tile.count > 0);

  if (tiles.length === 0) return null;

  return (
    <section id="category-showcase" className="max-w-[1344px] mx-auto px-5 md:px-12 py-14 md:py-20">
      <div className="flex items-end justify-between mb-6 md:mb-8">
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

      <div className={`grid grid-cols-1 ${DESKTOP_COLUMNS[tiles.length]} gap-3 md:gap-4`}>
        {tiles.map((tile) => (
          <button
            key={tile.id}
            onClick={() => onNavigateCategory(tile.id)}
            className={`group relative overflow-hidden text-left p-6 md:p-8 min-h-[150px] md:min-h-[220px] flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1 ${tile.tone}`}
          >
            <span
              aria-hidden
              className="absolute -right-4 -bottom-10 font-serif italic text-[160px] leading-none opacity-[0.07] select-none"
            >
              {tile.label.charAt(0)}
            </span>
            <div className="flex items-start justify-between">
              <span className="text-xs uppercase tracking-[0.2em] opacity-70">
                {tile.count} {tile.count === 1 ? 'piece' : 'pieces'}
              </span>
              <span className="w-10 h-10 rounded-full border border-current/30 flex items-center justify-center transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
            <div>
              <h3 className="font-serif text-4xl md:text-5xl leading-none">{tile.label}</h3>
              <p className="text-sm opacity-75 mt-2">{tile.caption}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
