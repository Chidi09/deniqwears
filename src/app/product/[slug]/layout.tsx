import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRODUCTS_WITH_SHARE_IMAGE } from '@/src/lib/og-images';
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
    return { title: 'Page not found', robots: { index: false, follow: false } };
  }

  // A 1200x630 branded card for link previews; falls back to the product photo
  // for pieces added later from the admin.
  const shareImage = PRODUCTS_WITH_SHARE_IMAGE.has(product.slug) ? `/og/${product.slug}.jpg` : product.primaryImage;
  const shareImages = [{ url: shareImage, alt: product.name, ...(shareImage.endsWith('.jpg') ? { width: 1200, height: 630 } : {}) }];

  return {
    title: product.name,
    description: product.editorialSubtitle || product.description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: 'website',
      url: `/product/${product.slug}`,
      title: product.name,
      description: product.editorialSubtitle || product.description,
      images: shareImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.editorialSubtitle || product.description,
      images: [shareImage],
    },
  };
}

export default async function ProductLayout({ children, params }: Props) {
  const { slug } = await params;
  const product = await db.getProductBySlug(slug);

  // A real 404 status, so removed or mistyped products drop out of search results.
  if (!product || product.status !== 'live') notFound();

  const inStock = product.variants?.some((variant) => variant.active && variant.stock > 0) ?? false;
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: [product.primaryImage, ...product.galleryImages].map((src) => (src.startsWith('/') ? `${getAppUrl()}${src}` : src)),
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
    ...(product.colors?.[0]?.name ? { color: product.colors[0].name } : {}),
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

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: getAppUrl() },
      { '@type': 'ListItem', position: 2, name: 'Shop', item: `${getAppUrl()}/shop` },
      { '@type': 'ListItem', position: 3, name: product.name, item: `${getAppUrl()}/product/${product.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
