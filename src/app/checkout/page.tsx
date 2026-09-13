'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../context/StoreContext';
import { CheckoutPage as CheckoutComponent } from '../../components/CheckoutPage';

export default function Checkout() {
  const router = useRouter();
  const { cartItems, handleClearCart } = useStore();

  return (
    <CheckoutComponent
      items={cartItems}
      onBackToShopping={() => router.push('/shop')}
      onClearCart={handleClearCart}
    />
  );
}
