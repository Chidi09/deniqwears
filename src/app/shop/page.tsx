'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStore } from '../../context/StoreContext';
import { ShopPage as ShopComponent } from '../../components/ShopPage';
import { Category } from '../../types';

function ShopContent() {
  const { productsList, handleSelectProduct, setQuickAddProduct } = useStore();
  const searchParams = useSearchParams();
  const categoryParam = (searchParams.get('category') as Category) || 'all';

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
