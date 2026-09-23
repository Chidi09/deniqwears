/**
 * The Deniqwears catalogue: the owner's ten launch designs. Shared by the seed
 * (fresh databases) and scripts/import-catalog.ts (existing databases).
 *
 * Prices (cents) and per-size stock are launch placeholders for the owner to
 * confirm in Admin → Products. Every design is cut in sizes 10–20.
 */

const SIZES = ['10', '12', '14', '16', '18', '20'];
const PLACEHOLDER_STOCK_PER_SIZE = 5;

const DELIVERY = 'Ships within 1–2 business days. Free standard US shipping on orders over $150.';
const FIT = 'Relaxed, easy fit. Available in sizes 10 to 20 — check the size chart for bust, waist, hip and length measurements.';

interface CatalogEntry {
  name: string;
  slug: string;
  priceInKobo: number;
  category: 'dresses' | 'sets' | 'tops' | 'bottoms' | 'occasion';
  color: { name: string; hex: string };
  editorialSubtitle: string;
  description: string;
  care: string;
  badge?: 'NEW' | 'EXCLUSIVE' | 'LIMITED';
  isSignatureSelection?: boolean;
  isAsymmetricFeature?: boolean;
  asymmetricRole?: 'large' | 'detail';
}

const ENTRIES: CatalogEntry[] = [
  {
    name: 'The Iris Gown',
    slug: 'iris-gown',
    priceInKobo: 22_000,
    category: 'dresses',
    color: { name: 'Peacock', hex: '#0E7C7B' },
    editorialSubtitle: 'Iridescent draped gown',
    description:
      'A show-stopping gown in shimmering peacock teal. Dramatic draped sleeves, a deep V neckline with an embroidered placket and pin-tucked bodice detailing that shapes the waist before falling into soft, sculpted folds.',
    care: 'Dry clean only.',
    badge: 'EXCLUSIVE',
    isSignatureSelection: true,
    isAsymmetricFeature: true,
    asymmetricRole: 'large',
  },
  {
    name: 'The Ember Circle Kaftan',
    slug: 'ember-circle-kaftan',
    priceInKobo: 17_500,
    category: 'dresses',
    color: { name: 'Burnt Orange', hex: '#C4501B' },
    editorialSubtitle: 'Satin kaftan with circle appliqué',
    description:
      'A flowing floor-length kaftan in glossy burnt-orange satin, finished with cream circle appliqués at the neckline and hem and full balloon sleeves gathered at the cuff.',
    care: 'Dry clean only.',
    badge: 'NEW',
    isSignatureSelection: true,
  },
  {
    name: 'The Scarlet Crystal Set',
    slug: 'scarlet-crystal-set',
    priceInKobo: 18_500,
    category: 'occasion',
    color: { name: 'Scarlet', hex: '#C8102E' },
    editorialSubtitle: 'Crystal-studded wrap top & wide-leg trousers',
    description:
      'Rich scarlet satin scattered with crystal studs. The top wraps and ties at the waist over a soft peplum, with wide bell sleeves, paired with pressed wide-leg trousers.',
    care: 'Dry clean recommended. Store folded to protect the crystals.',
    badge: 'NEW',
    isSignatureSelection: true,
    isAsymmetricFeature: true,
    asymmetricRole: 'detail',
  },
  {
    name: 'The Bloom Cape Set',
    slug: 'bloom-cape-set',
    priceInKobo: 16_800,
    category: 'sets',
    color: { name: 'Bloom Print / Orange', hex: '#F07A1A' },
    editorialSubtitle: 'Floral cape top & tangerine trousers',
    description:
      'A floaty, high-neck cape top in a painterly floral print that cascades into long ruffled panels, worn over bold tangerine wide-leg trousers.',
    care: 'Hand wash cold or dry clean. Do not tumble dry.',
    badge: 'NEW',
    isSignatureSelection: true,
    isAsymmetricFeature: true,
    asymmetricRole: 'detail',
  },
  {
    name: 'The Ayo Fringe Set',
    slug: 'ayo-fringe-set',
    priceInKobo: 13_800,
    category: 'sets',
    color: { name: 'Teal', hex: '#1A9A96' },
    editorialSubtitle: 'Textured shirt with fringe & trousers',
    description:
      'A textured teal button-down with cut-out sleeves, fringed cuffs and a fringed patch pocket, matched with relaxed straight-leg trousers.',
    care: 'Hand wash cold. Hang to dry.',
    isSignatureSelection: true,
    isAsymmetricFeature: true,
    asymmetricRole: 'large',
  },
  {
    name: 'The Coral Poncho Set',
    slug: 'coral-fringe-poncho-set',
    priceInKobo: 14_800,
    category: 'sets',
    color: { name: 'Coral', hex: '#F37C83' },
    editorialSubtitle: 'Fringed poncho top & trousers',
    description:
      'A flowing coral poncho top finished with a woven stripe border and fringed hem, over matching wide-leg trousers.',
    care: 'Hand wash cold or dry clean. Do not tumble dry.',
    isSignatureSelection: true,
  },
  {
    name: 'The Tide Stripe Set',
    slug: 'tide-stripe-set',
    priceInKobo: 12_800,
    category: 'sets',
    color: { name: 'Ocean Stripe', hex: '#3C8DC9' },
    editorialSubtitle: 'Oversized stripe top & trousers',
    description:
      'An oversized V-neck top in watercolour ocean stripes with wide, easy sleeves, paired with matching relaxed trousers. Breezy and effortless.',
    care: 'Machine wash cold on a gentle cycle. Hang to dry.',
  },
  {
    name: 'The Adire Patchwork Set',
    slug: 'adire-patchwork-set',
    priceInKobo: 11_800,
    category: 'sets',
    color: { name: 'Black / Multi', hex: '#171714' },
    editorialSubtitle: 'Print-panel tee & patchwork trousers',
    description:
      'A black tee pieced with bold print panels, paired with wide patchwork trousers in turquoise, orange and gold prints.',
    care: 'Hand wash cold, inside out. Hang to dry.',
    badge: 'NEW',
  },
  {
    name: 'The Canvas Shirt Set',
    slug: 'canvas-shirt-set',
    priceInKobo: 13_800,
    category: 'sets',
    color: { name: 'White / Multi', hex: '#F5F5F0' },
    editorialSubtitle: 'Crisp shirt & mixed-print trousers',
    description:
      'A crisp white fitted shirt with rainbow-stripe cuffs, paired with wide-leg trousers that mix bold stripes with a vivid tie-dye print.',
    care: 'Machine wash cold. Iron the shirt on medium heat.',
  },
  {
    name: 'The Ruby Fringe Set',
    slug: 'ruby-fringe-trouser-set',
    priceInKobo: 14_800,
    category: 'sets',
    color: { name: 'White / Ruby', hex: '#C62828' },
    editorialSubtitle: 'Bell-sleeve top & fringed print trousers',
    description:
      'A soft white bell-sleeve top with a print pocket detail, worn with ruby-red woven-print trousers trimmed in full fringe down each side.',
    care: 'Hand wash cold or dry clean. Do not tumble dry.',
  },
  {
    name: 'The Kemi Peplum Set',
    slug: 'kemi-peplum-set',
    priceInKobo: 13_800,
    category: 'sets',
    color: { name: 'Pink / Green Print', hex: '#E58BB0' },
    editorialSubtitle: 'Belted peplum top & print trousers',
    description:
      'A bright pink-and-green print peplum top with short sleeves and a tie belt that cinches the waist, paired with matching straight-leg trousers.',
    care: 'Hand wash cold. Iron on the reverse.',
    badge: 'NEW',
  },
];

export const CATALOG_PRODUCTS = ENTRIES.map((entry) => {
  const image = `/products/${entry.slug}.webp`;
  return {
    name: entry.name,
    slug: entry.slug,
    priceInKobo: entry.priceInKobo,
    status: 'live' as const,
    category: entry.category,
    collection: 'COLLECTION 01',
    colors: [entry.color],
    sizes: SIZES,
    variants: SIZES.map((size) => ({
      color: entry.color.name,
      size,
      stock: PLACEHOLDER_STOCK_PER_SIZE,
      active: true,
    })),
    primaryImage: image,
    secondaryImage: image,
    galleryImages: [image],
    badge: entry.badge,
    // No reviews yet — the product page hides the rating until there are some.
    rating: 0,
    reviewsCount: 0,
    description: entry.description,
    fitAndSize: FIT,
    delivery: DELIVERY,
    care: entry.care,
    editorialSubtitle: entry.editorialSubtitle,
    isNewArrival: true,
    isSignatureSelection: entry.isSignatureSelection ?? false,
    isAsymmetricFeature: entry.isAsymmetricFeature ?? false,
    asymmetricRole: entry.asymmetricRole,
  };
});

export const CATALOG_SLUGS = CATALOG_PRODUCTS.map((p) => p.slug);
