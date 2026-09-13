'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ActivePage, CartItem, Category, LookbookItem, Product } from '../types';
import { PRODUCTS } from '../data/products';
import { useCartStore, useUIStore } from '../store/useStore';
import { useProductsQuery } from '../hooks/queries';
import { CartDrawer } from '../components/CartDrawer';
import { SearchOverlay } from '../components/SearchOverlay';
import { SizeGuideModal } from '../components/SizeGuideModal';
import { LookbookModal } from '../components/LookbookModal';
import { QuickAddModal } from '../components/QuickAddModal';
import { AccountDrawer } from '../components/AccountDrawer';

interface StoreContextType {
  productsList: Product[];
  cartItems: CartItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  accountOpen: boolean;
  setAccountOpen: (open: boolean) => void;
  sizeGuideOpen: boolean;
  setSizeGuideOpen: (open: boolean) => void;
  selectedLook: LookbookItem | null;
  setSelectedLook: (look: LookbookItem | null) => void;
  quickAddProduct: Product | null;
  setQuickAddProduct: (product: Product | null) => void;
  totalCartCount: number;
  handleNavigate: (page: ActivePage) => void;
  handleSelectProduct: (slug: string) => void;
  handleCategoryNavigate: (cat: Category) => void;
  handleAddToCart: (product: Product, color: string, size: string) => void;
  handleUpdateCartQuantity: (id: string, delta: number) => void;
  handleRemoveCartItem: (id: string) => void;
  handleClearCart: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Zustand Stores
  const {
    cartItems,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    totalCount,
  } = useCartStore();

  const {
    cartOpen,
    setCartOpen,
    searchOpen,
    setSearchOpen,
    accountOpen,
    setAccountOpen,
    sizeGuideOpen,
    setSizeGuideOpen,
    selectedLook,
    setSelectedLook,
    quickAddProduct,
    setQuickAddProduct,
  } = useUIStore();

  // TanStack Query for catalog
  const { data: serverProducts } = useProductsQuery();
  const productsList = serverProducts && serverProducts.length > 0 ? serverProducts : PRODUCTS;

  // Hydration safety check
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavigate = (page: ActivePage) => {
    if (page.type === 'home') {
      router.push('/');
    } else if (page.type === 'shop') {
      if (page.category && page.category !== 'all') {
        router.push(`/shop?category=${page.category}`);
      } else {
        router.push('/shop');
      }
    } else if (page.type === 'product') {
      router.push(`/product/${page.slug}`);
    } else if (page.type === 'lookbook') {
      router.push('/lookbook');
    } else if (page.type === 'about') {
      router.push('/about');
    } else if (page.type === 'checkout') {
      router.push('/checkout');
    } else if (page.type === 'admin') {
      router.push('/admin');
    } else if (page.type === 'account') {
      setAccountOpen(true);
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectProduct = (slug: string) => {
    router.push(`/product/${slug}`);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCategoryNavigate = (cat: Category) => {
    if (cat && cat !== 'all') {
      router.push(`/shop?category=${cat}`);
    } else {
      router.push('/shop');
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const totalCartCount = mounted ? totalCount() : 1;
  const activeCartItems = mounted ? cartItems : [];

  return (
    <StoreContext.Provider
      value={{
        productsList,
        cartItems: activeCartItems,
        cartOpen,
        setCartOpen,
        searchOpen,
        setSearchOpen,
        accountOpen,
        setAccountOpen,
        sizeGuideOpen,
        setSizeGuideOpen,
        selectedLook,
        setSelectedLook,
        quickAddProduct,
        setQuickAddProduct,
        totalCartCount,
        handleNavigate,
        handleSelectProduct,
        handleCategoryNavigate,
        handleAddToCart: addItem,
        handleUpdateCartQuantity: updateQuantity,
        handleRemoveCartItem: removeItem,
        handleClearCart: clearCart,
      }}
    >
      {children}

      {/* Global Modals & Drawers */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={activeCartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onProceedToCheckout={() => {
          setCartOpen(false);
          router.push('/checkout');
        }}
      />

      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        products={productsList}
        onSelectProduct={handleSelectProduct}
        onSelectCategory={handleCategoryNavigate}
      />

      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
      />

      <LookbookModal
        look={selectedLook}
        onClose={() => setSelectedLook(null)}
        products={productsList}
        onSelectProduct={handleSelectProduct}
        onQuickAdd={(p) => setQuickAddProduct(p)}
      />

      <QuickAddModal
        product={quickAddProduct}
        onClose={() => setQuickAddProduct(null)}
        onAddToCart={addItem}
        onViewProductDetails={handleSelectProduct}
      />

      <AccountDrawer
        isOpen={accountOpen}
        onClose={() => setAccountOpen(false)}
        products={productsList}
        onSelectProduct={handleSelectProduct}
        onQuickAdd={(p) => setQuickAddProduct(p)}
      />
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
