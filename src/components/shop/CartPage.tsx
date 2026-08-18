import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Minus, Plus, Trash2 } from 'lucide-react';
import { formatCentLabel } from '../../lib/money';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { BIND_MOBILE_PATH } from '../../lib/onboarding';
import PageFrame from '../app/PageFrame';
import ProductCover from '../app/ProductCover';
import EmptyState from '../app/EmptyState';

export default function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated, needsBindMobile } = useAuth();
  const { items, amountCent, loading, error, setQty } = useCart();

  /** 下架/删除的商品服务端返回 stock_summary=0，不可结算 */
  const invalidCount = items.filter((i) => i.stock_summary <= 0).length;

  const goCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    if (needsBindMobile) {
      navigate(BIND_MOBILE_PATH, { state: { from: '/checkout', required: true } });
      return;
    }
    navigate('/checkout');
  };

  return (
    <PageFrame>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">购物车</h1>
          <p className="mt-2 text-sm text-zinc-400">{items.length} 种商品</p>
        </div>
        <Link to="/products" className="text-sm text-zinc-400 hover:text-white">
          继续选购
        </Link>
      </div>

      {loading && items.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-zinc-500" size={28} />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="购物车是空的"
          description="去商城挑选你的下一台 UNIQMAG"
          actionLabel="浏览产品"
          actionTo="/products"
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-8">
            {items.map((item) => {
              const invalid = item.stock_summary <= 0;
              return (
                <div
                  key={item.product_id}
                  className={`flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 ${
                    invalid ? 'opacity-60' : ''
                  }`}
                >
                  <ProductCover
                    src={item.cover}
                    alt={item.title}
                    className="h-24 w-24 shrink-0 rounded-xl"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/products/${(item.sku || String(item.product_id)).toLowerCase()}`}
                        className="block truncate font-medium hover:text-white"
                      >
                        {item.title}
                      </Link>
                      {invalid ? (
                        <span className="shrink-0 rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-xs text-amber-300">
                          已下架/缺货
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">{item.sku}</p>
                    <p className="mt-2 tabular-nums text-white">
                      {formatCentLabel(item.price_cent)}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="inline-flex items-center rounded-full border border-white/15">
                        <button
                          type="button"
                          aria-label="减少"
                          disabled={invalid}
                          className="p-2 text-zinc-300 disabled:opacity-40"
                          onClick={() => void setQty(item.product_id, item.qty - 1)}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="min-w-8 text-center text-sm tabular-nums">{item.qty}</span>
                        <button
                          type="button"
                          aria-label="增加"
                          disabled={
                            invalid || item.qty >= 99 || item.qty >= item.stock_summary
                          }
                          className="p-2 text-zinc-300 disabled:opacity-40"
                          onClick={() => void setQty(item.product_id, item.qty + 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        type="button"
                        aria-label="移除"
                        className="p-2 text-zinc-500 hover:text-red-300"
                        onClick={() => void setQty(item.product_id, 0)}
                      >
                        <Trash2 size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {error ? <p className="text-sm text-amber-300">{error}</p> : null}
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-28 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-center justify-between text-sm text-zinc-400">
                <span>商品合计</span>
                <span className="text-xl font-semibold text-white tabular-nums">
                  {formatCentLabel(amountCent)}
                </span>
              </div>
              <p className="mt-2 text-xs text-zinc-500">运费将在结算页按规则计算</p>
              {invalidCount > 0 ? (
                <p className="mt-3 text-xs text-amber-300">
                  {invalidCount} 件商品已下架或缺货，移除后才能结算
                </p>
              ) : null}
              <button
                type="button"
                onClick={goCheckout}
                disabled={invalidCount > 0}
                className="mt-6 w-full rounded-full bg-white py-3 text-sm font-medium text-black transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] disabled:opacity-50"
              >
                {needsBindMobile ? '先绑定手机号' : '去结算'}
              </button>
            </div>
          </aside>
        </div>
      )}
    </PageFrame>
  );
}
