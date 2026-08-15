import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Plus } from 'lucide-react';
import { fetchDevices } from '../../api/devices';
import type { BoundDevice } from '../../api/types';
import PageFrame from '../app/PageFrame';
import AccountNav from '../app/AccountNav';
import EmptyState from '../app/EmptyState';

export default function DevicesPage() {
  const [devices, setDevices] = useState<BoundDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchDevices();
        if (!cancelled) setDevices(data ?? []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : '设备加载失败');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageFrame>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">我的设备</h1>
          <p className="mt-2 text-sm text-zinc-400">已绑定键盘（不展示 UID）</p>
        </div>
        <Link
          to="/account/devices/bind"
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-black"
        >
          <Plus size={16} strokeWidth={1.5} />
          绑定键盘
        </Link>
      </div>
      <div className="mt-6">
        <AccountNav />
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-zinc-500" size={28} />
          </div>
        ) : error ? (
          <EmptyState title="设备加载失败" description={error} />
        ) : devices.length === 0 ? (
          <EmptyState
            title="还没有绑定设备"
            description="输入出库 SN 完成激活绑定，积分以明细为准"
            actionLabel="去绑定"
            actionTo="/account/devices/bind"
          />
        ) : (
          devices.map((device) => (
            <div
              key={device.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-medium">{device.product_name}</h2>
                  {device.sku ? (
                    <p className="mt-1 text-xs text-zinc-500">{device.sku}</p>
                  ) : null}
                </div>
                <p className="font-mono text-sm tabular-nums text-zinc-300">
                  {device.sn_masked}
                </p>
              </div>
              <dl className="mt-3 grid gap-2 text-xs text-zinc-500 sm:grid-cols-2">
                <div>
                  绑定时间{' '}
                  <span className="text-zinc-300">
                    {device.bound_at
                      ? new Date(device.bound_at).toLocaleString('zh-CN')
                      : '—'}
                  </span>
                </div>
                <div>
                  激活时间{' '}
                  <span className="text-zinc-300">
                    {device.activated_at
                      ? new Date(device.activated_at).toLocaleString('zh-CN')
                      : '—'}
                  </span>
                </div>
              </dl>
            </div>
          ))
        )}
      </div>
    </PageFrame>
  );
}
