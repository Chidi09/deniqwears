import React, { useState } from 'react';
import { Product } from '../types';
import { formatPrice } from '../data/products';
import { X, Package, MapPin, Heart, ArrowRight } from 'lucide-react';

interface AccountDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (slug: string) => void;
  onQuickAdd: (product: Product) => void;
}

export const AccountDrawer: React.FC<AccountDrawerProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
  onQuickAdd,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'wishlist'>('orders');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#171714]/40 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF9F6] border-l border-[#D8D4CC] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 border-b border-[#D8D4CC] flex items-center justify-between">
            <div>
              <span className="text-[10px] tracking-[0.25em] uppercase font-semibold text-[#681F2C]">
                Private Client Area
              </span>
              <h3 className="font-serif text-2xl text-[#171714] mt-0.5">My Account</h3>
            </div>
            <button onClick={onClose} className="p-1 text-[#171714] hover:text-[#681F2C]">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#D8D4CC] text-xs font-semibold tracking-wider uppercase bg-[#F4F1EB]">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-3 text-center border-r border-[#D8D4CC] transition-colors ${
                activeTab === 'orders' ? 'bg-[#FAF9F6] text-[#171714] border-b-2 border-b-[#681F2C]' : 'text-[#56554F]'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`flex-1 py-3 text-center border-r border-[#D8D4CC] transition-colors ${
                activeTab === 'addresses' ? 'bg-[#FAF9F6] text-[#171714] border-b-2 border-b-[#681F2C]' : 'text-[#56554F]'
              }`}
            >
              Addresses
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`flex-1 py-3 text-center transition-colors ${
                activeTab === 'wishlist' ? 'bg-[#FAF9F6] text-[#171714] border-b-2 border-b-[#681F2C]' : 'text-[#56554F]'
              }`}
            >
              Saved
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="p-4 border border-[#D8D4CC] bg-[#F4F1EB] space-y-3">
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <p className="font-mono font-semibold text-[#171714]">#DNQ-2026-8841</p>
                      <p className="text-[#56554F] text-[11px]">Placed on 18 Feb 2026</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 border border-emerald-300">
                      Delivered
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs pt-1">
                    <img
                      src={products[0].primaryImage}
                      alt="The Amara Dress"
                      className="w-10 h-14 object-cover border border-[#D8D4CC]"
                    />
                    <div>
                      <p className="font-serif text-sm text-[#171714]">The Amara Dress (Ink · M)</p>
                      <p className="text-[#56554F]">{formatPrice(48000)} · Lagos Express</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-[#D8D4CC] bg-[#F4F1EB] space-y-3">
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <p className="font-mono font-semibold text-[#171714]">#DNQ-2026-7209</p>
                      <p className="text-[#56554F] text-[11px]">Placed on 04 Jan 2026</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#681F2C] bg-[#FAF9F6] px-2 py-0.5 border border-[#D8D4CC]">
                      Archived
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs pt-1">
                    <img
                      src={products[1].primaryImage}
                      alt="Sculpted Corset"
                      className="w-10 h-14 object-cover border border-[#D8D4CC]"
                    />
                    <div>
                      <p className="font-serif text-sm text-[#171714]">Sculpted Corset (Oxblood · S)</p>
                      <p className="text-[#56554F]">{formatPrice(34500)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 border border-[#171714] bg-[#F4F1EB] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[#171714] uppercase tracking-wider">Default Residence</span>
                    <span className="text-[10px] uppercase text-[#681F2C] font-semibold">Primary</span>
                  </div>
                  <p className="text-[#56554F] leading-relaxed">
                    14A Admiralty Way, Lekki Phase 1<br />
                    Lagos, Nigeria<br />
                    +234 818 290 1122
                  </p>
                </div>

                <div className="p-4 border border-[#D8D4CC] bg-[#F4F1EB] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[#171714] uppercase tracking-wider">Office & Atelier Pickup</span>
                  </div>
                  <p className="text-[#56554F] leading-relaxed">
                    Plot 14 Oko Awo Street, Victoria Island<br />
                    Lagos, Nigeria
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="space-y-4">
                {products.slice(2, 5).map((p) => (
                  <div key={p.id} className="flex items-center space-x-3 p-3 border border-[#D8D4CC] bg-[#F4F1EB]">
                    <img src={p.primaryImage} alt={p.name} className="w-14 h-18 object-cover border border-[#D8D4CC]" />
                    <div className="flex-1 min-w-0 text-xs">
                      <h5
                        onClick={() => {
                          onSelectProduct(p.slug);
                          onClose();
                        }}
                        className="font-serif text-base text-[#171714] hover:text-[#681F2C] cursor-pointer truncate"
                      >
                        {p.name}
                      </h5>
                      <p className="text-[#171714] font-semibold">{formatPrice(p.price)}</p>
                      <button
                        onClick={() => onQuickAdd(p)}
                        className="text-[10px] uppercase tracking-wider font-semibold text-[#681F2C] hover:underline mt-1 block"
                      >
                        Add to Bag +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-[#D8D4CC] bg-[#F4F1EB] text-xs text-[#56554F] text-center">
            <p>Signed in as <span className="font-semibold text-[#171714]">client@deniqwears.com</span></p>
            <p className="text-[10px] text-[#681F2C] uppercase tracking-wider pt-1">Private VIP Tier 01</p>
          </div>
        </div>
      </div>
    </div>
  );
};
