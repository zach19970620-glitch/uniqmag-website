import { useState } from 'react';
import { ArrowRight, Loader2, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useShopCatalog } from '../hooks/useShopCatalog';
import { formatCentLabel } from '../lib/money';
import {
  productContentList,
  type ProductContent,
} from '../lib/productCatalog';
import type { ShopProduct } from '../api/types';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductCard = ({
  product,
  shop,
  shopLoading,
}: {
  product: ProductContent;
  shop?: ShopProduct;
  shopLoading: boolean;
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [activeColorIdx, setActiveColorIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState('');
  const [error, setError] = useState('');
  const activeColor = product.colors[activeColorIdx];
  const canBuy = Boolean(shop && shop.status !== 'off' && shop.stock_summary > 0);

  const requireLogin = () => {
    if (isAuthenticated) return false;
    navigate('/login', { state: { from: '/products' } });
    return true;
  };

  const handleAddToCart = async () => {
    if (!shop || requireLogin()) return;
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
        qty: 1,
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
    if (!shop || requireLogin()) return;
    navigate('/checkout', {
      state: {
        buyNow: {
          product_id: shop.id,
          sku: shop.sku,
          title: shop.name,
          cover: shop.cover,
          price_cent: shop.price_cent,
          stock_summary: shop.stock_summary,
          qty: 1,
        },
      },
    });
  };

  return (
    <div className="glass-panel group flex flex-col overflow-hidden rounded-3xl p-1 glass-panel-hover">
      <div className="relative flex h-96 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-white/5 to-transparent p-2 sm:h-[420px]">
        <img
          key={activeColor.image}
          src={activeColor.image}
          alt={`${product.name} - ${activeColor.name}`}
          className="animate-in fade-in zoom-in-95 relative z-10 h-full w-full scale-110 object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-125"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[100px] transition-all duration-500 group-hover:opacity-40"
          style={{ backgroundColor: activeColor.hex }}
        />
      </div>

      <div className="flex flex-grow flex-col p-8">
        <div className="mb-4 flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300"
            >
              {tag}
            </span>
          ))}
        </div>

        <h3 className="mb-2 text-3xl font-bold">{product.name}</h3>
        <p className="mb-4 h-12 text-zinc-400">{product.slogan}</p>

        <div className="mb-6 min-h-7 text-sm">
          {shopLoading ? (
            <span className="text-zinc-500">同步价格中…</span>
          ) : shop ? (
            <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-xl font-semibold text-white tabular-nums">
                {formatCentLabel(shop.price_cent)}
              </span>
              <span className="text-zinc-500">
                {shop.stock_summary > 0 ? `现货 ${shop.stock_summary}` : '暂时缺货'}
              </span>
            </span>
          ) : (
            <span className="text-zinc-500">详情页了解产品</span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {product.colors.map((color, idx) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveColorIdx(idx);
                  }}
                  className={`h-6 w-6 rounded-full transition-all duration-300 ${
                    activeColorIdx === idx
                      ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-black'
                      : 'opacity-70 hover:scale-110 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                  aria-label={color.name}
                />
              ))}
            </div>
            <span className="ml-2 hidden text-sm text-zinc-400 sm:block">
              {activeColor.name}
            </span>
          </div>

          <Link
            to={`/products/${product.id}`}
            className="flex shrink-0 items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <span>详情</span>
            <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </div>

        {canBuy ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleAddToCart()}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/5 disabled:opacity-50"
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
              disabled={busy}
              onClick={handleBuyNow}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-zinc-200 active:scale-[0.98] disabled:opacity-50"
            >
              立即购买
            </button>
          </div>
        ) : (
          <div className="mt-4">
            <Link
              to={`/products/${product.id}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 font-medium text-white transition-all hover:bg-white hover:text-black"
            >
              <span>了解更多</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {hint ? <p className="mt-3 text-sm text-emerald-400">{hint}</p> : null}
        {error ? (
          <p className="mt-3 text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
};

const Products = () => {
  const { forContent, loading } = useShopCatalog();

  return (
    <section id="products" className="relative z-10 flex min-h-screen items-center py-32">
      <div className="container mx-auto mt-12 px-6">
        <div className="mb-20 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gradient md:text-5xl">
            探索磁悬浮系列
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            专为竞技玩家与专业人士打造，将精密工程与前沿科技完美融合。现货可直接下单。
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          {productContentList.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              shop={forContent(product)}
              shopLoading={loading}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;
