import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { fetchShopProduct } from '../../api/shop';
import { findContentByShop, slugFromSku } from '../../lib/productCatalog';

/** 旧商城路径兼容：/shop → /products；/shop/:id → /products/:slug */
export function ShopIndexRedirect() {
  return <Navigate to="/products" replace />;
}

export function ShopItemRedirect() {
  const { id } = useParams<{ id: string }>();
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setTarget('/products');
      return;
    }

    if (!/^\d+$/.test(id)) {
      setTarget(`/products/${id.toLowerCase()}`);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const shop = await fetchShopProduct(id);
        if (cancelled) return;
        const content = findContentByShop(shop);
        setTarget(`/products/${content?.id ?? slugFromSku(shop.sku)}`);
      } catch {
        if (!cancelled) setTarget('/products');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!target) {
    return (
      <section className="relative z-10 flex min-h-[100dvh] items-center justify-center">
        <Loader2 className="animate-spin text-zinc-500" size={28} />
      </section>
    );
  }

  return <Navigate to={target} replace />;
}
