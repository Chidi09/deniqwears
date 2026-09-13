import React, { useState, useEffect } from 'react';
import { ActivePage, CartItem, Category, LookbookItem, Product } from './types';
import { PRODUCTS, LOOKBOOK_ITEMS } from './data/products';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { EditorialHero } from './components/EditorialHero';
import { CollectionIntro } from './components/CollectionIntro';
import { AsymmetricShowcase } from './components/AsymmetricShowcase';
import { ProductGrid } from './components/ProductGrid';
import { EditorialBreak } from './components/EditorialBreak';
import { CategoryShowcase } from './components/CategoryShowcase';
import { HorizontalSelection } from './components/HorizontalSelection';
import { LookbookSection } from './components/LookbookSection';
import { BrandStatement } from './components/BrandStatement';
import { CommunitySection } from './components/CommunitySection';
import { NewsletterSection } from './components/NewsletterSection';
import { Footer } from './components/Footer';
import { ProductDetailPage } from './components/ProductDetailPage';
import { ShopPage } from './components/ShopPage';
import { LookbookPage } from './components/LookbookPage';
import { AboutPage } from './components/AboutPage';
import { CheckoutPage } from './components/CheckoutPage';
import { AdminLayout } from './components/Admin/AdminLayout';
import { CartDrawer } from './components/CartDrawer';
import { SearchOverlay } from './components/SearchOverlay';
import { SizeGuideModal } from './components/SizeGuideModal';
import { LookbookModal } from './components/LookbookModal';
import { QuickAddModal } from './components/QuickAddModal';
import { AccountDrawer } from './components/AccountDrawer';

