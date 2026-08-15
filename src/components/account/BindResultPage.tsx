import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { fetchBindResult } from '../../api/devices';
import { maskSn } from '../../lib/keyboardHid';
import PageFrame from '../app/PageFrame';

export default function BindResultPage() {
  const [params] = useSearchParams();
  const sn = params.get('sn') ?? '';
  const okParam = params.get('ok');
  const messageParam = params.get('message');
  const pointsParam = params.get('points');

  const [loading, setLoading] = useState(Boolean(sn) && okParam == null);
  const [success, setSuccess] = useState(okParam === '1');
  const [message, setMessage] = useState(messageParam ?? '');
  const [points, setPoints] = useState<number | null>(
    pointsParam != null ? Number(pointsParam) : null,
  );

  useEffect(() => {
    if (!sn || okParam != null) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchBindResult({ sn });
        if (cancelled) return;
        setSuccess(Boolean(data.success));
        setMessage(data.message ?? '');
        setPoints(data.points_delta ?? null);
      } catch (err) {
        if (!cancelled) {
          setSuccess(false);
          setMessage(err instanceof Error ? err.message : '查询失败');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sn, okParam]);

  return (
    <PageFrame narrow>
      <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-1.5">
        <div className="rounded-[calc(1.75rem-0.375rem)] border border-white/10 bg-black/30 px-6 py-12 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
          {loading ? (
            <Loader2 className="mx-auto animate-spin text-zinc-400" size={28} />
          ) : (
            <>
              <h1 className="text-2xl font-bold md:text-3xl">
                {success ? '绑定成功' : '绑定失败'}
              </h1>
              {sn ? (
                <p className="mt-3 font-mono text-sm text-zinc-400">{maskSn(sn)}</p>
              ) : null}
              {message ? <p className="mt-4 text-sm text-zinc-300">{message}</p> : null}
              {success && points != null && !Number.isNaN(points) ? (
                <p className="mt-3 text-sm text-emerald-300">
                  积分变动 {points >= 0 ? `+${points}` : points}（以积分明细为准）
                </p>
              ) : null}
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  to="/account/devices"
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black"
                >
                  查看设备
                </Link>
                {!success ? (
                  <Link
                    to="/account/devices/bind"
                    className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-200"
                  >
                    重新绑定
                  </Link>
                ) : (
                  <Link
                    to="/account/points"
                    className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-200"
                  >
                    积分明细
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </PageFrame>
  );
}
