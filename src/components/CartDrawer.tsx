import React from 'react';
import { CartItem } from '../types';
import { formatPrice } from '../data/products';
import { X, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#171714]/40 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF9F6] border-l border-[#D8D4CC] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 border-b border-[#D8D4CC] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-serif text-2xl text-[#171714]">YOUR BAG</span>
              <span className="text-xs uppercase font-sans tracking-wider text-[#681F2C] font-semibold">
                ({items.reduce((sum, i) => sum + i.quantity, 0)})
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-[#171714] hover:text-[#681F2C] transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 divide-y divide-[#D8D4CC]">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-[#56554F] py-16">
                <ShoppingBag className="w-10 h-10 stroke-[1.25] text-[#56554F]" />
                <p className="font-serif text-xl text-[#171714]">Your bag is presently empty.</p>
                <p className="text-xs max-w-[240px] leading-relaxed">
                  Discover refined silhouettes created for the entrance in Collection 01.
                </p>
                <button
                  onClick={onClose}
                  className="editorial-link text-xs uppercase tracking-widest font-semibold text-[#681F2C] pt-2"
                >
                  Explore The Collection →
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-5 flex space-x-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-26 flex-shrink-0 bg-[#F4F1EB] border border-[#D8D4CC] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif text-lg text-[#171714] leading-snug">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-[10px] uppercase text-[#56554F] hover:text-[#681F2C] tracking-wider"
                        >
                          Remove
                        </button>
                      </div>

                      <p className="text-xs text-[#56554F] mt-1">
                        {item.selectedColor} · {item.selectedSize}
                      </p>

                      <p className="font-sans text-sm font-semibold text-[#171714] mt-1">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center space-x-3 mt-3">
                      <div className="flex items-center border border-[#D8D4CC] bg-[#F4F1EB]">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="p-1.5 hover:text-[#681F2C] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-[#171714]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="p-1.5 hover:text-[#681F2C] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Panel */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#D8D4CC] bg-[#F4F1EB] space-y-4">
              <div className="space-y-2 text-xs uppercase tracking-wider">
                <div className="flex justify-between text-[#56554F]">
                  <span>DELIVERY</span>
                  <span className="text-[#171714] font-medium">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-[#56554F]">
                  <span>LAGOS COURIER</span>
                  <span className="text-[#681F2C] font-semibold">Complimentary</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-[#171714] pt-2 border-t border-[#D8D4CC]">
                  <span>SUBTOTAL</span>
                  <span className="text-base">{formatPrice(subtotal)}</span>
                </div>
              </div>

              <button
                id="cart-checkout-btn"
                onClick={onProceedToCheckout}
                className="w-full bg-[#171714] hover:bg-[#681F2C] text-[#FAF9F6] text-xs font-semibold tracking-[0.2em] uppercase py-4 border border-[#171714] transition-colors cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>CHECKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center">
                <button
                  onClick={onClose}
                  className="editorial-link text-[11px] uppercase tracking-widest text-[#56554F] hover:text-[#171714]"
                >
                  Continue shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
