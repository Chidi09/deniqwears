import React, { useState, useMemo } from 'react';
import { Product, Category, FilterState, GARMENT_SIZES } from '../types';
import { ProductCard } from './ProductCard';
import { SlidersHorizontal, X, Check } from 'lucide-react';

interface ShopPageProps {
  products: Product[];
  initialCategory?: Category;
  onSelectProduct: (slug: string) => void;
  onQuickAdd: (product: Product) => void;
}

const CATEGORY_EDITORIALS: Record<Category, { title: string; subtitle: string }> = {
  all: {
    title: 'THE COMPLETE EDIT',
    subtitle: 'Every silhouette from Collection 01 and seasonal showroom editions.',
  },
  dresses: {
    title: 'DRESSES',
    subtitle: 'Pieces for dinners, celebrations and everything that wasn’t supposed to become an occasion.',
  },
  sets: {
    title: 'TAILORED SETS',
    subtitle: 'Coordinated proportions that remove guesswork without diminishing impact.',
  },
  tops: {
    title: 'TOPS & CORSETRY',
    subtitle: 'Internal boning, raw hems, and architectural lines engineered to layer or stand solitary.',
  },
  bottoms: {
    title: 'TROUSERS & SKIRTS',
    subtitle: 'Deep double-front pleats, dramatic hems, and high waist rises with sweeping movement.',
  },
  occasion: {
    title: 'ATELIER OCCASION',
    subtitle: 'Heavyweight columns and backless gowns created for indelible entrances.',
  },
};

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  initialCategory = 'all',
  onSelectProduct,
  onQuickAdd,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>(initialCategory);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const allSizes = GARMENT_SIZES;

  // Derived from what's actually in the catalog. The hardcoded list omitted
  // live colours (Sand, for one), so those pieces were unreachable by filter.
  const allColors = useMemo(() => {
    const byName = new Map<string, { name: string; hex: string }>();
    for (const product of products) {
      for (const color of product.colors) {
        if (!byName.has(color.name)) byName.set(color.name, color);
      }
    }
    return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const toggleSize = (sz: string) => {
    setSelectedSizes((prev) =>
      prev.includes(sz) ? prev.filter((s) => s !== sz) : [...prev, sz]
    );
  };

  const toggleColor = (colName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colName) ? prev.filter((c) => c !== colName) : [...prev, colName]
    );
  };

  const clearFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
  };

  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // Size and colour are matched against real variants when we have them, so
    // filtering by "Oxblood" + "16" can't return a product that sells Oxblood
    // and 16 only in separate, non-existent combinations.
    if (selectedSizes.length > 0 || selectedColors.length > 0) {
      list = list.filter((p) => {
        const variants = (p.variants ?? []).filter((v) => v.active);

        if (variants.length === 0) {
          const sizeOk = selectedSizes.length === 0 || p.sizes.some((sz) => selectedSizes.includes(sz));
          const colorOk =
            selectedColors.length === 0 || p.colors.some((c) => selectedColors.includes(c.name));
          return sizeOk && colorOk;
        }

        return variants.some(
          (v) =>
            (selectedSizes.length === 0 || selectedSizes.includes(v.size)) &&
            (selectedColors.length === 0 || selectedColors.includes(v.color))
        );
      });
    }

    // Sort
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.priceInKobo - b.priceInKobo);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.priceInKobo - a.priceInKobo);
    } else if (sortBy === 'newest') {
      list.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
    }

    return list;
  }, [products, selectedCategory, selectedSizes, selectedColors, sortBy]);

  const currentEditorial = CATEGORY_EDITORIALS[selectedCategory];

  return (
    <div id="shop-catalog-page" className="min-h-screen bg-[#F4F1EB] pt-8 pb-32">
      <div className="max-w-[1344px] mx-auto px-5 md:px-12">
        {/* Category Navigation Pills */}
        <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto no-scrollbar pb-4 border-b border-[#D8D4CC] text-xs font-semibold tracking-[0.16em] uppercase">
          {(['all', 'dresses', 'sets', 'tops', 'bottoms', 'occasion'] as Category[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#171714] text-[#FAF9F6]'
                  : 'text-[#56554F] hover:text-[#171714] hover:bg-[#FAF9F6]'
              }`}
            >
              {cat === 'all' ? 'All Pieces' : cat}
            </button>
          ))}
        </div>

        {/* Editorial Collection Header */}
        <div className="py-12 md:py-16 max-w-[720px] space-y-3">
          <div className="flex items-center space-x-3 text-xs tracking-[0.25em] uppercase text-[#681F2C] font-semibold">
            <span>COLLECTION 01</span>
            <span>·</span>
            <span>{filteredProducts.length} PIECES</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#171714] leading-[1.05]">
            {currentEditorial.title}
          </h1>

          <p className="text-[#56554F] text-base md:text-lg font-light leading-relaxed pt-1">
            {currentEditorial.subtitle}
          </p>
        </div>

        {/* Desktop Filter & Sort Bar */}
        <div className="py-4 border-y border-[#D8D4CC] flex justify-between items-center text-xs tracking-wider uppercase mb-10">
          <div className="flex items-center space-x-6">
            {/* Mobile Filter Sheet Button */}
            <button
              id="mobile-filter-btn"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center space-x-2 text-[#171714] font-semibold"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters {selectedSizes.length + selectedColors.length > 0 && `(${selectedSizes.length + selectedColors.length})`}</span>
            </button>

            {/* Desktop Quick Size Filter */}
            <div className="hidden lg:flex items-center space-x-2">
              <span className="text-[#56554F] font-semibold mr-1">Size:</span>
              {allSizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => toggleSize(sz)}
                  className={`w-7 h-7 flex items-center justify-center border text-[10px] font-semibold transition-colors ${
                    selectedSizes.includes(sz)
                      ? 'bg-[#171714] text-[#FAF9F6] border-[#171714]'
                      : 'bg-[#FAF9F6] text-[#56554F] border-[#D8D4CC] hover:border-[#171714]'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            {/* Desktop Quick Color Filter */}
            <div className="hidden lg:flex items-center space-x-3 border-l border-[#D8D4CC] pl-6">
              <span className="text-[#56554F] font-semibold">Colour:</span>
              {allColors.map((col) => (
                <button
                  key={col.name}
                  onClick={() => toggleColor(col.name)}
                  className={`flex items-center space-x-1 px-2 py-1 border text-[11px] ${
                    selectedColors.includes(col.name)
                      ? 'border-[#171714] bg-[#FAF9F6]'
                      : 'border-transparent text-[#56554F] hover:text-[#171714]'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/20"
                    style={{ backgroundColor: col.hex }}
                  />
                  <span>{col.name}</span>
                </button>
              ))}
            </div>

            {(selectedSizes.length > 0 || selectedColors.length > 0) && (
              <button
                onClick={clearFilters}
                className="hidden lg:inline-block text-[#681F2C] text-[11px] underline hover:text-[#171714]"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Sort Menu */}
          <div className="flex items-center space-x-2">
            <span className="text-[#56554F] font-semibold hidden sm:inline">SORT:</span>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc' | 'newest')
              }
              className="bg-transparent text-xs uppercase font-semibold text-[#171714] border-none focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="newest">New Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid: 4 columns desktop / 2 columns mobile */}
        {filteredProducts.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <p className="font-serif text-2xl text-[#171714]">No pieces match the selected filter combination.</p>
            <button
              onClick={clearFilters}
              className="text-xs uppercase tracking-widest text-[#681F2C] underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10 md:gap-y-14">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
                onQuickAdd={onQuickAdd}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile Filters Bottom Sheet */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end flex-col">
          <div className="bg-[#FAF9F6] border-t border-[#D8D4CC] p-6 max-h-[80vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-[#D8D4CC] pb-4">
              <span className="font-serif text-2xl text-[#171714]">FILTERS</span>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1">
                <X className="w-5 h-5 text-[#171714]" />
              </button>
            </div>

            {/* Sizes */}
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#56554F]">SIZE</span>
              <div className="grid grid-cols-5 gap-2">
                {allSizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => toggleSize(sz)}
                    className={`h-10 border text-xs font-semibold uppercase ${
                      selectedSizes.includes(sz)
                        ? 'bg-[#171714] text-[#FAF9F6] border-[#171714]'
                        : 'bg-white text-[#171714] border-[#D8D4CC]'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Colours */}
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#56554F]">COLOUR</span>
              <div className="grid grid-cols-2 gap-2">
                {allColors.map((col) => (
                  <button
                    key={col.name}
                    onClick={() => toggleColor(col.name)}
                    className={`flex items-center space-x-2 p-2.5 border text-xs ${
                      selectedColors.includes(col.name)
                        ? 'border-[#171714] bg-[#F4F1EB]'
                        : 'border-[#D8D4CC] bg-white text-[#171714]'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20"
                      style={{ backgroundColor: col.hex }}
                    />
                    <span>{col.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom button */}
            <div className="pt-4 border-t border-[#D8D4CC] flex items-center space-x-4">
              <button
                onClick={clearFilters}
                className="w-1/3 py-3 text-xs uppercase tracking-wider font-semibold border border-[#D8D4CC] text-[#56554F]"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-2/3 py-3 bg-[#171714] text-[#FAF9F6] text-xs uppercase tracking-wider font-semibold"
              >
                SHOW {filteredProducts.length} ITEMS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
