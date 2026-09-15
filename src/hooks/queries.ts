import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Product, StoreSettings, Order, Category } from '../types';

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

/**
 * No `initialData` and no demo fallback, deliberately.
 *
 * `initialData` marks the cache as fresh, so with the provider's 2-minute
 * staleTime (and refetchOnWindowFocus disabled) the very first request was
 * skipped entirely — the storefront rendered fixture products with fixture
 * variant IDs that real checkout rejects, and never fetched the live catalog.
 * Substituting fixtures for an empty or failed response hid outages and made
 * a deliberately empty catalog un-emptyable. Callers get real
 * loading/error/empty states instead.
 */
export function useProductsQuery(category?: Category) {
  return useQuery<Product[]>({
    queryKey: [...QUERY_KEYS.products, category || 'all'],
    queryFn: () => api.getProducts(),
  });
}

export function useProductQuery(slug: string) {
  return useQuery<Product | null>({
    queryKey: QUERY_KEYS.product(slug),
    queryFn: () => api.getProductBySlug(slug),
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
