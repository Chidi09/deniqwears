import React, { useState } from 'react';
import { Product, ProductColor } from '../types';
import { formatMoney } from '../lib/money';
import { useStoreSettingsQuery } from '../hooks/queries';
import { ArrowLeft, Star, ChevronDown, ChevronUp, Check, ShieldCheck, Truck } from 'lucide-react';
import { AdireBand, AdireMark } from './Adire';
import { ProductCard } from './ProductCard';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, color: string, size: string) => void;
  onOpenSizeGuide: () => void;
  /** Other pieces to suggest below the product. */
  related?: Product[];
  onSelectProduct?: (slug: string) => void;
  onQuickAdd?: (product: Product) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onBack,
  onAddToCart,
  onOpenSizeGuide,
  related = [],
  onSelectProduct,
  onQuickAdd,
}) => {
  // Empty colours/sizes are valid create payloads for drafts, and these were
  // dereferenced unconditionally (`selectedColor.name`), crashing the page.
  const { data: settings } = useStoreSettingsQuery();
  const returnPeriodDays = settings?.returnPeriodDays ?? 5;
  const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes[1] || product.sizes[0]
  );
  const [activeMobileImageIndex, setActiveMobileImageIndex] = useState<number>(0);
  const [isButtonMorphed, setIsButtonMorphed] = useState(false);

  // Accordion state
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    description: true,
    fit: false,
    delivery: false,
    care: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // A garment with no colours or sizes can't be configured or bought. It is a
  // valid draft shape, so render an honest message instead of dereferencing
  // undefined selections (which is what crashed this page).
  if (!selectedColor || !selectedSize) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center bg-[#F4F1EB]">
        <span className="text-xs uppercase tracking-[0.3em] text-[#681F2C] font-semibold mb-3">
          Not Yet Available
        </span>
        <h1 className="font-serif text-3xl text-[#171714] mb-4">{product.name}</h1>
        <p className="text-[#56554F] text-sm max-w-md mb-8">
          This piece hasn’t been configured for sale yet. Contact us if you would like to
          be told when it is released.
        </p>
        <button
          onClick={onBack}
          className="text-xs uppercase tracking-widest bg-[#171714] text-[#FAF9F6] px-6 py-3.5 hover:bg-[#681F2C] transition-colors cursor-pointer"
        >
          Return to Collection
        </button>
      </div>
    );
  }

  // Find active variant & stock
  const currentVariant = product.variants?.find(
    (v) => v.color.toLowerCase() === selectedColor.name.toLowerCase() && v.size === selectedSize
  );

  // A missing variant means that colour/size combination isn't sold — treat it
  // as unavailable. It used to default to "5 in stock", offering combinations
  // checkout would reject, and `active` was ignored entirely.
  const variantStock = currentVariant && currentVariant.active ? currentVariant.stock : 0;
  const isOutOfStock = variantStock === 0;

  // Variant override wins; no invented fallback price.
  const productPrice = currentVariant?.priceInKobo ?? product.priceInKobo;

  const handleAdd = () => {
    if (isOutOfStock) return;
    onAddToCart(product, selectedColor.name, selectedSize);

    // Button morph: ADD TO BAG -> ADDED ✓ -> normal state after 1600ms
    setIsButtonMorphed(true);
    setTimeout(() => {
      setIsButtonMorphed(false);
    }, 1600);
  };

  const imagesToDisplay =
    product.galleryImages?.length > 0
      ? product.galleryImages
      : [product.primaryImage, product.secondaryImage];

  return (
    <div id="product-detail-page" className="min-h-screen bg-[#F4F1EB] pt-6 pb-28 md:pb-36 animate-in fade-in duration-300">
      {/* Top back navigation */}
      <div className="max-w-[1344px] mx-auto px-5 md:px-12 mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.16em] text-[#56554F] hover:text-[#171714] transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Collection</span>
        </button>
      </div>

      <div className="max-w-[1344px] mx-auto px-5 md:px-12">
        {/* Main 65 / 35 Desktop Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Left Column (65% on desktop): High-Resolution Image Grid */}
          <div className="lg:col-span-7 xl:col-span-8">
            {/* Desktop: Multi-image grid that scrolls naturally */}
            <div className="hidden sm:grid sm:grid-cols-2 gap-4">
              {imagesToDisplay.map((img, idx) => (
                <div
                  key={idx}
                  className={`bg-[#FAF9F6] border border-[#D8D4CC] overflow-hidden ${
                    idx === 0 ? 'sm:col-span-2 aspect-[4/5] sm:aspect-[16/11]' : 'aspect-[3/4]'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} view ${idx + 1}`}
                    className="w-full h-full object-contain p-3 hover:scale-[1.02] transition-transform duration-700 ease-out"
                    loading={idx === 0 ? 'eager' : 'lazy'}
                  />
                </div>
              ))}
            </div>

            {/* Mobile: Swipe / Carousel gallery with counter (1 / 5) */}
            <div className="sm:hidden relative">
              <div className="relative aspect-[3/4] bg-[#FAF9F6] border border-[#D8D4CC] overflow-hidden">
                <img
                  src={imagesToDisplay[activeMobileImageIndex] || product.primaryImage}
                  alt={product.name}
                  className="w-full h-full object-contain p-3"
                />

                {/* Mobile Counter 1 / N */}
                <div className="absolute bottom-4 right-4 bg-[#FAF9F6]/90 text-[#171714] text-xs font-semibold px-2.5 py-1 border border-[#D8D4CC]">
                  {activeMobileImageIndex + 1} / {imagesToDisplay.length}
                </div>
              </div>

              {/* Mobile thumbnail indicators */}
              <div className="flex space-x-2 mt-3 overflow-x-auto pb-1">
                {imagesToDisplay.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveMobileImageIndex(idx)}
                    className={`relative w-14 h-16 flex-shrink-0 border ${
                      activeMobileImageIndex === idx
                        ? 'border-[#681F2C] ring-1 ring-[#681F2C]'
                        : 'border-[#D8D4CC]'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (35% on desktop): Sticky Purchase Panel */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-[100px] space-y-6 pt-2">
            {/* Collection eyebrow & Title */}
            <div className="space-y-1.5 border-b border-[#D8D4CC] pb-5">
              <div className="flex justify-between items-center">
                <span className="inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase font-semibold text-[#681F2C]">
                  <AdireMark />
                  {product.collection || 'NEW COLLECTION'}
                </span>
                {product.badge && (
                  <span className="text-[11px] tracking-[0.2em] uppercase font-semibold text-[#171714] bg-[#FAF9F6] px-2 py-0.5 border border-[#D8D4CC]">
                    {product.badge}
                  </span>
                )}
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl text-[#171714] leading-tight">
                {product.name}
              </h1>

              <div className="flex justify-between items-center pt-1">
                <span className="font-sans text-2xl font-medium text-[#171714]">
                  {formatMoney(productPrice)}
                </span>

                {/* Rating: only once real reviews exist */}
                {product.reviewsCount > 0 && (
                  <div className="flex items-center space-x-1 text-xs text-[#56554F]">
                    <div className="flex text-[#681F2C]">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < Math.round(product.rating) ? 'fill-current' : ''}`}
                        />
                      ))}
                    </div>
                    <span className="font-medium text-[#171714] ml-1">{product.rating.toFixed(1)}</span>
                    <span className="text-[#56554F]">({product.reviewsCount})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Colour Swatches */}
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs tracking-wider uppercase">
                <span className="text-[#56554F]">COLOUR</span>
                <span className="font-semibold text-[#171714]">{selectedColor.name}</span>
              </div>
              <div className="flex space-x-3">
                {product.colors.map((c) => {
                  const isSelected = selectedColor.name === c.name;
                  return (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c)}
                      className={`group relative flex items-center space-x-2 px-3 py-1.5 border text-xs transition-colors ${
                        isSelected
                          ? 'border-[#171714] bg-[#FAF9F6]'
                          : 'border-[#D8D4CC] bg-transparent hover:border-[#56554F]'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/20"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-[#171714]">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs tracking-wider uppercase">
                <span className="text-[#56554F]">SIZE</span>
                <button
                  onClick={onOpenSizeGuide}
                  className="editorial-link font-medium text-[#681F2C] hover:underline cursor-pointer"
                >
                  Size Chart
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map((sz) => {
                  const isSelected = selectedSize === sz;
                  const szVariant = product.variants?.find(
                    (v) => v.color.toLowerCase() === selectedColor.name.toLowerCase() && v.size === sz
                  );
                  const szOutOfStock = szVariant && szVariant.stock === 0;

                  return (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      disabled={szOutOfStock}
                      className={`h-11 flex flex-col items-center justify-center text-xs font-semibold uppercase tracking-wider transition-colors border ${
                        isSelected
                          ? 'bg-[#171714] text-[#FAF9F6] border-[#171714]'
                          : szOutOfStock
                          ? 'bg-[#F4F1EB] text-[#8A8780] border-[#D8D4CC] line-through cursor-not-allowed opacity-50'
                          : 'bg-[#FAF9F6] text-[#171714] border-[#D8D4CC] hover:border-[#171714]'
                      }`}
                    >
                      <span>{sz}</span>
                    </button>
                  );
                })}
              </div>

              {/* Scarcity Notice */}
              {variantStock > 0 && variantStock <= 3 && (
                <p className="text-xs text-[#681F2C] font-semibold tracking-wide pt-1">
                  • Only {variantStock} remaining in {selectedColor.name} · {selectedSize}
                </p>
              )}
              {isOutOfStock && (
                <p className="text-xs text-red-700 font-semibold tracking-wide pt-1">
                  • Currently sold out in {selectedColor.name} · {selectedSize}
                </p>
              )}
            </div>

            {/* Desktop Add to Bag CTA (with morphing state) */}
            <div className="pt-2 hidden sm:block">
              <button
                id="add-to-bag-desktop-btn"
                onClick={handleAdd}
                disabled={isOutOfStock}
                className={`w-full text-xs font-semibold tracking-[0.2em] uppercase py-4 border transition-all duration-300 cursor-pointer flex items-center justify-center space-x-2 ${
                  isOutOfStock
                    ? 'bg-[#E6E1D7] text-[#8A8780] border-[#D8D4CC] cursor-not-allowed'
                    : isButtonMorphed
                    ? 'bg-[#681F2C] text-white border-[#681F2C] scale-[0.99]'
                    : 'bg-[#171714] hover:bg-[#681F2C] text-[#FAF9F6] border-[#171714]'
                }`}
              >
                {isOutOfStock ? (
                  <span>SOLD OUT</span>
                ) : isButtonMorphed ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>ADDED ✓</span>
                  </>
                ) : (
                  <span>ADD TO BAG — {formatMoney(productPrice)}</span>
                )}
              </button>
            </div>

            {/* Reassurance pills */}
            <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#D8D4CC] text-xs text-[#56554F]">
              <div className="flex items-center space-x-2">
                <Truck className="w-3.5 h-3.5 text-[#681F2C]" />
                <span>Ships across the USA</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#681F2C]" />
                <span>{returnPeriodDays}-day returns</span>
              </div>
            </div>

            {/* Product Accordions: Description, Fit & Size, Delivery, Care */}
            <div className="divide-y divide-[#D8D4CC] pt-2 border-b border-[#D8D4CC]">
              {/* Description */}
              <div className="py-3.5">
                <button
                  onClick={() => toggleAccordion('description')}
                  className="w-full flex justify-between items-center text-xs font-semibold tracking-[0.16em] uppercase text-[#171714] cursor-pointer"
                >
                  <span>Description</span>
                  {openAccordions.description ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {openAccordions.description && (
                  <div className="pt-3 text-sm text-[#56554F] font-light leading-relaxed">
                    <p>{product.description}</p>
                  </div>
                )}
              </div>

              {/* Fit & Size */}
              <div className="py-3.5">
                <button
                  onClick={() => toggleAccordion('fit')}
                  className="w-full flex justify-between items-center text-xs font-semibold tracking-[0.16em] uppercase text-[#171714] cursor-pointer"
                >
                  <span>Fit & Size</span>
                  {openAccordions.fit ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordions.fit && (
                  <div className="pt-3 text-sm text-[#56554F] font-light leading-relaxed space-y-2">
                    <p>{product.fitAndSize}</p>
                    <p className="text-xs text-[#171714] font-medium">
                      Model is wearing size S.
                    </p>
                  </div>
                )}
              </div>

              {/* Delivery */}
              <div className="py-3.5">
                <button
                  onClick={() => toggleAccordion('delivery')}
                  className="w-full flex justify-between items-center text-xs font-semibold tracking-[0.16em] uppercase text-[#171714] cursor-pointer"
                >
                  <span>Delivery & Returns</span>
                  {openAccordions.delivery ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {openAccordions.delivery && (
                  <div className="pt-3 text-sm text-[#56554F] font-light leading-relaxed">
                    <p>{product.delivery}</p>
                    <p className="text-xs text-[#56554F] pt-2">
                      Returns and exchanges accepted within {returnPeriodDays} days for unworn pieces with tags attached.
                    </p>
                  </div>
                )}
              </div>

              {/* Care */}
              <div className="py-3.5">
                <button
                  onClick={() => toggleAccordion('care')}
                  className="w-full flex justify-between items-center text-xs font-semibold tracking-[0.16em] uppercase text-[#171714] cursor-pointer"
                >
                  <span>Fabric & Care</span>
                  {openAccordions.care ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordions.care && (
                  <div className="pt-3 text-sm text-[#56554F] font-light leading-relaxed">
                    <p>{product.care}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* You may also like — an oxblood adire trim leads into it */}
      {related.length > 0 && onSelectProduct && onQuickAdd && (
        <section className="mt-24 md:mt-32">
          <AdireBand height={24} className="text-[#FAF9F6] bg-[#681F2C]" />
          <div className="max-w-[1344px] mx-auto px-5 md:px-12 pt-14">
            <div className="flex items-end justify-between mb-8">
              <h2 className="font-serif text-3xl md:text-4xl text-[#171714]">You may also like</h2>
              <span className="text-xs uppercase tracking-[0.2em] text-[#56554F]">Sizes 10 – 20</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} onSelect={onSelectProduct} onQuickAdd={onQuickAdd} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mobile PDP Sticky Bottom Bar with format: `₦48,000 | ADD TO BAG` */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FAF9F6] border-t border-[#D8D4CC] p-3 flex items-center justify-between shadow-lg">
        <div className="flex flex-col">
          <span className="text-[11px] uppercase text-[#56554F] tracking-wider truncate max-w-[150px]">
            {product.name}
          </span>
          <span className="font-sans text-sm font-semibold text-[#171714]">
            {selectedColor.name} · {selectedSize}
          </span>
        </div>
        <button
          id="add-to-bag-mobile-btn"
          onClick={handleAdd}
          disabled={isOutOfStock}
          className={`text-xs font-semibold tracking-[0.16em] uppercase px-5 py-3 border transition-all duration-300 ${
            isOutOfStock
              ? 'bg-[#E6E1D7] text-[#8A8780] border-[#D8D4CC]'
              : isButtonMorphed
              ? 'bg-[#681F2C] text-white border-[#681F2C]'
              : 'bg-[#171714] text-[#FAF9F6] border-[#171714]'
          }`}
        >
          {isOutOfStock
            ? 'Sold Out'
            : isButtonMorphed
            ? 'Added ✓'
            : `${formatMoney(productPrice)} | ADD TO BAG`}
        </button>
      </div>
    </div>
  );
};
