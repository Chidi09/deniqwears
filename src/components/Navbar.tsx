import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react';
import { ActivePage } from '../types';

interface NavbarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onOpenAccount: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  onNavigate,
  cartCount,
  onOpenCart,
  onOpenSearch,
  onOpenAccount,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Editorial Announcement Bar */}
      <div 
        id="announcement-bar"
        className="w-full bg-[#171714] text-[#FAF9F6] text-[11px] tracking-[0.18em] uppercase py-2 px-4 text-center font-medium border-b border-[#56554F]/20"
      >
        <span>Complimentary Delivery on Lagos Island · Private Showroom Appointments Available</span>
      </div>

      {/* Main Header */}
      <header
        id="main-navigation"
        className={`sticky top-0 z-40 w-full transition-all duration-300 bg-[#F4F1EB]/95 backdrop-blur-sm border-b border-[#D8D4CC] ${
          isScrolled ? 'h-[60px]' : 'h-[76px] md:h-[84px]'
        }`}
      >
        <div className="max-w-[1344px] mx-auto h-full px-5 md:px-12 flex items-center justify-between">
          {/* Left: Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-[13px] tracking-[0.14em] uppercase font-medium text-[#171714]">
            <button
              id="nav-shop"
              onClick={() => onNavigate({ type: 'shop', category: 'all' })}
              className="editorial-link transition-colors hover:text-[#681F2C] py-1 cursor-pointer"
            >
              Shop
            </button>
            <button
              id="nav-new"
              onClick={() => onNavigate({ type: 'shop', category: 'all' })}
              className="editorial-link transition-colors hover:text-[#681F2C] py-1 cursor-pointer"
            >
              New
            </button>
            <button
              id="nav-lookbook"
              onClick={() => onNavigate({ type: 'lookbook' })}
              className="editorial-link transition-colors hover:text-[#681F2C] py-1 cursor-pointer"
            >
              Lookbook
            </button>
            <button
              id="nav-about"
              onClick={() => onNavigate({ type: 'about' })}
              className="editorial-link transition-colors hover:text-[#681F2C] py-1 cursor-pointer text-[#56554F]"
            >
              About
            </button>
            <button
              id="nav-atelier"
              onClick={() => onNavigate({ type: 'admin' })}
              className="editorial-link transition-colors hover:text-[#681F2C] py-1 cursor-pointer text-[#8A8780] hover:text-[#171714]"
              title="Atelier Management"
            >
              Atelier
            </button>
          </nav>

          {/* Mobile Hamburger */}
          <div className="flex md:hidden items-center">
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-[#171714] focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Center: Distinctive Wordmark */}
          <div className="text-center">
            <button
              id="brand-logo"
              onClick={() => onNavigate({ type: 'home' })}
              className="group flex flex-col items-center cursor-pointer text-left focus:outline-none"
            >
              <span className={`font-serif tracking-tight text-[#171714] transition-all duration-300 leading-none ${
                isScrolled ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'
              }`}>
                DENIQ
              </span>
              <span className="text-[9px] tracking-[0.38em] uppercase font-sans font-semibold text-[#56554F] group-hover:text-[#681F2C] transition-colors -mt-0.5">
                wears
              </span>
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-5 md:space-x-7 text-[13px] tracking-[0.12em] font-medium text-[#171714]">
            <button
              id="nav-search-button"
              onClick={onOpenSearch}
              className="flex items-center space-x-1.5 hover:text-[#681F2C] transition-colors py-1 cursor-pointer"
              title="Search collection"
            >
              <Search className="w-4 h-4 stroke-[1.75]" />
              <span className="hidden lg:inline text-xs uppercase tracking-[0.14em]">Search</span>
            </button>

            <button
              id="nav-account-button"
              onClick={onOpenAccount}
              className="hidden sm:flex items-center space-x-1.5 hover:text-[#681F2C] transition-colors py-1 cursor-pointer"
              title="My Account"
            >
              <User className="w-4 h-4 stroke-[1.75]" />
              <span className="hidden lg:inline text-xs uppercase tracking-[0.14em]">Account</span>
            </button>

            <button
              id="nav-bag-button"
              onClick={onOpenCart}
              className="flex items-center space-x-2 text-[#171714] hover:text-[#681F2C] transition-colors py-1 cursor-pointer relative"
              title="View Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.75]" />
              <span className="text-xs uppercase tracking-[0.14em] font-semibold">
                BAG <span className="text-[#681F2C]">({cartCount})</span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div 
          id="mobile-drawer"
          className="fixed inset-0 top-[110px] z-50 bg-[#F4F1EB] border-t border-[#D8D4CC] p-6 flex flex-col justify-between md:hidden animate-in fade-in duration-200"
        >
          <div className="space-y-6 pt-2">
            <div className="text-[11px] tracking-[0.25em] text-[#681F2C] uppercase font-semibold">
              The Deniq Edit
            </div>
            <div className="flex flex-col space-y-4 text-2xl font-serif text-[#171714]">
              <button
                onClick={() => {
                  onNavigate({ type: 'home' });
                  setMobileMenuOpen(false);
                }}
                className="text-left hover:text-[#681F2C] transition-colors"
              >
                Homepage
              </button>
              <button
                onClick={() => {
                  onNavigate({ type: 'shop', category: 'all' });
                  setMobileMenuOpen(false);
                }}
                className="text-left hover:text-[#681F2C] transition-colors"
              >
                All Pieces
              </button>
              <button
                onClick={() => {
                  onNavigate({ type: 'shop', category: 'dresses' });
                  setMobileMenuOpen(false);
                }}
                className="text-left hover:text-[#681F2C] transition-colors text-xl font-sans font-light pl-3 text-[#56554F]"
              >
                — Dresses
              </button>
              <button
                onClick={() => {
                  onNavigate({ type: 'shop', category: 'sets' });
                  setMobileMenuOpen(false);
                }}
                className="text-left hover:text-[#681F2C] transition-colors text-xl font-sans font-light pl-3 text-[#56554F]"
              >
                — Sets
              </button>
              <button
                onClick={() => {
                  onNavigate({ type: 'shop', category: 'occasion' });
                  setMobileMenuOpen(false);
                }}
                className="text-left hover:text-[#681F2C] transition-colors text-xl font-sans font-light pl-3 text-[#56554F]"
              >
                — Occasion
              </button>
              <button
                onClick={() => {
                  onNavigate({ type: 'lookbook' });
                  setMobileMenuOpen(false);
                }}
                className="text-left hover:text-[#681F2C] transition-colors"
              >
                Worn Deniq (Lookbook)
              </button>
              <button
                onClick={() => {
                  onNavigate({ type: 'about' });
                  setMobileMenuOpen(false);
                }}
                className="text-left hover:text-[#681F2C] transition-colors"
              >
                About The Brand
              </button>
              <button
                onClick={() => {
                  onNavigate({ type: 'admin' });
                  setMobileMenuOpen(false);
                }}
                className="text-left text-base font-sans uppercase tracking-wider text-[#681F2C] font-semibold pt-2"
              >
                Atelier Back-Office →
              </button>
            </div>
          </div>

          <div className="pt-8 border-t border-[#D8D4CC] space-y-3">
            <button
              onClick={() => {
                onOpenAccount();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left text-sm uppercase tracking-wider flex items-center justify-between text-[#171714]"
            >
              <span>Account & Saved</span>
              <User className="w-4 h-4" />
            </button>
            <p className="text-xs text-[#56554F]">Lagos Showroom · Victoria Island</p>
          </div>
        </div>
      )}
    </>
  );
};
