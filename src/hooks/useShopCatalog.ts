import { useEffect, useState } from 'react';
import { fetchShopProducts } from '../api/shop';
import type { ShopProduct } from '../api/types';
import { findShopProduct, type ProductContent } from '../lib/productCatalog';

interface ShopCatalogState {
  list: ShopProduct[];
  loading: boolean;
  error: string;
  forContent: (content: ProductContent) => ShopProduct | undefined;
}

/** 拉取商城商品列表，供产品页按 sku 对齐价格/库存 */
export function useShopCatalog(): ShopCatalogState {
  const [list, setList] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchShopProducts({ page: 1, page_size: 100 });
        if (!cancelled) setList(data.list ?? []);
      } catch (err) {
        if (!cancelled) {
          setList([]);
          setError(err instanceof Error ? err.message : '商城信息暂不可用');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    list,
    loading,
    error,
    forContent: (content) => findShopProduct(list, content),
  };
}
