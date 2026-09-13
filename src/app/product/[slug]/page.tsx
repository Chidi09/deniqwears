'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../../context/StoreContext';
import { ProductDetailPage as PDPComponent } from '../../../components/ProductDetailPage';
import { PRODUCTS } from '../../../data/products';
import { ArrowLeft } from 'lucide-react';

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { productsList, handleAddToCart, setSizeGuideOpen } = useStore();

  const product =
    productsList.find((p) => p.slug === resolvedParams.slug) ||
    PRODUCTS.find((p) => p.slug === resolvedParams.slug);

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center bg-[#F4F1EB]">
        <span className="text-xs uppercase tracking-[0.3em] text-[#681F2C] font-semibold mb-3">
          Garment Not Found
        </span>
        <h1 className="font-serif text-3xl md:text-5xl text-[#171714] mb-6">
          Silhouette Unavailable
        </h1>
        <p className="text-[#56554F] text-sm max-w-md mb-8">
          The garment you are looking for may have been archived or returned to the atelier vault.
        </p>
        <button
          onClick={() => router.push('/shop')}
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest bg-[#171714] text-[#FAF9F6] px-6 py-3.5 hover:bg-[#681F2C] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Collection</span>
        </button>
      </div>
    );
  }

  return (
    <PDPComponent
      product={product}
      onBack={() => router.push('/shop')}
      onAddToCart={handleAddToCart}
      onOpenSizeGuide={() => setSizeGuideOpen(true)}
    />
  );
}
