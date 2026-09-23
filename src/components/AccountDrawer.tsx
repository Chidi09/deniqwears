import React from 'react';
import { useDialog } from '../hooks/useDialog';
import { X, Mail, MessageCircle, ShoppingBag } from 'lucide-react';

interface AccountDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  supportEmail?: string;
  supportWhatsApp?: string;
}

/**
 * There is no customer authentication in this application: checkout is guest
 * only, and no account, credential or order-ownership model exists.
 *
 * This drawer previously rendered a hardcoded signed-in customer
 * ("client@deniqwears.com"), a fabricated delivered order, invented saved
 * addresses, and a "wishlist" that was just the first few catalog products.
 * None of it was real, and the order history in particular implied we were
 * showing someone their own purchase data. It now states the actual position
 * and points at the concierge, which is the channel that genuinely works.
 */
export const AccountDrawer: React.FC<AccountDrawerProps> = ({
  isOpen,
  onClose,
  supportEmail = '',
  supportWhatsApp = '',
}) => {
  const dialogRef = useDialog<HTMLDivElement>(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#171714]/40 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Client care"
          tabIndex={-1}
          className="w-screen max-w-md bg-[#FAF9F6] border-l border-[#D8D4CC] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        >
          <div className="p-6 border-b border-[#D8D4CC] flex items-center justify-between">
            <div>
              <span className="text-[11px] tracking-[0.25em] uppercase font-semibold text-[#681F2C]">
                Client Care
              </span>
              <h3 className="font-serif text-2xl text-[#171714] mt-0.5">Your Orders</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-[#171714] hover:text-[#681F2C] cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-start space-x-3 p-4 bg-[#F4F1EB] border border-[#D8D4CC]">
              <ShoppingBag className="w-4 h-4 text-[#681F2C] mt-0.5 flex-shrink-0" />
              <div className="text-xs text-[#56554F] leading-relaxed">
                <p className="font-semibold text-[#171714] mb-1">Checkout is guest-only for now</p>
                <p>
                  You don’t need an account to order. Your confirmation email carries your order
                  number and receipt — keep it, and quote that number for anything you need.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[11px] uppercase tracking-[0.22em] font-semibold text-[#8A8780]">
                Track, change or return an order
              </span>

              <a
                href={`mailto:${supportEmail}`}
                className="flex items-center space-x-3 p-4 border border-[#D8D4CC] bg-white hover:border-[#171714] transition-colors"
              >
                <Mail className="w-4 h-4 text-[#681F2C]" />
                <div className="text-xs">
                  <p className="font-semibold text-[#171714]">Email us</p>
                  <p className="text-[#56554F]">{supportEmail}</p>
                </div>
              </a>

              <a
                href={`https://wa.me/${supportWhatsApp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-4 border border-[#D8D4CC] bg-white hover:border-[#171714] transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#681F2C]" />
                <div className="text-xs">
                  <p className="font-semibold text-[#171714]">WhatsApp us</p>
                  <p className="text-[#56554F]">{supportWhatsApp}</p>
                </div>
              </a>
            </div>
          </div>

          <div className="p-6 border-t border-[#D8D4CC]">
            <button
              onClick={onClose}
              className="w-full bg-[#171714] hover:bg-[#681F2C] text-[#FAF9F6] text-xs font-semibold tracking-[0.16em] uppercase py-3.5 transition-colors cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
