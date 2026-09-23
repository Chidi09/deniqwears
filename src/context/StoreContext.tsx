'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ActivePage, CartItem, Category, LookbookItem, Product } from '../types';
import { useCartStore, useUIStore } from '../store/useStore';
import { useProductsQuery, useStoreSettingsQuery } from '../hooks/queries';
import { CartDrawer } from '../components/CartDrawer';
import { SearchOverlay } from '../components/SearchOverlay';
import { SizeGuideModal } from '../components/SizeGuideModal';
import { LookbookModal } from '../components/LookbookModal';
import { QuickAddModal } from '../components/QuickAddModal';
import { AccountDrawer } from '../components/AccountDrawer';

interface StoreContextType {
  productsList: Product[];
  productsLoading: boolean;
  productsError: boolean;
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

  // The live catalog, with its real loading/error state exposed rather than
  // papered over with demo fixtures.
  const { data: serverProducts, isLoading: productsLoading, isError: productsError } = useProductsQuery();
  const productsList = serverProducts ?? [];
  const { data: storeSettings } = useStoreSettingsQuery();

  // Cart lines are persisted to localStorage and can sit there for days, so
  // their cached prices drift after an admin price change. Reconcile against
  // the live catalog for display; the server still recalculates at checkout,
  // but the customer should never be shown a total we won't charge.
  const reconciledCartItems = useMemo(() => {
    if (productsList.length === 0) return cartItems;
    return cartItems.map((item) => {
      const product = productsList.find((p) => p.id === item.productId);
      if (!product) return item;
      const variant = product.variants?.find((v) => v.id === item.variantId);
      const currentPrice = variant?.priceInKobo ?? product.priceInKobo;
      return currentPrice === item.priceInKobo ? item : { ...item, priceInKobo: currentPrice };
    });
  }, [cartItems, productsList]);

  // Hydration safety check: the cart is persisted to localStorage (see
  // useStore.ts), so the server-rendered markup can never know its contents —
  // `mounted` starts false to match that SSR output, then flips true once the
  // client has taken over, so we intentionally render an extra time to avoid
  // a hydration mismatch. There is no way to know "we've hydrated" except via
  // an effect, which is exactly what this is for.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see comment above
    setMounted(true);
  }, []);

  const handleNavigate = (page: ActivePage) => {
    if (page.type === 'home') {
      router.push('/');
    } else if (page.type === 'shop') {
      if (page.newOnly) {
        router.push('/shop?new=1');
      } else if (page.category && page.category !== 'all') {
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

  // After adding, slide the bag open so the next step (checkout) is obvious.
  // The short delay lets the "Added ✓" confirmation register first; quick add
  // waits for its modal to close so the two don't stack.
  const addAndShowBag = (delayMs: number) => (product: Product, color: string, size: string) => {
    addItem(product, color, size);
    window.setTimeout(() => setCartOpen(true), delayMs);
  };

  // Zero before hydration, matching the server-rendered markup. This used to
  // be 1, which briefly showed a phantom item in the bag on every page load.
  const totalCartCount = mounted ? totalCount() : 0;
  const activeCartItems = mounted ? reconciledCartItems : [];

  return (
    <StoreContext.Provider
      value={{
        productsList,
        productsLoading,
        productsError,
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
        handleAddToCart: addAndShowBag(700),
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
        onSelectCategory={(category) => handleCategoryNavigate(category as Category)}
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
        onAddToCart={addAndShowBag(1250)}
        onViewProductDetails={handleSelectProduct}
      />

      <AccountDrawer
        isOpen={accountOpen}
        onClose={() => setAccountOpen(false)}
        supportEmail={storeSettings?.supportEmail}
        supportWhatsApp={storeSettings?.supportWhatsApp}
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
