'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useStore } from '../context/StoreContext';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { FloatingContact } from './FloatingContact';
import { ActivePage } from '../types';
import { useStoreSettingsQuery } from '../hooks/queries';
import { DEFAULT_PROMOTIONS } from '../lib/promotions';

export function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    totalCartCount,
    setCartOpen,
    setSearchOpen,
    setAccountOpen,
    setSizeGuideOpen,
    handleNavigate,
    handleCategoryNavigate,
    productsList,
  } = useStore();
  const availableCategories =
    productsList.length > 0 ? Array.from(new Set(productsList.map((p) => p.category))) : undefined;
  const { data: settings } = useStoreSettingsQuery();
  const announcements = (settings?.promotions ?? DEFAULT_PROMOTIONS).announcements;

  const isAdmin = pathname?.startsWith('/admin');
  const isCheckout = pathname?.startsWith('/checkout');

  if (isAdmin || isCheckout) {
    return <>{children}</>;
  }

  // Derive activePage for Navbar highlight
  let activePage: ActivePage = { type: 'home' };
  if (pathname === '/shop') {
    activePage = { type: 'shop' };
  } else if (pathname?.startsWith('/product/')) {
    activePage = { type: 'product', slug: pathname.replace('/product/', '') };
  } else if (pathname === '/about') {
    activePage = { type: 'about' };
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F1EB] text-[#171714]">
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        cartCount={totalCartCount}
        announcements={announcements}
        availableCategories={availableCategories}
        onOpenCart={() => setCartOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAccount={() => setAccountOpen(true)}
        onOpenSizeGuide={() => setSizeGuideOpen(true)}
      />
      <main className="flex-grow">{children}</main>
      <Footer
        onNavigate={handleNavigate}
        onNavigateCategory={handleCategoryNavigate}
        onOpenSizeGuide={() => setSizeGuideOpen(true)}
      />
      <FloatingContact
        whatsApp={settings?.supportWhatsApp}
        email={settings?.supportEmail}
        raised={activePage.type === 'product'}
      />
    </div>
  );
}
