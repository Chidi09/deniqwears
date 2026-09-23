import type { Metadata } from 'next';
import { db } from '@/server/db';
import { getAppUrl } from '@/server/config';
import { serializeJsonLd } from '@/src/lib/json-ld';

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.getProductBySlug(slug);

  if (!product || product.status !== 'live') {
    return { title: 'Garment Unavailable', robots: { index: false, follow: false } };
  }

  return {
    title: product.name,
    description: product.editorialSubtitle || product.description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: 'website',
      url: `/product/${product.slug}`,
      title: product.name,
      description: product.editorialSubtitle || product.description,
      images: [{ url: product.primaryImage, alt: product.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.editorialSubtitle || product.description,
      images: [product.primaryImage],
    },
  };
}

export default async function ProductLayout({ children, params }: Props) {
  const { slug } = await params;
  const product = await db.getProductBySlug(slug);

  if (!product || product.status !== 'live') return children;

  const inStock = product.variants?.some((variant) => variant.active && variant.stock > 0) ?? false;
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: [product.primaryImage, ...product.galleryImages],
    sku: product.slug,
    brand: { '@type': 'Brand', name: 'Deniqwears' },
    offers: {
      '@type': 'Offer',
      url: `${getAppUrl()}/product/${product.slug}`,
      priceCurrency: 'USD',
      price: (product.priceInKobo / 100).toFixed(2),
      availability: `https://schema.org/${inStock ? 'InStock' : 'OutOfStock'}`,
      itemCondition: 'https://schema.org/NewCondition',
    },
    ...(product.reviewsCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviewsCount,
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(productJsonLd) }}
      />
      {children}
    </>
  );
}
