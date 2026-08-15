import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Minus, Plus, ShoppingBag } from 'lucide-react';
import type { ShopProduct } from '../../api/types';
import { formatCentLabel } from '../../lib/money';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

interface ProductBuyPanelProps {
  shop: ShopProduct | undefined;
  loading: boolean;
  unavailableHint?: string;
  fromPath: string;
}

export default function ProductBuyPanel({
  shop,
  loading,
  unavailableHint,
  fromPath,
}: ProductBuyPanelProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [hint, setHint] = useState('');

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-6">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 size={16} className="animate-spin" />
          正在同步价格与库存…
        </div>
      </div>
    );
  }

  if (!shop || shop.status === 'off') {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-6">
        <p className="text-sm text-zinc-400">
          {unavailableHint || '暂未开放购买，可先了解产品规格与特性'}
        </p>
        <button
          type="button"
          onClick={() => navigate('/cart')}
          className="mt-4 text-sm text-zinc-300 underline-offset-4 hover:text-white hover:underline"
        >
          查看购物车
        </button>
      </div>
    );
  }

  const inStock = shop.stock_summary > 0;
  // 服务端约束单行数量 1–99
  const maxQty = Math.max(1, Math.min(99, shop.stock_summary));

  // 加购无需登录（游客购物车本地保存，登录时自动合并）；结算时才要求登录
  const handleAddToCart = async () => {
    if (!inStock) {
      setError('该商品暂时缺货');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await addItem({
        product_id: shop.id,
        sku: shop.sku,
        title: shop.name,
        cover: shop.cover,
        price_cent: shop.price_cent,
        stock_summary: shop.stock_summary,
        qty,
      });
      setHint('已加入购物车');
      window.setTimeout(() => setHint(''), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加购失败');
    } finally {
      setBusy(false);
    }
  };

  /** 立即购买：单件直达结算，不动购物车 */
  const handleBuyNow = () => {
    if (!inStock) {
      setError('该商品暂时缺货');
      return;
    }
    if (!isAuthenticated) {
      navigate('/login', { state: { from: fromPath } });
      return;
    }
    navigate('/checkout', {
      state: {
        buyNow: {
          product_id: shop.id,
          sku: shop.sku,
          title: shop.name,
          cover: shop.cover,
          price_cent: shop.price_cent,
          stock_summary: shop.stock_summary,
          qty,
        },
      },
    });
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-3xl font-semibold tabular-nums">
            {formatCentLabel(shop.price_cent)}
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            {inStock ? `现货 ${shop.stock_summary}` : '暂时缺货'}
            {shop.freight_hint ? ` · ${shop.freight_hint}` : ''}
          </p>
        </div>
        <div className="inline-flex items-center rounded-full border border-white/15 bg-black/30">
          <button
            type="button"
            aria-label="减少数量"
            disabled={qty <= 1 || busy || !inStock}
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="p-2.5 text-zinc-300 disabled:opacity-40"
          >
            <Minus size={16} strokeWidth={1.5} />
          </button>
          <span className="min-w-8 text-center text-sm tabular-nums">{qty}</span>
          <button
            type="button"
            aria-label="增加数量"
            disabled={qty >= maxQty || busy || !inStock}
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            className="p-2.5 text-zinc-300 disabled:opacity-40"
          >
            <Plus size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy || !inStock}
          onClick={() => void handleAddToCart()}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-white transition-colors hover:bg-white/5 disabled:opacity-50"
        >
          {busy ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ShoppingBag size={16} strokeWidth={1.5} />
          )}
          加入购物车
        </button>
        <button
          type="button"
          disabled={busy || !inStock}
          onClick={handleBuyNow}
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] disabled:opacity-50"
        >
          立即购买
        </button>
      </div>

      {hint ? <p className="mt-3 text-sm text-emerald-400">{hint}</p> : null}
      {error ? (
        <p className="mt-3 text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
