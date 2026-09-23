import React, { useState, useRef, useEffect } from 'react';
import { Product, ProductColor } from '../types';
import { formatMoney } from '../lib/money';
import { X, Check } from 'lucide-react';

interface QuickAddModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, color: string, size: string) => void;
  onViewProductDetails: (slug: string) => void;
}

// Thin wrapper: the parent mounts this permanently and toggles `product`
// between null and a real Product on the same instance, so it must stay
// hook-free itself. `key={product.id}` below forces QuickAddModalContent to
// remount for each new product, which resets its local selection state for
// free instead of needing an effect to sync it.
export const QuickAddModal: React.FC<QuickAddModalProps> = ({ product, ...rest }) => {
  if (!product) return null;
  return <QuickAddModalContent key={product.id} product={product} {...rest} />;
};

interface QuickAddModalContentProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, color: string, size: string) => void;
  onViewProductDetails: (slug: string) => void;
}

const QuickAddModalContent: React.FC<QuickAddModalContentProps> = ({
  product,
  onClose,
  onAddToCart,
  onViewProductDetails,
}) => {
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[1] || product.sizes[0]);
  const [isAdded, setIsAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Quick add previously checked nothing: it could add a sold-out or
  // non-existent colour/size combination straight to the bag.
  const selectedVariant = product.variants?.find(
    (v) => v.color.toLowerCase() === selectedColor.name.toLowerCase() && v.size === selectedSize
  );
  const isAvailable = !!selectedVariant && selectedVariant.active && selectedVariant.stock > 0;

  const handleAdd = () => {
    if (!isAvailable) return;
    onAddToCart(product, selectedColor.name, selectedSize);
    setIsAdded(true);
    // Cleared on unmount so a pending timer can't close a later modal.
    timerRef.current = setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#FAF9F6] border border-[#D8D4CC] p-6 shadow-2xl space-y-5">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[11px] tracking-[0.25em] uppercase font-semibold text-[#681F2C]">
              Quick Selection
            </span>
            <h3 className="font-serif text-2xl text-[#171714] mt-0.5">{product.name}</h3>
            <p className="font-sans text-sm font-semibold text-[#171714] mt-1">{formatMoney(product.priceInKobo)}</p>
          </div>
          <button onClick={onClose} className="p-1 text-[#171714] hover:text-[#681F2C]" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thumbnail Preview */}
        <div className="aspect-[16/10] bg-[#F4F1EB] border border-[#D8D4CC] overflow-hidden">
          <img src={product.primaryImage} alt={product.name} className="w-full h-full object-contain p-3" />
        </div>

        {/* Colors */}
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-wider text-[#56554F] block font-semibold">
            COLOUR: {selectedColor.name}
          </span>
          <div className="flex space-x-2">
            {product.colors.map((c) => (
              <button
                key={c.name}
                onClick={() => setSelectedColor(c)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 border text-xs ${
                  selectedColor.name === c.name
                    ? 'border-[#171714] bg-[#F4F1EB] font-medium'
                    : 'border-[#D8D4CC] bg-white text-[#56554F]'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: c.hex }} />
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-wider text-[#56554F] block font-semibold">
            SIZE: {selectedSize}
          </span>
          <div className="grid grid-cols-5 gap-2">
            {product.sizes.map((sz) => (
              <button
                key={sz}
                onClick={() => setSelectedSize(sz)}
                className={`h-10 border text-xs font-semibold uppercase ${
                  selectedSize === sz
                    ? 'bg-[#171714] text-[#FAF9F6] border-[#171714]'
                    : 'bg-white text-[#171714] border-[#D8D4CC] hover:border-[#171714]'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        {/* Add CTA */}
        <div className="pt-2 space-y-3">
          <button
            onClick={handleAdd}
            disabled={isAdded || !isAvailable}
            className="w-full bg-[#171714] hover:bg-[#681F2C] text-[#FAF9F6] text-xs font-semibold tracking-[0.2em] uppercase py-3.5 border border-[#171714] transition-colors flex items-center justify-center space-x-2 cursor-pointer"
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Added to Bag</span>
              </>
            ) : (
              <span>
                {isAvailable
                  ? `Add to Bag · ${formatMoney(selectedVariant?.priceInKobo ?? product.priceInKobo)}`
                  : 'Unavailable in this size'}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              onViewProductDetails(product.slug);
              onClose();
            }}
            className="w-full text-center text-xs tracking-wider uppercase text-[#56554F] hover:text-[#171714] py-1 underline"
          >
            View full details
          </button>
        </div>
      </div>
    </div>
  );
};
