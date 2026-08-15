import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { fetchOrder, refundOrder, confirmOrder } from '../../api/orders';
import type { OrderDetail } from '../../api/types';
import { formatCentLabel } from '../../lib/money';
import { startPay } from '../../lib/pay';
import PageFrame from '../app/PageFrame';
import AccountNav from '../app/AccountNav';
import StatusBadge from '../app/StatusBadge';
import ProductCover from '../app/ProductCover';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [hint, setHint] = useState('');

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchOrder(id);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '订单加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRefund = async () => {
    if (!order || order.status !== 'paid') return;
    if (!window.confirm('确认申请全额退款？仅未发货订单可退。')) return;
    setBusy(true);
    setError('');
    try {
      await refundOrder(order.id);
      setHint('退款已提交');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : '退款失败');
    } finally {
      setBusy(false);
    }
  };

  const handleConfirm = async () => {
    if (!order || order.status !== 'shipped') return;
    if (!window.confirm('确认已收到货物？确认后订单将完成。')) return;
    setBusy(true);
    setError('');
    setHint('');
    try {
      await confirmOrder(order.id);
      setHint('已确认收货');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : '确认收货失败');
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageFrame>
      <Link to="/account/orders" className="text-sm text-zinc-400 hover:text-white">
        ← 订单列表
      </Link>
      <div className="mt-6">
        <AccountNav />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-zinc-500" size={28} />
        </div>
      ) : error && !order ? (
        <p className="mt-10 text-center text-zinc-400">{error}</p>
      ) : order ? (
        <div className="mt-8 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">订单详情</h1>
              <p className="mt-2 text-sm tabular-nums text-zinc-400">{order.order_no}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="mb-3 text-sm text-zinc-400">商品</h2>
            <ul className="space-y-4">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-4">
                  <ProductCover
                    src={item.cover}
                    alt={item.title}
                    className="h-16 w-16 rounded-xl"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {item.sku} × {item.qty}
                    </p>
                    {item.sn_list?.length ? (
                      <p className="mt-1 text-xs text-zinc-400">
                        SN：{item.sn_list.join('、')}
                      </p>
                    ) : null}
                  </div>
                  <p className="tabular-nums">{formatCentLabel(item.price_cent * item.qty)}</p>
                </li>
              ))}
            </ul>
          </section>

          {order.address_snapshot ? (
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm">
              <h2 className="mb-3 text-zinc-400">收货信息</h2>
              <p>
                {order.address_snapshot.name} {order.address_snapshot.mobile}
              </p>
              <p className="mt-1 text-zinc-300">
                {order.address_snapshot.province}
                {order.address_snapshot.city}
                {order.address_snapshot.district}
                {order.address_snapshot.detail}
              </p>
            </section>
          ) : null}

          {(order.express_no || order.express_company) && (
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm">
              <h2 className="mb-3 text-zinc-400">物流</h2>
              <p>
                {order.express_company || '快递'} {order.express_no}
              </p>
              {order.shipped_at ? (
                <p className="mt-1 text-zinc-500">
                  发货时间 {new Date(order.shipped_at).toLocaleString('zh-CN')}
                </p>
              ) : null}
              {order.status === 'shipped' ? (
                <p className="mt-2 text-xs text-zinc-500">
                  发货满 10 天将自动确认收货
                </p>
              ) : null}
            </section>
          )}

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">商品+运费</span>
              <span className="tabular-nums">
                {formatCentLabel(order.amount_cent)}（含运费{' '}
                {formatCentLabel(order.freight_cent)}）
              </span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="text-zinc-400">支付渠道</span>
              <span>
                {order.pay_channel === 'wechat'
                  ? '微信'
                  : order.pay_channel === 'alipay'
                    ? '支付宝'
                    : '—'}
              </span>
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            {order.status === 'shipped' ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleConfirm()}
                className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black disabled:opacity-50"
              >
                {busy ? '提交中...' : '确认收货'}
              </button>
            ) : null}

            {order.status === 'paid' ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleRefund()}
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-200 hover:bg-white/5 disabled:opacity-50"
              >
                {busy ? '提交中...' : '申请全额退款'}
              </button>
            ) : null}

            {order.status === 'pending_pay' ? (
              <button
                type="button"
                disabled={paying}
                onClick={async () => {
                  setPaying(true);
                  const resultPath = await startPay({
                    orderId: order.id,
                    orderNo: order.order_no,
                    channel: order.pay_channel ?? undefined,
                  });
                  if (resultPath) {
                    setPaying(false);
                    navigate(resultPath);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black disabled:opacity-60"
              >
                {paying ? <Loader2 size={14} className="animate-spin" /> : null}
                继续支付
              </button>
            ) : null}
          </div>

          {hint ? <p className="text-sm text-emerald-400">{hint}</p> : null}
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </div>
      ) : null}
    </PageFrame>
  );
}
