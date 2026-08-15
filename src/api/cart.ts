import { apiRequest } from './client';
import type { CartPayload } from './types';

export function fetchCart() {
  return apiRequest<CartPayload>('/app/v1/cart', { method: 'GET' }, true);
}

export function updateCart(items: { product_id: number; qty: number }[]) {
  return apiRequest<CartPayload>(
    '/app/v1/cart',
    {
      method: 'PUT',
      body: JSON.stringify({ items }),
    },
    true,
  );
}
