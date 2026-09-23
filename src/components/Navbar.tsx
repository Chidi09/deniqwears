import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, User, Menu, X, ChevronRight, ChevronLeft, Ruler } from 'lucide-react';
import { ActivePage, Category } from '../types';
import { AdirePattern } from './Adire';

interface NavbarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  cartCount: number;
  announcements: string[];
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onOpenAccount: () => void;
  onOpenSizeGuide: () => void;
  /** Categories that currently have products; empty ones are hidden from the menu. */
  availableCategories?: Category[];
}

interface NavLink {
  label: string;
  page: ActivePage;
}

// Categories aren't repeated here: the shop page has its own category
// buttons, the homepage has category tiles, and the phone menu lists them.
const SHOP_LINKS: NavLink[] = [
  { label: 'New In', page: { type: 'shop', newOnly: true } },
  { label: 'Shop', page: { type: 'shop', category: 'all' } },
];

const MOBILE_CATEGORIES: { label: string; category: Category }[] = [
  { label: 'Dresses', category: 'dresses' },
  { label: 'Sets', category: 'sets' },
  { label: 'Tops', category: 'tops' },
  { label: 'Bottoms', category: 'bottoms' },
  { label: 'Occasion', category: 'occasion' },
];

const ROTATE_EVERY_MS = 4500;

