import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { fetchOrders } from '../../api/orders';
import type { OrderSummary } from '../../api/types';
import { formatCentLabel } from '../../lib/money';
import { ORDER_STATUS_FILTERS } from '../../lib/orderStatus';
import PageFrame from '../app/PageFrame';
import AccountNav from '../app/AccountNav';
import StatusBadge from '../app/StatusBadge';
import EmptyState from '../app/EmptyState';

const PAGE_SIZE = 10;

export default function OrdersPage() {
  const [status, setStatus] = useState('');
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);
      setError('');
      try {
        const data = await fetchOrders({
          page,
          page_size: PAGE_SIZE,
          status: status || undefined,
        });
        if (cancelled) return;
        setOrders((prev) => (page === 1 ? data.list ?? [] : [...prev, ...(data.list ?? [])]));
        setTotal(data.total ?? 0);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : '订单加载失败');
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, page]);

  const changeStatus = (value: string) => {
    setStatus(value);
    setPage(1);
  };
  const hasMore = orders.length < total;

  return (
    <PageFrame>
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">我的订单</h1>
      <div className="mt-6">
        <AccountNav />
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {ORDER_STATUS_FILTERS.map((filter) => (
          <button
            key={filter.label}
            type="button"
            onClick={() => changeStatus(filter.value)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm transition-colors ${
              status === filter.value
                ? 'bg-white text-black font-medium'
                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-zinc-500" size={28} />
          </div>
        ) : error ? (
          <EmptyState title="订单加载失败" description={error} />
        ) : orders.length === 0 ? (
          <EmptyState
            title="暂无订单"
            description="下单后会显示在这里"
            actionLabel="去商城"
            actionTo="/products"
          />
        ) : (
          orders.map((order) => (
            <Link
              key={order.id}
              to={`/account/orders/${order.id}`}
              className="block rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 transition-colors hover:border-white/20"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm tabular-nums text-zinc-400">{order.order_no}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {new Date(order.created_at).toLocaleString('zh-CN')}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div className="mt-3 flex items-center justify-between gap-4">
                <p className="truncate text-sm text-zinc-300">
                  {order.items?.map((i) => i.title).join('、') || '查看明细'}
                </p>
                <p className="shrink-0 font-medium tabular-nums">
                  {formatCentLabel(order.amount_cent)}
                </p>
              </div>
            </Link>
          ))
        )}
        {!loading && hasMore ? (
          <button
            type="button"
            disabled={loadingMore}
            onClick={() => setPage((p) => p + 1)}
            className="mx-auto mt-2 flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            {loadingMore ? <Loader2 size={14} className="animate-spin" /> : null}
            加载更多（{orders.length}/{total}）
          </button>
        ) : null}
      </div>
    </PageFrame>
  );
}
