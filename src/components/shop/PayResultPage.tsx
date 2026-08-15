import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { fetchPayParams, fetchPayResult } from '../../api/orders';
import type { PayResult } from '../../api/types';
import { formatCentLabel } from '../../lib/money';
import { orderStatusLabel } from '../../lib/orderStatus';
import { payQrFromParams, peekPayQr, startPay, stashPayQr } from '../../lib/pay';
import PageFrame from '../app/PageFrame';
import WeChatPayQr from './WeChatPayQr';

export default function PayResultPage() {
  const [params] = useSearchParams();
  const orderId = params.get('order_id') ?? params.get('orderId') ?? undefined;
  // 支付宝同步回跳会在 URL 上带 out_trade_no（= order_no）
  const orderNo =
    params.get('order_no') ?? params.get('orderNo') ?? params.get('out_trade_no') ?? undefined;
  const channel = params.get('channel');
  const [result, setResult] = useState<PayResult | null>(null);
  const [qrCode, setQrCode] = useState(() => (orderId ? peekPayQr(orderId) : null));
  const [error, setError] = useState('');
  const [polling, setPolling] = useState(true);
  const [timedOut, setTimedOut] = useState(false);
  const [repaying, setRepaying] = useState(false);
  const [pollRound, setPollRound] = useState(0);

  const wechatQr = channel === 'wechat' || Boolean(qrCode);
  const paidStatuses = ['paid', 'shipped', 'completed', 'refunded', 'cancelled'];

  const handleRepay = async () => {
    const target = result?.order_id ?? orderId;
    if (!target) return;
    setRepaying(true);
    const resultPath = await startPay({
      orderId: target,
      orderNo: result?.order_no ?? orderNo,
      channel: channel === 'wechat' || channel === 'alipay' ? channel : undefined,
    });
    if (resultPath) {
      const nextQr = peekPayQr(target);
      if (nextQr) setQrCode(nextQr);
      setRepaying(false);
      setTimedOut(false);
      setPolling(true);
      setPollRound((n) => n + 1);
    }
  };

  useEffect(() => {
    if (!orderId || channel !== 'wechat') return;
    let cancelled = false;
    (async () => {
      try {
        const pay = await fetchPayParams(orderId);
        if (cancelled) return;
        const qr = payQrFromParams(pay);
        if (qr) {
          stashPayQr(orderId, qr);
          setQrCode(qr);
        }
      } catch (err) {
        if (!cancelled && !peekPayQr(orderId)) {
          setError(err instanceof Error ? err.message : '获取支付二维码失败');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId, channel, pollRound]);

  useEffect(() => {
    if (!orderId && !orderNo) {
      setError('缺少订单信息');
      setPolling(false);
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = wechatQr ? 120 : 12;

    // 回跳/出码后立即查一次；未支付则每 2.5s 轮询。微信扫码给更长等待。
    const tick = async () => {
      try {
        const data = await fetchPayResult({ order_id: orderId, order_no: orderNo });
        if (cancelled) return;
        setResult(data);
        setError('');
        if (data.paid || paidStatuses.includes(data.status)) {
          setPolling(false);
          return;
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : '查询失败');
      }

      attempts += 1;
      if (attempts >= maxAttempts) {
        if (!cancelled) {
          setPolling(false);
          setTimedOut(true);
        }
        return;
      }
      window.setTimeout(() => {
        if (!cancelled) void tick();
      }, 2500);
    };

    void tick();
    return () => {
      cancelled = true;
    };
    // wechatQr 仅用于决定轮询时长，出码后不应重置计时器
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, orderNo, pollRound]);

  const paid = Boolean(result?.paid || result?.status === 'paid' || result?.status === 'shipped');
  const showQr = Boolean(
    !paid &&
      (qrCode || channel === 'wechat') &&
      (!result || result.status === 'pending_pay'),
  );
  const awaiting = polling && !result && !showQr;

  return (
    <PageFrame narrow>
      <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-1.5">
        <div className="rounded-[calc(1.75rem-0.375rem)] border border-white/10 bg-black/30 px-6 py-12 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] md:px-10">
          {awaiting ? (
            <>
              <Loader2 className="mx-auto animate-spin text-zinc-400" size={28} />
              <h1 className="mt-6 text-2xl font-bold">正在确认支付结果</h1>
              <p className="mt-2 text-sm text-zinc-400">请稍候，勿关闭页面</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold md:text-3xl">
                {paid ? '支付成功' : showQr ? '微信扫码支付' : result ? '支付处理中' : '支付结果'}
              </h1>
              {showQr ? <WeChatPayQr value={qrCode ?? ''} /> : null}
              {showQr && polling ? (
                <p className="mt-4 inline-flex items-center gap-2 text-sm text-zinc-400">
                  <Loader2 size={14} className="animate-spin" />
                  等待支付结果
                </p>
              ) : null}
              {result ? (
                <div className="mx-auto mt-6 max-w-xs space-y-2 text-sm text-zinc-400">
                  <p>
                    订单号{' '}
                    <span className="text-white tabular-nums">{result.order_no}</span>
                  </p>
                  <p>
                    金额{' '}
                    <span className="text-white tabular-nums">
                      {formatCentLabel(result.amount_cent)}
                    </span>
                  </p>
                  <p>
                    状态{' '}
                    <span className="text-white">{orderStatusLabel(result.status)}</span>
                  </p>
                  {result.paid_at ? (
                    <p>
                      支付时间{' '}
                      <span className="text-white">
                        {new Date(result.paid_at).toLocaleString('zh-CN')}
                      </span>
                    </p>
                  ) : null}
                  {result.message ? <p>{result.message}</p> : null}
                </div>
              ) : null}
              {timedOut && !paid ? (
                <p className="mt-4 text-sm text-zinc-400">
                  {showQr
                    ? '仍在等待扫码。若已支付，请稍后在「我的订单」中查看'
                    : '若已完成支付，请稍后在「我的订单」中查看'}
                </p>
              ) : null}
              {error ? <p className="mt-4 text-sm text-amber-300">{error}</p> : null}
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {!paid && result?.status === 'pending_pay' ? (
                  <button
                    type="button"
                    onClick={() => void handleRepay()}
                    disabled={repaying}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black disabled:opacity-60"
                  >
                    {repaying ? <Loader2 size={14} className="animate-spin" /> : null}
                    {showQr ? '刷新二维码' : '重新拉起支付'}
                  </button>
                ) : null}
                {result?.order_id ? (
                  <Link
                    to={`/account/orders/${result.order_id}`}
                    className={`rounded-full px-5 py-2.5 text-sm ${
                      !paid && result.status === 'pending_pay'
                        ? 'border border-white/15 text-zinc-200'
                        : 'bg-white font-medium text-black'
                    }`}
                  >
                    查看订单
                  </Link>
                ) : null}
                <Link
                  to="/products"
                  className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-200"
                >
                  返回产品
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </PageFrame>
  );
}
