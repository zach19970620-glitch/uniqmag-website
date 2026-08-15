import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { fetchPoints } from '../../api/points';
import type { PointsEntry } from '../../api/types';
import PageFrame from '../app/PageFrame';
import AccountNav from '../app/AccountNav';
import EmptyState from '../app/EmptyState';

const REASON_LABELS: Record<string, string> = {
  register: '注册奖励',
  order: '下单奖励',
  order_refund: '订单退款扣回',
  activate: '激活奖励',
  adjust: '人工调整',
};

const PAGE_SIZE = 20;

export default function PointsPage() {
  const [balance, setBalance] = useState(0);
  const [list, setList] = useState<PointsEntry[]>([]);
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
      try {
        const data = await fetchPoints({ page, page_size: PAGE_SIZE });
        if (cancelled) return;
        setBalance(data.balance ?? 0);
        setList((prev) => (page === 1 ? data.list ?? [] : [...prev, ...(data.list ?? [])]));
        setTotal(data.total ?? 0);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : '积分加载失败');
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
  }, [page]);

  const hasMore = list.length < total;

  return (
    <PageFrame>
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">积分明细</h1>
      <p className="mt-2 text-sm text-zinc-400">只展示流水，不含宣传文案</p>
      <div className="mt-6">
        <AccountNav />
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-8">
        <p className="text-sm text-zinc-400">当前积分</p>
        <p className="mt-2 text-4xl font-semibold tabular-nums">
          {loading ? '—' : balance}
        </p>
      </div>

      <div className="mt-6 space-y-2">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-zinc-500" size={28} />
          </div>
        ) : error ? (
          <EmptyState title="积分加载失败" description={error} />
        ) : list.length === 0 ? (
          <EmptyState
            title="暂无积分流水"
            description="绑定设备激活或完成订单后会产生积分"
            actionLabel="绑定键盘"
            actionTo="/account/devices/bind"
          />
        ) : (
          list.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {REASON_LABELS[entry.reason_code] ?? entry.reason_code}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {new Date(entry.created_at).toLocaleString('zh-CN')}
                  {entry.remark ? ` · ${entry.remark}` : ''}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`font-medium tabular-nums ${
                    entry.delta >= 0 ? 'text-emerald-300' : 'text-zinc-300'
                  }`}
                >
                  {entry.delta >= 0 ? `+${entry.delta}` : entry.delta}
                </p>
                <p className="text-xs text-zinc-500 tabular-nums">余额 {entry.balance_after}</p>
              </div>
            </div>
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
            加载更多（{list.length}/{total}）
          </button>
        ) : null}
      </div>
    </PageFrame>
  );
}
