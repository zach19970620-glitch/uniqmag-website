import { apiRequest, apiRequestPage } from './client';
import type { PageResult, ShopProduct } from './types';

export function fetchShopProducts(params?: {
  page?: number;
  page_size?: number;
  /** 商品名称模糊搜索 */
  name?: string;
}) {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.page_size) q.set('page_size', String(params.page_size));
  if (params?.name?.trim()) q.set('name', params.name.trim());
  const qs = q.toString();
  return apiRequestPage<ShopProduct>(
    `/app/v1/shop/products${qs ? `?${qs}` : ''}`,
    { method: 'GET' },
  ) as Promise<PageResult<ShopProduct>>;
}

export function fetchShopProduct(id: string | number) {
  return apiRequest<ShopProduct>(`/app/v1/shop/products/${id}`, { method: 'GET' });
}
