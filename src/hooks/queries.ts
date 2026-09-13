import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Product, StoreSettings, Order, Category } from '../types';
import { PRODUCTS } from '../data/products';

export const QUERY_KEYS = {
  products: ['products'] as const,
  product: (slug: string) => ['product', slug] as const,
  settings: ['settings'] as const,
  order: (id: string) => ['order', id] as const,
  adminOverview: ['admin', 'overview'] as const,
  adminProducts: ['admin', 'products'] as const,
  adminOrders: ['admin', 'orders'] as const,
  adminSettings: ['admin', 'settings'] as const,
  adminAuditLogs: ['admin', 'audit-logs'] as const,
};

export function useProductsQuery(category?: Category) {
  return useQuery<Product[]>({
    queryKey: [...QUERY_KEYS.products, category || 'all'],
    queryFn: async () => {
      const prods = await api.getProducts();
      return prods && prods.length > 0 ? prods : PRODUCTS;
    },
    initialData: PRODUCTS,
  });
}

export function useProductQuery(slug: string) {
  return useQuery<Product | null>({
    queryKey: QUERY_KEYS.product(slug),
    queryFn: async () => {
      const prod = await api.getProductBySlug(slug);
      return prod || PRODUCTS.find((p) => p.slug === slug) || null;
    },
    enabled: !!slug,
  });
}

export function useStoreSettingsQuery() {
  return useQuery<StoreSettings | null>({
    queryKey: QUERY_KEYS.settings,
    queryFn: () => api.getSettings(),
  });
}

export function useOrderQuery(orderId: string) {
  return useQuery<Order | null>({
    queryKey: QUERY_KEYS.order(orderId),
    queryFn: () => api.getOrder(orderId),
    enabled: !!orderId,
  });
}

export function useAdminOverviewQuery(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.adminOverview,
    queryFn: () => api.getAdminOverview(),
    enabled,
  });
}

export function useAdminProductsQuery(enabled = true) {
  return useQuery<Product[]>({
    queryKey: QUERY_KEYS.adminProducts,
    queryFn: () => api.getAdminProducts(),
    enabled,
  });
}

export function useAdminOrdersQuery(enabled = true) {
  return useQuery<Order[]>({
    queryKey: QUERY_KEYS.adminOrders,
    queryFn: () => api.getAdminOrders(),
    enabled,
  });
}

export function useAdminSettingsQuery(enabled = true) {
  return useQuery<StoreSettings>({
    queryKey: QUERY_KEYS.adminSettings,
    queryFn: () => api.getAdminSettings(),
    enabled,
  });
}

export function useAdminAuditLogsQuery(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.adminAuditLogs,
    queryFn: () => api.getAdminAuditLogs(),
    enabled,
  });
}
