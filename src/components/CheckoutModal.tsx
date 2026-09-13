import React, { useState } from 'react';
import { CartItem } from '../types';
import { formatPrice } from '../data/products';
import { X, CheckCircle2, ShieldCheck, Lock, Truck } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onClearCart: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onClearCart,
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Victoria Island, Lagos',
    state: 'Lagos',
    paymentMethod: 'paystack',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = formData.state === 'Lagos' ? 0 : 4500;
  const total = subtotal + deliveryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      const randomOrder = 'DNQ-' + Math.floor(100000 + Math.random() * 900000);
      setOrderNumber(randomOrder);
      onClearCart();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#FAF9F6] border border-[#D8D4CC] shadow-2xl p-6 sm:p-10">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-[#171714] hover:text-[#681F2C]"
          aria-label="Close checkout"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-12 text-center max-w-lg mx-auto space-y-6 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-[#681F2C]/10 text-[#681F2C] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#681F2C]">
                Order Confirmed
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-[#171714]">
                Thank you for your order.
              </h2>
              <p className="font-mono text-sm text-[#56554F]">
                Reference: <span className="font-bold text-[#171714]">{orderNumber}</span>
              </p>
            </div>

            <div className="p-4 bg-[#F4F1EB] border border-[#D8D4CC] text-xs text-[#56554F] text-left space-y-2">
              <p className="font-semibold text-[#171714] uppercase tracking-wider">Dispatched with Care</p>
              <p>
                Our Victoria Island showroom team is now preparing your garments in archival Deniq wrapping.
                A confirmation dispatch dispatch notification has been scheduled to {formData.email || 'your email'}.
              </p>
              <p className="text-[#681F2C] font-medium pt-1">
                Estimated Delivery: Tomorrow by 14:00 (Lagos Express Courier)
              </p>
            </div>

            <button
              onClick={onClose}
              className="bg-[#171714] hover:bg-[#681F2C] text-[#FAF9F6] text-xs uppercase tracking-[0.2em] font-semibold px-8 py-3.5 border border-[#171714] transition-colors"
            >
              Return to The Deniq Edit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left: Shipping & Billing Form */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-[10px] tracking-[0.25em] uppercase font-semibold text-[#681F2C]">
                  Direct Atelier Checkout
                </span>
                <h3 className="font-serif text-3xl text-[#171714] mt-1">
                  Delivery Details
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#56554F]">
                      First Name
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Folake"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full bg-[#F4F1EB] border border-[#D8D4CC] px-3 py-2 text-xs focus:outline-none focus:border-[#171714]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#56554F]">
                      Last Name
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Adeleke"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full bg-[#F4F1EB] border border-[#D8D4CC] px-3 py-2 text-xs focus:outline-none focus:border-[#171714]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#56554F]">
                      Email Address
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="client@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#F4F1EB] border border-[#D8D4CC] px-3 py-2 text-xs focus:outline-none focus:border-[#171714]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#56554F]">
                      Telephone
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="+234 80 0000 0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#F4F1EB] border border-[#D8D4CC] px-3 py-2 text-xs focus:outline-none focus:border-[#171714]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#56554F]">
                    Street Address / Apartment
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. 14A Admiralty Way, Lekki Phase 1"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-[#F4F1EB] border border-[#D8D4CC] px-3 py-2 text-xs focus:outline-none focus:border-[#171714]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#56554F]">
                      City / Neighborhood
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Victoria Island"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-[#F4F1EB] border border-[#D8D4CC] px-3 py-2 text-xs focus:outline-none focus:border-[#171714]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#56554F]">
                      State
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full bg-[#F4F1EB] border border-[#D8D4CC] px-3 py-2 text-xs focus:outline-none focus:border-[#171714]"
                    >
                      <option value="Lagos">Lagos (Complimentary Courier)</option>
                      <option value="Abuja">Abuja FCT (₦4,500)</option>
                      <option value="Rivers">Rivers / Port Harcourt (₦4,500)</option>
                      <option value="Oyo">Oyo / Ibadan (₦4,500)</option>
                      <option value="Other">Other Nationwide (₦4,500)</option>
                    </select>
                  </div>
                </div>

                {/* Payment Selection */}
                <div className="pt-2 space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#56554F] block">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className={`p-3 border text-xs cursor-pointer flex items-center space-x-2.5 ${
                        formData.paymentMethod === 'paystack'
                          ? 'border-[#171714] bg-[#F4F1EB]'
                          : 'border-[#D8D4CC] bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={formData.paymentMethod === 'paystack'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'paystack' })}
                        className="text-[#681F2C]"
                      />
                      <span className="font-semibold text-[#171714]">Paystack / Card</span>
                    </label>

                    <label
                      className={`p-3 border text-xs cursor-pointer flex items-center space-x-2.5 ${
                        formData.paymentMethod === 'showroom'
                          ? 'border-[#171714] bg-[#F4F1EB]'
                          : 'border-[#D8D4CC] bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={formData.paymentMethod === 'showroom'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'showroom' })}
                        className="text-[#681F2C]"
                      />
                      <span className="font-semibold text-[#171714]">Showroom Fitting / POS</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-[#171714] hover:bg-[#681F2C] text-[#FAF9F6] text-xs font-semibold tracking-[0.2em] uppercase py-4 border border-[#171714] transition-colors cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>
                      {isProcessing ? 'Processing Order...' : `Place Order — ${formatPrice(total)}`}
                    </span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-5 bg-[#F4F1EB] border border-[#D8D4CC] p-6 flex flex-col justify-between space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-[#56554F] block border-b border-[#D8D4CC] pb-3 mb-4">
                  Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} items)
                </span>

                <div className="divide-y divide-[#D8D4CC] max-h-[300px] overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="py-3 flex space-x-3 text-xs">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-16 object-cover border border-[#D8D4CC] flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-sm text-[#171714] truncate">{item.name}</p>
                        <p className="text-[#56554F]">{item.selectedColor} · Size {item.selectedSize}</p>
                        <p className="text-[#171714] font-medium mt-1">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-sans font-semibold text-[#171714]">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="border-t border-[#D8D4CC] pt-4 space-y-2 text-xs uppercase tracking-wider">
                <div className="flex justify-between text-[#56554F]">
                  <span>Subtotal</span>
                  <span className="text-[#171714] font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#56554F]">
                  <span>Courier Dispatch</span>
                  <span className="text-[#171714] font-medium">
                    {deliveryFee === 0 ? 'Complimentary' : formatPrice(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#171714] pt-2 border-t border-[#D8D4CC]">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
