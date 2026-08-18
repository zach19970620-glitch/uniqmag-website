import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { takeAuthFrom } from './WeChatQrPanel';
import { BIND_MOBILE_PATH, NICKNAME_PATH } from '../lib/onboarding';

export default function WeChatCallback() {
  const [searchParams] = useSearchParams();
  const { loginWithWechat, isAuthenticated, needsProfile, bootstrapping } =
    useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    if (bootstrapping) return;
    const code = searchParams.get('code')?.trim() || '';
    const state = searchParams.get('state')?.trim() || '';
    if (!code || !state) {
      setError('缺少微信授权参数，请返回重新扫码');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const result = await loginWithWechat(code, state);
        if (cancelled) return;
        const to = takeAuthFrom('/account');
        if (result.needBindMobile) {
          navigate(BIND_MOBILE_PATH, { replace: true, state: { from: to } });
          return;
        }
        navigate(result.isNewUser ? NICKNAME_PATH : to, {
          replace: true,
          state: result.isNewUser ? { from: to } : undefined,
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '微信登录失败');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // Intentionally once per code/state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootstrapping]);

  if (bootstrapping) {
    return (
      <section className="relative z-10 flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-zinc-500" size={28} />
      </section>
    );
  }

  if (isAuthenticated && !error) {
    const code = searchParams.get('code')?.trim();
    const state = searchParams.get('state')?.trim();
    // 已登录且无授权参数：离开回调页。有 code 时交给 effect，避免抢掉 returnTo。
    if (!code || !state) {
      const next = needsProfile ? NICKNAME_PATH : '/account';
      return <Navigate to={next} replace />;
    }
  }

  return (
    <section className="relative z-10 flex min-h-screen items-center justify-center px-6">
      <div className="glass-panel w-full max-w-md rounded-3xl border border-white/10 p-10 text-center">
        {error ? (
          <>
            <h1 className="text-xl font-bold">微信登录失败</h1>
            <p className="mt-3 text-sm text-red-400">{error}</p>
            <Link
              to="/login"
              className="mt-8 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black"
            >
              返回登录
            </Link>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto animate-spin text-zinc-400" size={28} />
            <p className="mt-4 text-sm text-zinc-400">正在完成微信登录…</p>
          </>
        )}
      </div>
    </section>
  );
}
