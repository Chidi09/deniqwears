import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { QUERY_KEYS } from './queries';
import { Order, Product, StoreSettings, ProductInput, QuickEditItem } from '../types';

export function useInitiateCheckoutMutation() {
  return useMutation({
    mutationFn: (payload: {
      items: Array<{ productId: string; variantId: string; quantity: number }>;
      customer: { firstName: string; lastName: string; email: string; phone: string };
      shippingAddress: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address: string;
        apartment?: string;
        city: string;
        state: string;
        country: string;
      };
      deliveryZoneId: string;
      discountCode?: string;
      paymentMethod: string;
      idempotencyKey?: string;
    }) => api.initiateCheckout(payload),
  });
}

export function useVerifyPaymentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reference, orderId }: { reference: string; orderId: string }) =>
      api.verifyPayment(reference, orderId),
    onSuccess: (data) => {
      if (data?.order?.id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order(data.order.id) });
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminOrders });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminOverview });
    },
  });
}

export function useValidateDiscountMutation() {
  return useMutation({
    mutationFn: ({ code, subtotalInKobo }: { code: string; subtotalInKobo: number }) =>
      api.validateDiscount(code, subtotalInKobo),
  });
}

export function useAdminLoginMutation() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.adminLogin(email, password),
  });
}

export function useAdminCreateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productData: ProductInput) => api.createAdminProduct(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminProducts });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminOverview });
    },
  });
}

export function useAdminUpdateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, productData }: { id: string; productData: ProductInput }) =>
      api.updateAdminProduct(id, productData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminProducts });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      if (data?.slug) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.product(data.slug) });
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminOverview });
    },
  });
}

export function useAdminArchiveProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.archiveAdminProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminProducts });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminOverview });
    },
  });
}

export function useAdminQuickEditMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: QuickEditItem[]) => api.quickEditProducts(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminProducts });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminOverview });
    },
  });
}

export function useAdminUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status, reason }: { orderId: string; status: string; reason?: string }) =>
      api.updateOrderStatus(orderId, status, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminOrders });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminOverview });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order(data.id) });
      }
    },
  });
}

export function useAdminRefundOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, amountInKobo }: { orderId: string; amountInKobo?: number }) =>
      api.refundOrder(orderId, amountInKobo),
    onSuccess: ({ order }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminOrders });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminOverview });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order(order.id) });
    },
  });
}

export function useAdminUpdateSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: Partial<StoreSettings>) => api.updateAdminSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSettings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.settings });
    },
  });
}
