import { Product, LookbookItem } from '../types';

export function formatPrice(price: number): string {
  return '₦' + price.toLocaleString('en-NG');
}

export const PRODUCTS: Product[] = [
  {
    id: 'prod-amara-dress',
    name: 'The Amara Dress',
    slug: 'the-amara-dress',
    price: 48000,
    category: 'dresses',
    collection: 'The Deniq Edit',
    colors: [
      { name: 'Black', hex: '#171714' },
      { name: 'Ivory', hex: '#FAF9F6' },
      { name: 'Oxblood', hex: '#681F2C' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    primaryImage: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop'
    ],
    badge: 'NEW',
    rating: 4.8,
    reviewsCount: 34,
    stockWarning: 'Only 3 left in M',
    editorialSubtitle: 'Sculpted drape with fluid movement',
    description: 'An architectural column dress rendered in heavyweight crepe with a soft satin finish. Cut close through the torso with an unexpected fluid side-drape that commands the space upon entry.',
    fitAndSize: 'True to size with bias-cut give. Model is 5\'10" / 178cm wearing size S. Intended floor-length profile.',
    delivery: 'Complimentary standard courier across Lagos (24–48 hrs). Nationwide express delivery within 3 working days.',
    care: 'Specialist dry clean only. Cool iron on reverse using protective cloth. Store on broad padded hanger.',
    isNewArrival: true,
    isSignatureSelection: true,
    isAsymmetricFeature: true,
    asymmetricRole: 'large'
  },
  {
    id: 'prod-sculpted-corset',
    name: 'Sculpted Corset',
    slug: 'sculpted-corset',
    price: 34500,
    category: 'tops',
    collection: 'Collection 01',
    colors: [
      { name: 'Oxblood', hex: '#681F2C' },
      { name: 'Ink', hex: '#171714' }
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    primaryImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=1200&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop'
    ],
    badge: 'EXCLUSIVE',
    rating: 4.9,
    reviewsCount: 19,
    stockWarning: 'Low stock in size S',
    editorialSubtitle: 'Internal boning with raw-hem edge',
    description: 'Precision-tailored corset featuring flexible structural boning and dipped curved hemline. Pairs seamlessly with relaxed suiting trousers or fluid slip skirts.',
    fitAndSize: 'Structured compression fit. We recommend sizing up if between sizes. Model wears XS.',
    delivery: 'Dispatched within 24 hours from our Victoria Island showroom.',
    care: 'Dry clean only. Do not tumble dry.',
    isNewArrival: true,
    isSignatureSelection: true,
    isAsymmetricFeature: true,
    asymmetricRole: 'detail'
  },
  {
    id: 'prod-deniq-bias-dress',
    name: 'Deniq Bias Dress',
    slug: 'deniq-bias-dress',
    price: 48000,
    category: 'dresses',
    collection: 'The Deniq Edit',
    colors: [
      { name: 'Deep Emerald', hex: '#1C3127' },
      { name: 'Oxblood', hex: '#681F2C' },
      { name: 'Ink', hex: '#171714' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    primaryImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop'
    ],
    badge: 'LIMITED',
    rating: 4.9,
    reviewsCount: 42,
    description: 'Cut on the true bias from double-faced Japanese satin. Skims the silhouette without clinging, punctuated by a lowered square back and delicate rouleau tie.',
    fitAndSize: 'Slip silhouette with relaxed drape. Size down for a body-conscious fit.',
    delivery: 'Ships in bespoke Deniq archival box. Next-day Lagos arrival.',
    care: 'Delicate cold hand wash or dry clean. Line dry in shade.',
    isNewArrival: true,
    isSignatureSelection: true
  },
  {
    id: 'prod-pleated-midi',
    name: 'Deniq Pleated Midi',
    slug: 'deniq-pleated-midi',
    price: 42000,
    category: 'dresses',
    collection: 'Collection 01',
    colors: [
      { name: 'Ivory', hex: '#FAF9F6' },
      { name: 'Black', hex: '#171714' },
      { name: 'Oxblood', hex: '#681F2C' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    primaryImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop'
    ],
    badge: 'NEW',
    rating: 4.7,
    reviewsCount: 28,
    description: 'Permanently accordion-pleated midi skirt merged with a clean sleeveless shell bodice. Designed for modern transitions from executive salons to after-dark dinners.',
    fitAndSize: 'Regular fit through bust with generous movement below the waist seam.',
    delivery: 'Standard complimentary delivery nationwide on orders above ₦50,000.',
    care: 'Dry clean recommended to preserve permanent pleat structure.',
    isNewArrival: true,
    isSignatureSelection: true
  },
  {
    id: 'prod-luna-set',
    name: 'The Luna Set',
    slug: 'the-luna-set',
    price: 54000,
    category: 'sets',
    collection: 'The Deniq Edit',
    colors: [
      { name: 'Graphite', hex: '#56554F' },
      { name: 'Raw Mist', hex: '#D8D4CC' }
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    primaryImage: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=1200&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?q=80&w=1200&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?q=80&w=1200&auto=format&fit=crop'
    ],
    badge: 'EXCLUSIVE',
    rating: 5.0,
    reviewsCount: 16,
    stockWarning: 'Limited batch production (12 sets remain)',
    description: 'A two-piece ensemble comprising an asymmetrical draped wrap top and wide-leg trousers cut in fluid micro-twill. Minimalist luxury redefined.',
    fitAndSize: 'High-rise trouser with 33" inseam. Adjustable waist wrap on top.',
    delivery: 'Dispatched in signature linen dust bags.',
    care: 'Dry clean only.',
    isNewArrival: true,
    isSignatureSelection: true
  },
  {
    id: 'prod-tailored-blazer',
    name: 'Sculpted Peak Blazer',
    slug: 'sculpted-peak-blazer',
    price: 58000,
    category: 'tops',
    collection: 'Collection 01',
    colors: [
      { name: 'Midnight Ink', hex: '#171714' },
      { name: 'Oxblood', hex: '#681F2C' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    primaryImage: 'https://images.unsplash.com/photo-1550614000-4895a10e1bfd?q=80&w=1200&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?q=80&w=1200&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1550614000-4895a10e1bfd?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?q=80&w=1200&auto=format&fit=crop'
    ],
    badge: 'LIMITED',
    rating: 4.8,
    reviewsCount: 22,
    description: 'Tailored with sharp exaggerated peak lapels and a cinched waist silhouette. Cut from virgin wool blend with bespoke interior oxblood lining.',
    fitAndSize: 'Slightly oversized shoulders with hourglass waist construction.',
    delivery: 'Free showroom pickup or white-glove courier.',
    care: 'Professional dry clean only.',
    isNewArrival: false,
    isSignatureSelection: true
  },
  {
    id: 'prod-pleated-trouser',
    name: 'Draped Pleat Trouser',
    slug: 'draped-pleat-trouser',
    price: 36000,
    category: 'bottoms',
    collection: 'The Deniq Edit',
    colors: [
      { name: 'Paper Cream', hex: '#FAF9F6' },
      { name: 'Ink', hex: '#171714' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    primaryImage: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?q=80&w=1200&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=1200&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?q=80&w=1200&auto=format&fit=crop'
    ],
    rating: 4.6,
    reviewsCount: 15,
    description: 'Deep double-front pleats create dramatic movement while walking. High-waisted rise with internal grip waistband and horn button closure.',
    fitAndSize: 'High-rise with relaxed drape through leg.',
    delivery: 'Ships within 48 hours.',
    care: 'Gentle dry clean.',
    isNewArrival: false,
    isSignatureSelection: false
  },
  {
    id: 'prod-draped-skirt',
    name: 'Asymmetric Draped Skirt',
    slug: 'asymmetric-draped-skirt',
    price: 38000,
    category: 'bottoms',
    collection: 'Collection 01',
    colors: [
      { name: 'Oxblood', hex: '#681F2C' },
      { name: 'Ivory', hex: '#FAF9F6' }
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    primaryImage: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop'
    ],
    badge: 'NEW',
    rating: 4.9,
    reviewsCount: 18,
    description: 'Sculptural gathered hip with an asymmetrical cascading hemline. Crafted from fluid matte crepe that sways with every step.',
    fitAndSize: 'Fitted at waist and high hip. Sits just below natural waist.',
    delivery: 'Fast express transit.',
    care: 'Dry clean only.',
    isNewArrival: true,
    isSignatureSelection: true
  },
  {
    id: 'prod-gala-gown',
    name: 'Sovereign Column Gown',
    slug: 'sovereign-column-gown',
    price: 68000,
    category: 'occasion',
    collection: 'The Deniq Edit',
    colors: [
      { name: 'Oxblood', hex: '#681F2C' },
      { name: 'Black', hex: '#171714' }
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    primaryImage: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1200&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop'
    ],
    badge: 'EXCLUSIVE',
    rating: 5.0,
    reviewsCount: 11,
    stockWarning: 'Private showroom atelier piece — only 2 in size S',
    description: 'An uncompromising floor-sweeping gown with high architectural halter neckline and exposed spine. Designed for entrances that echo long after departure.',
    fitAndSize: 'Tailored column silhouette. Floor length even with 100mm heels.',
    delivery: 'Delivered in custom garbing bag with personal garment tag.',
    care: 'Atelier specialist clean only.',
    isNewArrival: true,
    isSignatureSelection: true
  }
];

export const LOOKBOOK_ITEMS: LookbookItem[] = [
  {
    id: 'look-01',
    title: 'The Entrance Edit',
    caption: 'Victoria Island Rooftops',
    editorialNote: 'Featuring The Amara Dress in Pure Ink paired with minimal architectural silver.',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop',
    aspectRatio: 'portrait',
    productIds: ['prod-amara-dress']
  },
  {
    id: 'look-02',
    title: 'Structured Fluidity',
    caption: 'Studio Session 04',
    editorialNote: 'Sculpted Corset in Signature Oxblood styled against wide-leg pleated wool.',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
    aspectRatio: 'square',
    productIds: ['prod-sculpted-corset', 'prod-pleated-trouser']
  },
  {
    id: 'look-03',
    title: 'Movement & Form',
    caption: 'Lagos Night Air',
    editorialNote: 'The Luna Set captured in unposed kinetic transit.',
    image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=1200&auto=format&fit=crop',
    aspectRatio: 'tall',
    productIds: ['prod-luna-set']
  },
  {
    id: 'look-04',
    title: 'Midnight Occasion',
    caption: 'Ikoyi Private Residence',
    editorialNote: 'Sovereign Column Gown catching low warm interior lighting.',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1200&auto=format&fit=crop',
    aspectRatio: 'portrait',
    productIds: ['prod-gala-gown']
  }
];

export const COMMUNITY_POSTS = [
  {
    id: 'c-1',
    handle: '@yewande.a',
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=800&auto=format&fit=crop',
    location: 'Lagos, NG',
    product: 'Sculpted Corset'
  },
  {
    id: 'c-2',
    handle: '@bolanle_o',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
    location: 'Abuja, NG',
    product: 'The Amara Dress'
  },
  {
    id: 'c-3',
    handle: '@fola.studio',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop',
    location: 'London / Lagos',
    product: 'Luna Set'
  },
  {
    id: 'c-4',
    handle: '@chidinma_e',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop',
    location: 'Accra, GH',
    product: 'Deniq Bias Dress'
  },
  {
    id: 'c-5',
    handle: '@zainab.k',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=800&auto=format&fit=crop',
    location: 'Lagos Island',
    product: 'Sovereign Column Gown'
  },
  {
    id: 'c-6',
    handle: '@kemi_creates',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=800&auto=format&fit=crop',
    location: 'Victoria Island',
    product: 'Sculpted Peak Blazer'
  }
];
