import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Category } from '../types';

interface CategoryShowcaseProps {
  onNavigateCategory: (category: Category) => void;
}

interface CategoryItem {
  id: Exclude<Category, 'all'>;
  label: string;
  caption: string;
  image: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'dresses',
    label: 'Dresses',
    caption: 'Everyday to evening',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 'sets',
    label: 'Sets',
    caption: 'Matching two-pieces',
    image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 'tops',
    label: 'Tops',
    caption: 'Shirts & blouses',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 'bottoms',
    label: 'Bottoms',
    caption: 'Trousers & skirts',
    image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 'occasion',
    label: 'Occasion',
    caption: 'For the big days',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=900&auto=format&fit=crop',
  },
];

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({ onNavigateCategory }) => {
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

      {/* 2 up on phones (Occasion spans the last row), 5 across on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-5">
        {CATEGORIES.map((cat, i) => (
          <button
            key={cat.id}
            onClick={() => onNavigateCategory(cat.id)}
            className={`group relative overflow-hidden bg-[#FAF9F6] text-left ${
              i === CATEGORIES.length - 1 ? 'col-span-2 lg:col-span-1' : ''
            }`}
          >
            <div
              className={`w-full overflow-hidden ${
                i === CATEGORIES.length - 1 ? 'aspect-[2/1] lg:aspect-[3/4]' : 'aspect-[3/4]'
              }`}
            >
              <img
                src={cat.image}
                alt=""
                className="w-full h-full object-cover object-[center_30%] transition-transform duration-700 ease-editorial group-hover:scale-[1.05]"
                loading="lazy"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#171714]/75 via-[#171714]/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 flex items-end justify-between text-[#FAF9F6]">
              <div>
                <h3 className="font-serif text-2xl md:text-3xl leading-none">{cat.label}</h3>
                <p className="text-xs tracking-wide text-[#FAF9F6]/80 mt-1.5">{cat.caption}</p>
              </div>
              <span className="w-9 h-9 rounded-full border border-[#FAF9F6]/60 flex items-center justify-center transition-colors group-hover:bg-[#FAF9F6] group-hover:text-[#171714]">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
