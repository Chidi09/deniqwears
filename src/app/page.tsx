'use client';

import React from 'react';
import { useStore } from '../context/StoreContext';
import { useStoreSettingsQuery } from '../hooks/queries';
import { DEFAULT_PROMOTIONS } from '../lib/promotions';
import { EditorialHero } from '../components/EditorialHero';
import { TrustStrip } from '../components/TrustStrip';
import { CategoryShowcase } from '../components/CategoryShowcase';
import { ProductGrid } from '../components/ProductGrid';
import { PromoBanner } from '../components/PromoBanner';
import { AsymmetricShowcase } from '../components/AsymmetricShowcase';
import { EditorialBreak } from '../components/EditorialBreak';
import { HorizontalSelection } from '../components/HorizontalSelection';
import { NewsletterSection } from '../components/NewsletterSection';

export default function HomePage() {
  const {
    productsList,
    handleNavigate,
    handleSelectProduct,
    handleCategoryNavigate,
    setQuickAddProduct,
    setSizeGuideOpen,
  } = useStore();
  const { data: settings } = useStoreSettingsQuery();
  const promotions = settings?.promotions ?? DEFAULT_PROMOTIONS;

  // Show new arrivals first; fall back to the catalog if none are flagged yet.
  const newArrivals = productsList.filter((p) => p.isNewArrival);
  const featured = (newArrivals.length > 0 ? newArrivals : productsList).slice(0, 8);

  // Ordered so a shopper can act within the first scroll: see the brand,
  // get reassured, pick a category or a new piece — the editorial storytelling
  // follows for those who keep browsing.
  return (
    <>
      <EditorialHero onNavigate={handleNavigate} onExploreProduct={handleSelectProduct} />

      <TrustStrip
        returnPeriodDays={settings?.returnPeriodDays ?? 5}
        onOpenSizeGuide={() => setSizeGuideOpen(true)}
      />

      <CategoryShowcase products={productsList} onNavigateCategory={handleCategoryNavigate} />

      <ProductGrid
        products={featured}
        eyebrow="Just arrived"
        title="New In"
        subtitle="Every design available in sizes 10 to 20"
        onViewAll={() => handleNavigate({ type: 'shop', newOnly: true })}
        onSelectProduct={handleSelectProduct}
        onQuickAdd={(p) => setQuickAddProduct(p)}
      />

      <PromoBanner banner={promotions.banner} onNavigate={handleNavigate} />

      <AsymmetricShowcase
        products={productsList}
        onSelectProduct={handleSelectProduct}
        onQuickAdd={(p) => setQuickAddProduct(p)}
      />

      <EditorialBreak />

      <HorizontalSelection
        products={productsList}
        onSelectProduct={handleSelectProduct}
        onQuickAdd={(p) => setQuickAddProduct(p)}
      />

      <NewsletterSection />
    </>
  );
}
