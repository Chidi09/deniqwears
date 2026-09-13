'use client';

import React from 'react';
import { useStore } from '../context/StoreContext';
import { EditorialHero } from '../components/EditorialHero';
import { CollectionIntro } from '../components/CollectionIntro';
import { AsymmetricShowcase } from '../components/AsymmetricShowcase';
import { ProductGrid } from '../components/ProductGrid';
import { EditorialBreak } from '../components/EditorialBreak';
import { CategoryShowcase } from '../components/CategoryShowcase';
import { HorizontalSelection } from '../components/HorizontalSelection';
import { LookbookSection } from '../components/LookbookSection';
import { BrandStatement } from '../components/BrandStatement';
import { CommunitySection } from '../components/CommunitySection';
import { NewsletterSection } from '../components/NewsletterSection';

export default function HomePage() {
  const {
    productsList,
    handleNavigate,
    handleSelectProduct,
    handleCategoryNavigate,
    setQuickAddProduct,
    setSelectedLook,
  } = useStore();

  return (
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
  );
}
