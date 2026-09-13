import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Category, ActivePage } from '../types';

interface CategoryShowcaseProps {
  onNavigateCategory: (category: Category) => void;
}

interface CategoryItem {
  number: string;
  id: Category;
  label: string;
  description: string;
  image: string;
  alignment: 'left' | 'right';
}

const CATEGORIES: CategoryItem[] = [
  {
    number: '01',
    id: 'dresses',
    label: 'DRESSES',
    description: 'Column silhouettes, bias fluid cuts, and sculpted floor-sweeping hems.',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
    alignment: 'left',
  },
  {
    number: '02',
    id: 'sets',
    label: 'SETS',
    description: 'Two-piece tailored ensembles engineered for ease and instant composure.',
    image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=1200&auto=format&fit=crop',
    alignment: 'right',
  },
  {
    number: '03',
    id: 'tops',
    label: 'TOPS & CORSETS',
    description: 'Structural boning, raw-hem trims, and architectural peak lapel jackets.',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
    alignment: 'left',
  },
  {
    number: '04',
    id: 'bottoms',
    label: 'BOTTOMS',
    description: 'Deep double-front pleats, high-rise silhouettes, and asymmetric draping.',
    image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?q=80&w=1200&auto=format&fit=crop',
    alignment: 'right',
  },
  {
    number: '05',
    id: 'occasion',
    label: 'OCCASION',
    description: 'Pieces for dinners, celebrations and moments where presence is essential.',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1200&auto=format&fit=crop',
    alignment: 'left',
  }
];

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({ onNavigateCategory }) => {
  return (
    <section id="category-showcase" className="max-w-[1344px] mx-auto px-5 md:px-12 py-16 md:py-28">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-16 pb-4 border-b border-[#D8D4CC]">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#681F2C]">
            Classification
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-[#171714]">
            Shop by Category
          </h2>
        </div>
        <p className="text-xs tracking-wider uppercase text-[#56554F] mt-2 sm:mt-0">
          Curated Silhouettes
        </p>
      </div>

      {/* Massive Editorial Layout Alternating Left / Right */}
      <div className="space-y-24 md:space-y-36">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            onClick={() => onNavigateCategory(cat.id)}
            className="group cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center"
          >
            {/* If alignment is left: text left, image right */}
            {cat.alignment === 'left' ? (
              <>
                <div className="lg:col-span-5 order-2 lg:order-1 space-y-4">
                  <span className="text-sm font-sans font-semibold tracking-widest text-[#681F2C]">
                    {cat.number}
                  </span>
                  
                  <div className="flex items-center space-x-4 border-b border-[#171714] pb-2 group-hover:border-[#681F2C] transition-colors">
                    <h3 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#171714] group-hover:text-[#681F2C] transition-colors">
                      {cat.label}
                    </h3>
                    <ArrowRight className="w-6 h-6 text-[#171714] group-hover:text-[#681F2C] transition-transform duration-300 group-hover:translate-x-3" />
                  </div>

                  <p className="text-sm md:text-base text-[#56554F] max-w-[420px] font-light leading-relaxed">
                    {cat.description}
                  </p>

                  <span className="inline-block text-xs uppercase tracking-[0.2em] font-medium text-[#171714] border-b border-transparent group-hover:border-[#681F2C] group-hover:text-[#681F2C] pt-2">
                    View Silhouettes →
                  </span>
                </div>

                <div className="lg:col-span-7 order-1 lg:order-2 overflow-hidden bg-[#FAF9F6] border border-[#D8D4CC]">
                  <div className="aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden">
                    <img
                      src={cat.image}
                      alt={cat.label}
                      className="w-full h-full object-cover object-[center_35%] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  </div>
                </div>
              </>
            ) : (
              /* If alignment is right: image left, text right */
              <>
                <div className="lg:col-span-7 order-1 overflow-hidden bg-[#FAF9F6] border border-[#D8D4CC]">
                  <div className="aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden">
                    <img
                      src={cat.image}
                      alt={cat.label}
                      className="w-full h-full object-cover object-[center_35%] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="lg:col-span-5 order-2 space-y-4 lg:pl-6">
                  <span className="text-sm font-sans font-semibold tracking-widest text-[#681F2C]">
                    {cat.number}
                  </span>

                  <div className="flex items-center space-x-4 border-b border-[#171714] pb-2 group-hover:border-[#681F2C] transition-colors">
                    <h3 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#171714] group-hover:text-[#681F2C] transition-colors">
                      {cat.label}
                    </h3>
                    <ArrowRight className="w-6 h-6 text-[#171714] group-hover:text-[#681F2C] transition-transform duration-300 group-hover:translate-x-3" />
                  </div>

                  <p className="text-sm md:text-base text-[#56554F] max-w-[420px] font-light leading-relaxed">
                    {cat.description}
                  </p>

                  <span className="inline-block text-xs uppercase tracking-[0.2em] font-medium text-[#171714] border-b border-transparent group-hover:border-[#681F2C] group-hover:text-[#681F2C] pt-2">
                    View Silhouettes →
                  </span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
