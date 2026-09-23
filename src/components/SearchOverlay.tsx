import React, { useState, useEffect, useRef } from 'react';
import { useDialog } from '../hooks/useDialog';
import { Product } from '../types';
import { formatMoney } from '../lib/money';
import { Search, X, ArrowRight } from 'lucide-react';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (slug: string) => void;
  onSelectCategory: (category: string) => void;
}

// The parent keeps this mounted permanently and toggles `isOpen`, so the
// outer component stays hook-free and simply gates rendering. Mounting a
// fresh SearchOverlayContent each time it opens resets `query` for free
// (no effect needed to clear it on close).
export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, ...rest }) => {
  if (!isOpen) return null;
  return <SearchOverlayContent {...rest} />;
};

type SearchOverlayContentProps = Omit<SearchOverlayProps, 'isOpen'>;

const SearchOverlayContent: React.FC<SearchOverlayContentProps> = ({
  onClose,
  products,
  onSelectProduct,
  onSelectCategory,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useDialog<HTMLDivElement>(true, onClose);

  // Autofocus the input on mount (a real external-system side effect — this
  // is what useEffect is for), not clearing state on close.
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  // Trim once and match collection too — the placeholder promises collection
  // search, and an untrimmed term meant a trailing space returned nothing.
  const term = query.trim().toLowerCase();
  const filteredProducts =
    term === ''
      ? []
      : products.filter((p) =>
          [p.name, p.category, p.description, p.collection ?? '']
            .some((field) => field.toLowerCase().includes(term))
        );

  const trendingTerms = ['Dresses', 'Sets', 'Evening', 'Corset', 'Oxblood', 'Tailored'];

  return (
    <div
      id="search-fullscreen-overlay"
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Search the collection"
      tabIndex={-1}
      className="fixed inset-0 z-50 bg-[#FAF9F6]/98 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="max-w-[1000px] mx-auto px-6 py-8 md:py-12">
        {/* Top bar with close button */}
        <div className="flex justify-between items-center mb-12">
          <span className="text-xs tracking-[0.25em] uppercase font-semibold text-[#681F2C]">
            Editorial Search
          </span>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-[#171714] hover:text-[#681F2C] transition-colors cursor-pointer"
            aria-label="Close search"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Big Search Input */}
        <div className="space-y-4">
          <h2 className="font-serif text-3xl sm:text-4xl text-[#171714]">
            What are you looking for?
          </h2>

          <div className="relative flex items-center border-b-2 border-[#171714] pb-3 focus-within:border-[#681F2C] transition-colors">
            <Search className="w-6 h-6 text-[#56554F] mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by silhouette, style, or collection..."
              className="w-full bg-transparent text-xl sm:text-2xl font-serif text-[#171714] placeholder-[#56554F]/50 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-xs text-[#56554F] hover:text-[#171714] uppercase tracking-wider ml-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Trending Suggestions when input is empty */}
        {query.trim() === '' ? (
          <div className="mt-12 space-y-6">
            <div className="text-xs tracking-[0.2em] uppercase font-semibold text-[#56554F]">
              Trending Searches
            </div>
            <div className="flex flex-wrap gap-2.5">
              {trendingTerms.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-4 py-2 border border-[#D8D4CC] bg-[#F4F1EB] hover:border-[#171714] hover:text-[#681F2C] text-xs uppercase tracking-wider transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>

            <div className="pt-10 border-t border-[#D8D4CC]">
              <span className="text-xs tracking-[0.2em] uppercase font-semibold text-[#56554F] block mb-4">
                Curated Highlights
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {products.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onSelectProduct(p.slug);
                      onClose();
                    }}
                    className="group cursor-pointer space-y-2"
                  >
                    <div className="aspect-[3/4] bg-[#FAF9F6] border border-[#D8D4CC] overflow-hidden">
                      <img
                        src={p.primaryImage}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="text-xs">
                      <p className="font-serif text-sm text-[#171714] group-hover:text-[#681F2C]">{p.name}</p>
                      <p className="text-[#56554F]">{formatMoney(p.priceInKobo)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Live Results List */
          <div className="mt-10 space-y-6">
            <div className="flex justify-between items-center text-xs tracking-wider uppercase text-[#56554F]">
              <span>Search Results ({filteredProducts.length})</span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="py-16 text-center text-[#56554F]">
                <p className="font-serif text-2xl text-[#171714]">No pieces found for “{query}”</p>
                <p className="text-sm mt-2">Try searching for dresses, sets, or corsetry.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      onSelectProduct(product.slug);
                      onClose();
                    }}
                    className="group cursor-pointer flex items-center space-x-4 p-3 border border-[#D8D4CC] bg-[#F4F1EB] hover:border-[#171714] transition-colors"
                  >
                    <div className="w-20 h-24 flex-shrink-0 bg-white border border-[#D8D4CC] overflow-hidden">
                      <img
                        src={product.primaryImage}
                        alt={product.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] uppercase tracking-wider text-[#681F2C] font-semibold">
                        {product.category}
                      </span>
                      <h4 className="font-serif text-lg text-[#171714] group-hover:text-[#681F2C] truncate">
                        {product.name}
                      </h4>
                      <p className="font-sans text-sm font-medium text-[#171714]">
                        {formatMoney(product.priceInKobo)}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#56554F] group-hover:text-[#681F2C] group-hover:translate-x-1 transition-transform" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
