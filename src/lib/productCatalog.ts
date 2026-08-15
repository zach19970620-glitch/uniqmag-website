import productsData from '../data/products.json';
import type { ShopProduct } from '../api/types';

export type ProductContent = (typeof productsData.products)[number];

/** 内容包 slug（路由）→ 营销内容；sku 默认等于 name（UQ68） */
export const productContentList = productsData.products as ProductContent[];

export const productContentBySlug = Object.fromEntries(
  productContentList.map((p) => [p.id.toLowerCase(), p]),
) as Record<string, ProductContent>;

export function normalizeSku(sku: string | null | undefined): string {
  return (sku ?? '').trim().toUpperCase();
}

export function contentSku(product: ProductContent): string {
  return normalizeSku(product.name) || normalizeSku(product.id);
}

export function slugFromSku(sku: string): string {
  const normalized = normalizeSku(sku);
  const byName = productContentList.find((p) => contentSku(p) === normalized);
  if (byName) return byName.id;
  return sku.trim().toLowerCase();
}

export function findShopProduct(
  shopList: ShopProduct[],
  content: ProductContent,
): ShopProduct | undefined {
  const sku = contentSku(content);
  return shopList.find((item) => normalizeSku(item.sku) === sku);
}

export function findContentByShop(shop: ShopProduct): ProductContent | undefined {
  const sku = normalizeSku(shop.sku);
  return (
    productContentList.find((p) => contentSku(p) === sku) ??
    productContentBySlug[shop.sku.toLowerCase()]
  );
}