export default function App() {
  // Navigation State
  const [activePage, setActivePage] = useState<ActivePage>({ type: 'home' });

  // Live products loaded from server with fallback to static catalog
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);

  // Modals & Drawers State
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [selectedLook, setSelectedLook] = useState<LookbookItem | null>(null);
  const [quickAddProduct, setQuickAddProduct] = useState<Product | null>(null);

  // Sync catalog from backend API if available
  useEffect(() => {
    api
      .getProducts()
      .then((serverProducts) => {
        if (serverProducts && serverProducts.length > 0) {
          setProductsList(serverProducts);
        }
      })
      .catch((err) => {
        // Fallback to static PRODUCTS
        console.warn('Using local catalogue cache:', err);
      });
  }, []);

  // Cart State (initialized with sample item for instant realism, persisted in localStorage)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('deniq_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Normalize prices to kobo
        return parsed.map((item: any) => ({
          ...item,
          priceInKobo: item.priceInKobo || (item.price ? item.price * 100 : 4800000),
          price: item.price || Math.round((item.priceInKobo || 4800000) / 100),
        }));
      }
    } catch (e) {
      // fallback
    }
    return [
      {
        id: 'init-cart-1',
        productId: 'prod-amara-dress',
        variantId: 'v-1-1',
        name: 'The Amara Dress',
        priceInKobo: 4800000,
        price: 48000,
        image:
          'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600&auto=format&fit=crop',
        selectedColor: 'Black',
        selectedSize: 'M',
        quantity: 1,
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('deniq_cart', JSON.stringify(cartItems));
    } catch (e) {
      // ignore
    }
  }, [cartItems]);

  const handleNavigate = (page: ActivePage) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (slug: string) => {
    handleNavigate({ type: 'product', slug });
  };

  const handleCategoryNavigate = (cat: Category) => {
    handleNavigate({ type: 'shop', category: cat });
  };

  const handleAddToCart = (product: Product, color: string, size: string) => {
    const matchedVariant = product.variants?.find(
      (v) => v.color.toLowerCase() === color.toLowerCase() && v.size === size
    );
    const variantId = matchedVariant ? matchedVariant.id : `${product.id}-${color}-${size}`;
    const priceInKobo = product.priceInKobo || (product as any).price * 100 || 4800000;

    setCartItems((prev) => {
      const existing = prev.find(
        (i) => i.productId === product.id && i.selectedColor === color && i.selectedSize === size
      );
      if (existing) {
        return prev.map((i) =>
          i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      const newItem: CartItem = {
        id: `${product.id}-${color}-${size}-${Date.now()}`,
        productId: product.id,
        variantId,
        name: product.name,
        priceInKobo,
        price: Math.round(priceInKobo / 100),
        image: product.primaryImage,
        selectedColor: color,
        selectedSize: size,
        quantity: 1,
      };
      return [...prev, newItem];
    });
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Selected Product for PDP
  const currentProduct =
    activePage.type === 'product'
      ? productsList.find((p) => p.slug === activePage.slug) || productsList[0]
      : null;

  // Render Admin View if requested
  if (activePage.type === 'admin') {
    return (
      <AdminLayout
        onExitToStore={() => handleNavigate({ type: 'home' })}
        initialSection={activePage.section || 'overview'}
      />
    );
  }

  // Render Checkout View if requested
  if (activePage.type === 'checkout') {
    return (
      <CheckoutPage
        items={cartItems}
        onBackToShopping={() => handleNavigate({ type: 'shop', category: 'all' })}
        onClearCart={handleClearCart}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F1EB] text-[#171714]">
      {/* Universal Navigation */}
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        cartCount={totalCartCount}
        onOpenCart={() => setCartOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAccount={() => setAccountOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        {/* VIEW 1: HOMEPAGE */}
        {activePage.type === 'home' && (
          <>
            {/* 1. Editorial Hero */}
            <EditorialHero
              onNavigate={handleNavigate}
              onExploreProduct={handleSelectProduct}
            />

            {/* 2. Collection Introduction */}
            <CollectionIntro onNavigate={handleNavigate} />

            {/* 3. Asymmetric Product Showcase */}
            <AsymmetricShowcase
              products={productsList}
              onSelectProduct={handleSelectProduct}
              onQuickAdd={(p) => setQuickAddProduct(p)}
            />

            {/* 4. Normal Product Grid (4 col desktop / 2 col mobile) */}
            <ProductGrid
              products={productsList.slice(0, 8)}
              title="Current Collection"
              subtitle="Defined silhouettes designed for lasting rotation"
              onSelectProduct={handleSelectProduct}
              onQuickAdd={(p) => setQuickAddProduct(p)}
            />

            {/* 5. Editorial Break ("She doesn't dress for the room. She changes it.") */}
            <EditorialBreak />

            {/* 6. Shop by Category */}
            <CategoryShowcase onNavigateCategory={handleCategoryNavigate} />

            {/* 7. Signature Horizontal Collection (The Deniq Selection) */}
            <HorizontalSelection
              products={productsList}
              onSelectProduct={handleSelectProduct}
              onQuickAdd={(p) => setQuickAddProduct(p)}
            />

            {/* 8. WORN DENIQ (Lookbook Masonry Grid) */}
            <LookbookSection
              onOpenLookModal={(look) => setSelectedLook(look)}
            />

            {/* 9. Brand Statement (Minimalist Lagos Manifesto) */}
            <BrandStatement />

            {/* 10. Community Archive (Seen in Deniq) */}
            <CommunitySection />

            {/* 11. Private Access Newsletter */}
            <NewsletterSection />
          </>
        )}

        {/* VIEW 2: PRODUCT DETAIL PAGE (PDP) */}
        {activePage.type === 'product' && currentProduct && (
          <ProductDetailPage
            product={currentProduct}
            onBack={() => handleNavigate({ type: 'shop', category: 'all' })}
            onAddToCart={handleAddToCart}
            onOpenSizeGuide={() => setSizeGuideOpen(true)}
          />
        )}

        {/* VIEW 3: CATALOG / SHOP PAGE */}
        {activePage.type === 'shop' && (
          <ShopPage
            products={productsList}
            initialCategory={activePage.category || 'all'}
            onSelectProduct={handleSelectProduct}
            onQuickAdd={(p) => setQuickAddProduct(p)}
          />
        )}

        {/* VIEW 4: LOOKBOOK (WORN DENIQ) */}
        {activePage.type === 'lookbook' && (
          <LookbookPage
            onNavigate={handleNavigate}
            onOpenLookModal={(look) => setSelectedLook(look)}
          />
        )}

        {/* VIEW 5: ABOUT BRAND */}
        {activePage.type === 'about' && (
          <AboutPage onNavigate={handleNavigate} />
        )}
      </main>

      {/* Editorial Footer */}
      <Footer
        onNavigate={handleNavigate}
        onNavigateCategory={handleCategoryNavigate}
        onOpenSizeGuide={() => setSizeGuideOpen(true)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setCartOpen(false);
          handleNavigate({ type: 'checkout' });
        }}
      />

      {/* Fullscreen Search Overlay */}
      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        products={productsList}
        onSelectProduct={handleSelectProduct}
        onSelectCategory={handleCategoryNavigate}
      />

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
      />

      {/* Lookbook "Shop the Look" Modal */}
      <LookbookModal
        look={selectedLook}
        onClose={() => setSelectedLook(null)}
        products={productsList}
        onSelectProduct={handleSelectProduct}
        onQuickAdd={(p) => setQuickAddProduct(p)}
      />

      {/* Quick Add Modal */}
      <QuickAddModal
        product={quickAddProduct}
        onClose={() => setQuickAddProduct(null)}
        onAddToCart={handleAddToCart}
        onViewProductDetails={handleSelectProduct}
      />

      {/* Account Drawer */}
      <AccountDrawer
        isOpen={accountOpen}
        onClose={() => setAccountOpen(false)}
        products={productsList}
        onSelectProduct={handleSelectProduct}
        onQuickAdd={(p) => setQuickAddProduct(p)}
      />
    </div>
  );
}
