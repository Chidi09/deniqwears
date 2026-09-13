export type Category = 'all' | 'dresses' | 'sets' | 'tops' | 'bottoms' | 'occasion';

export interface ProductColor {
  name: string;
  hex: string;
  inStock?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: 'dresses' | 'sets' | 'tops' | 'bottoms' | 'occasion';
  collection?: string;
  colors: ProductColor[];
  sizes: Array<'XS' | 'S' | 'M' | 'L' | 'XL'>;
  primaryImage: string;
  secondaryImage: string;
  galleryImages: string[];
  badge?: 'NEW' | 'EXCLUSIVE' | 'LIMITED';
  rating: number;
  reviewsCount: number;
  stockWarning?: string;
  description: string;
  fitAndSize: string;
  delivery: string;
  care: string;
  editorialSubtitle?: string;
  isNewArrival?: boolean;
  isSignatureSelection?: boolean;
  isAsymmetricFeature?: boolean;
  asymmetricRole?: 'large' | 'detail';
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
}

export interface LookbookItem {
  id: string;
  title: string;
  caption: string;
  editorialNote: string;
  image: string;
  aspectRatio: 'portrait' | 'tall' | 'wide' | 'square';
  productIds: string[];
}

export interface FilterState {
  category: Category;
  sizes: string[];
  colors: string[];
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'newest';
}

export type ActivePage = 
  | { type: 'home' }
  | { type: 'shop'; category?: Category }
  | { type: 'product'; slug: string }
  | { type: 'lookbook' }
  | { type: 'about' }
  | { type: 'account'; tab?: 'orders' | 'addresses' | 'wishlist' };