const AnnouncementBar: React.FC<{ messages: string[] }> = ({ messages }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = messages.length;

  useEffect(() => {
    if (count < 2 || paused) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), ROTATE_EVERY_MS);
    return () => window.clearInterval(timer);
  }, [count, paused]);

  if (count === 0) return null;
  const current = messages[index % count];

  return (
    <div
      id="announcement-bar"
      className="relative w-full bg-[#1E2656] text-[#FAF9F6] text-xs tracking-[0.16em] uppercase font-medium overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AdirePattern motif="dots" size={24} className="absolute inset-0 text-[#FAF9F6] opacity-[0.07]" />
      <div className="relative max-w-[1344px] mx-auto px-4 h-9 flex items-center justify-between gap-3">
        {count > 1 ? (
          <button
            onClick={() => setIndex((i) => (i - 1 + count) % count)}
            className="p-1 text-[#FAF9F6]/60 hover:text-[#FAF9F6] transition-colors"
            aria-label="Previous message"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="w-5" />
        )}
        <p key={index} className="animate-announce text-center truncate" aria-live="polite">
          {current}
        </p>
        {count > 1 ? (
          <button
            onClick={() => setIndex((i) => (i + 1) % count)}
            className="p-1 text-[#FAF9F6]/60 hover:text-[#FAF9F6] transition-colors"
            aria-label="Next message"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="w-5" />
        )}
      </div>
    </div>
  );
};

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  onNavigate,
  cartCount,
  announcements,
  onOpenCart,
  onOpenSearch,
  onOpenAccount,
  onOpenSizeGuide,
  availableCategories,
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

  // Lock page scroll behind the mobile menu and let Escape close it.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileMenuOpen]);

  const go = (page: ActivePage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const isActive = (label: string) =>
    (label === 'Shop' && activePage.type === 'shop') ||
    (label === 'About' && activePage.type === 'about');

  const desktopLinkClass = (label: string) =>
    `editorial-link transition-colors hover:text-[#681F2C] py-1 cursor-pointer ${
      isActive(label) ? 'text-[#681F2C] after:!w-full' : 'text-[#171714]'
    }`;

  return (
    <>
      <AnnouncementBar messages={announcements} />

      {/* Main Header */}
      <header
        id="main-navigation"
        className={`sticky top-0 z-40 w-full transition-all duration-300 bg-[#F4F1EB]/95 backdrop-blur-md border-b border-[#D8D4CC] ${
          isScrolled ? 'h-[60px] shadow-[0_1px_12px_rgba(23,23,20,0.06)]' : 'h-[72px] md:h-[84px]'
        }`}
      >
        <div className="max-w-[1344px] mx-auto h-full px-5 md:px-12 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Left: Desktop Navigation */}
          <nav
            aria-label="Main"
            className="hidden md:flex items-center gap-6 lg:gap-7 text-[13px] tracking-[0.14em] uppercase font-medium"
          >
            {SHOP_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => onNavigate(link.page)}
                className={desktopLinkClass(link.label)}
              >
                {link.label}
              </button>
            ))}
            <button onClick={() => onNavigate({ type: 'about' })} className={desktopLinkClass('About')}>
              About
            </button>
          </nav>

          {/* Mobile Hamburger */}
          <div className="flex md:hidden items-center">
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-[#171714]"
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Center: Wordmark */}
          <button
            id="brand-logo"
            onClick={() => onNavigate({ type: 'home' })}
            className="group flex flex-col items-center cursor-pointer"
            aria-label="Deniqwears home"
          >
            <span
              className={`font-serif tracking-[0.04em] text-[#171714] transition-all duration-300 leading-none ${
                isScrolled ? 'text-[28px] md:text-[32px]' : 'text-[32px] md:text-[40px]'
              }`}
            >
              DENIQ
            </span>
            <span className="text-[11px] tracking-[0.42em] uppercase font-sans font-medium text-[#56554F] group-hover:text-[#681F2C] transition-colors pl-[0.42em]">
              wears
            </span>
          </button>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-4 md:gap-6 text-[#171714]">
            <button
              id="nav-search-button"
              onClick={onOpenSearch}
              className="flex items-center gap-1.5 hover:text-[#681F2C] transition-colors p-1 cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-5 h-5 stroke-[1.6]" />
              <span className="hidden lg:inline text-xs uppercase tracking-[0.14em] font-medium">Search</span>
            </button>

            <button
              id="nav-account-button"
              onClick={onOpenAccount}
              className="hidden sm:flex items-center gap-1.5 hover:text-[#681F2C] transition-colors p-1 cursor-pointer"
              aria-label="My account"
            >
              <User className="w-5 h-5 stroke-[1.6]" />
              <span className="hidden lg:inline text-xs uppercase tracking-[0.14em] font-medium">Account</span>
            </button>

            <button
              id="nav-bag-button"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 hover:text-[#681F2C] transition-colors p-1 cursor-pointer"
              aria-label={`Shopping bag, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.6]" />
              <span className="hidden lg:inline text-xs uppercase tracking-[0.14em] font-semibold">Bag</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1.5 lg:static min-w-[18px] h-[18px] px-1 rounded-full bg-[#681F2C] text-[#FAF9F6] text-xs font-semibold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu: slide-in panel */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div
            className="absolute inset-0 bg-[#171714]/40 backdrop-blur-xs animate-fade"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            id="mobile-drawer"
            className="absolute inset-y-0 left-0 w-[88%] max-w-[380px] bg-[#FAF9F6] flex flex-col shadow-2xl animate-drawer-left"
          >
            <div className="flex items-center justify-between px-5 h-16 border-b border-[#D8D4CC]">
              <span className="font-serif text-2xl tracking-[0.04em]">DENIQ</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 -mr-2 text-[#171714]"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8">
              {/* Primary shortcuts */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => go({ type: 'shop', newOnly: true })}
                  className="py-4 bg-[#171714] text-[#FAF9F6] text-sm uppercase tracking-[0.14em] font-semibold"
                >
                  New In
                </button>
                <button
                  onClick={() => go({ type: 'shop', category: 'all' })}
                  className="py-4 border border-[#171714] text-[#171714] text-sm uppercase tracking-[0.14em] font-semibold"
                >
                  Shop All
                </button>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[#681F2C] mb-2">
                  Shop by category
                </p>
                <ul className="divide-y divide-[#D8D4CC] border-y border-[#D8D4CC]">
                  {MOBILE_CATEGORIES.filter(
                    (item) => !availableCategories || availableCategories.includes(item.category)
                  ).map((item) => (
                    <li key={item.category}>
                      <button
                        onClick={() => go({ type: 'shop', category: item.category })}
                        className="w-full flex items-center justify-between py-4 font-serif text-2xl text-[#171714] hover:text-[#681F2C]"
                      >
                        <span>{item.label}</span>
                        <ChevronRight className="w-5 h-5 text-[#8A8780]" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[#681F2C] mb-2">Discover</p>
                <ul className="space-y-1 text-base text-[#171714]">
                  <li>
                    <button onClick={() => go({ type: 'about' })} className="py-2.5 hover:text-[#681F2C]">
                      About Deniqwears
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        onOpenSizeGuide();
                        setMobileMenuOpen(false);
                      }}
                      className="py-2.5 flex items-center gap-2 hover:text-[#681F2C]"
                    >
                      <Ruler className="w-4 h-4" />
                      Size Chart
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-[#D8D4CC]">
              <button
                onClick={() => {
                  onOpenAccount();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between py-2 text-sm uppercase tracking-wider text-[#171714]"
              >
                <span>My Account & Saved</span>
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
