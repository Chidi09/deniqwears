import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, Product, ShippingAddress } from '../types';

interface CartState {
  cartItems: CartItem[];
  addItem: (product: Product, color: string, size: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalCount: () => number;
  subtotalInKobo: () => number;
}

interface UIState {
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  accountOpen: boolean;
  setAccountOpen: (open: boolean) => void;
  sizeGuideOpen: boolean;
  setSizeGuideOpen: (open: boolean) => void;
  quickAddProduct: Product | null;
  setQuickAddProduct: (product: Product | null) => void;
}

interface GuestCheckoutState {
  guestCustomer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  } | null;
  guestShippingAddress: ShippingAddress | null;
  setGuestCustomer: (customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) => void;
  setGuestShippingAddress: (address: ShippingAddress) => void;
  clearGuestDetails: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Starts empty. This previously shipped a fixture Amara dress with
      // fixture IDs, so every new visitor found an item they never added
      // in their bag — and checkout rejected it, because those IDs don't
      // exist in the real catalog.
      cartItems: [],
      addItem: (product: Product, color: string, size: string) => {
        const matchedVariant = product.variants?.find(
          (v) => v.color.toLowerCase() === color.toLowerCase() && v.size === size
        );
        const variantId = matchedVariant ? matchedVariant.id : `${product.id}-${color}-${size}`;
        // Variant override wins over the base price, and there is no
        // invented fallback: a product with no price is a data bug that
        // should surface, not silently become ₦48,000.
        const priceInKobo = matchedVariant?.priceInKobo ?? product.priceInKobo;

        set((state) => {
          const existing = state.cartItems.find(
            (i) => i.productId === product.id && i.selectedColor === color && i.selectedSize === size
          );
          if (existing) {
            return {
              cartItems: state.cartItems.map((i) =>
                i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          const newItem: CartItem = {
            id: `${product.id}-${color}-${size}-${Date.now()}`,
            productId: product.id,
            variantId,
            name: product.name,
            priceInKobo,
            image: product.primaryImage,
            selectedColor: color,
            selectedSize: size,
            quantity: 1,
          };
          return { cartItems: [...state.cartItems, newItem] };
        });
      },
      updateQuantity: (id: string, delta: number) => {
        set((state) => ({
          cartItems: state.cartItems
            .map((item) => {
              if (item.id === id) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
              }
              return item;
            })
            .filter(Boolean) as CartItem[],
        }));
      },
      removeItem: (id: string) => {
        set((state) => ({
          cartItems: state.cartItems.filter((i) => i.id !== id),
        }));
      },
      clearCart: () => {
        set({ cartItems: [] });
      },
      totalCount: () => {
        return get().cartItems.reduce((acc, item) => acc + item.quantity, 0);
      },
      subtotalInKobo: () => {
        return get().cartItems.reduce(
          (acc, item) => acc + item.priceInKobo * item.quantity,
          0
        );
      },
    }),
    {
      name: 'deniq_cart_storage',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? window.localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
    }
  )
);

export const useUIStore = create<UIState>((set) => ({
  cartOpen: false,
  setCartOpen: (open) => set({ cartOpen: open }),
  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),
  accountOpen: false,
  setAccountOpen: (open) => set({ accountOpen: open }),
  sizeGuideOpen: false,
  setSizeGuideOpen: (open) => set({ sizeGuideOpen: open }),
  quickAddProduct: null,
  setQuickAddProduct: (product) => set({ quickAddProduct: product }),
}));

export const useGuestCheckoutStore = create<GuestCheckoutState>()(
  persist(
    (set) => ({
      guestCustomer: null,
      guestShippingAddress: null,
      setGuestCustomer: (customer) => set({ guestCustomer: customer }),
      setGuestShippingAddress: (address) => set({ guestShippingAddress: address }),
      clearGuestDetails: () =>
        set({ guestCustomer: null, guestShippingAddress: null }),
    }),
    {
      name: 'deniq_guest_checkout',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? window.localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
    }
  )
);
