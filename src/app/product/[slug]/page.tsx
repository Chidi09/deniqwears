'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../../context/StoreContext';
import { useProductQuery } from '../../../hooks/queries';
import { ProductDetailPage as PDPComponent } from '../../../components/ProductDetailPage';
import { ArrowLeft } from 'lucide-react';

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { handleAddToCart, setSizeGuideOpen } = useStore();

  // Resolve the slug against the authoritative single-product API rather than
  // scanning a cached list and falling back to demo fixtures — that fallback
  // resurrected archived/fixture products on URLs that should 404.
  const { data: product, isLoading, isError } = useProductQuery(resolvedParams.slug);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F4F1EB] text-xs uppercase tracking-[0.25em] text-[#56554F]">
        Loading garment…
      </div>
    );
  }

  if (isError) {
    return (
      <StatusPanel
        eyebrow="Connection Issue"
        title="We couldn’t load this garment"
        body="Something went wrong reaching the atelier. Please try again in a moment."
        actionLabel="Retry"
        onAction={() => window.location.reload()}
      />
    );
  }

  if (!product) {
    return (
      <StatusPanel
        eyebrow="Garment Not Found"
        title="Silhouette Unavailable"
        body="The garment you are looking for may have been archived or returned to the atelier vault."
        actionLabel="Return to Collection"
        onAction={() => router.push('/shop')}
      />
    );
  }

  return (
    <PDPComponent
      // Keyed by product so local colour/size selections reset when a
      // different garment is shown through the same page instance.
      key={product.id}
      product={product}
      onBack={() => router.push('/shop')}
      onAddToCart={handleAddToCart}
      onOpenSizeGuide={() => setSizeGuideOpen(true)}
    />
  );
}

function StatusPanel({
  eyebrow,
  title,
  body,
  actionLabel,
  onAction,
}: {
  eyebrow: string;
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center bg-[#F4F1EB]">
      <span className="text-xs uppercase tracking-[0.3em] text-[#681F2C] font-semibold mb-3">
        {eyebrow}
      </span>
      <h1 className="font-serif text-3xl md:text-5xl text-[#171714] mb-6">{title}</h1>
      <p className="text-[#56554F] text-sm max-w-md mb-8">{body}</p>
      <button
        onClick={onAction}
        className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest bg-[#171714] text-[#FAF9F6] px-6 py-3.5 hover:bg-[#681F2C] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{actionLabel}</span>
      </button>
    </div>
  );
}
