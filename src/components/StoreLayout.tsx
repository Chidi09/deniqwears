'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useStore } from '../context/StoreContext';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ActivePage } from '../types';

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
  } = useStore();

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
  } else if (pathname === '/lookbook') {
    activePage = { type: 'lookbook' };
  } else if (pathname === '/about') {
    activePage = { type: 'about' };
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F1EB] text-[#171714]">
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        cartCount={totalCartCount}
        onOpenCart={() => setCartOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAccount={() => setAccountOpen(true)}
      />
      <main className="flex-grow">{children}</main>
      <Footer
        onNavigate={handleNavigate}
        onNavigateCategory={handleCategoryNavigate}
        onOpenSizeGuide={() => setSizeGuideOpen(true)}
      />
    </div>
  );
}
