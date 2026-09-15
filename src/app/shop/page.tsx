'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStore } from '../../context/StoreContext';
import { ShopPage as ShopComponent } from '../../components/ShopPage';
import { Category } from '../../types';

const VALID_CATEGORIES: Category[] = ['all', 'dresses', 'sets', 'tops', 'bottoms', 'occasion'];

function isCategory(value: string | null): value is Category {
  return !!value && (VALID_CATEGORIES as string[]).includes(value);
}

function ShopContent() {
  const { productsList, handleSelectProduct, setQuickAddProduct } = useStore();
  const searchParams = useSearchParams();
  // Validate rather than cast: `?category=anything` was trusted straight into
  // a Record lookup, so a malformed URL crashed the whole shop page.
  const rawCategory = searchParams.get('category');
  const categoryParam: Category = isCategory(rawCategory) ? rawCategory : 'all';

  return (
    <ShopComponent
      key={categoryParam}
      products={productsList}
      initialCategory={categoryParam}
      onSelectProduct={handleSelectProduct}
      onQuickAdd={(p) => setQuickAddProduct(p)}
    />
  );
}

export default function Shop() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F1EB] py-20 text-center text-xs text-[#8A8780] uppercase tracking-widest">
          Loading catalog...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
