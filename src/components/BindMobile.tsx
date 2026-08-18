import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, Loader2, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  BIND_MOBILE_PATH,
  NICKNAME_PATH,
  sanitizeReturnTo,
  skipBindDestination,
  type OnboardingHandoff,
} from '../lib/onboarding';

const PHONE_RE = /^1[3-9]\d{9}$/;
const CODE_RE = /^\d{6}$/;

export default function BindMobile() {
  const { isAuthenticated, needsBindMobile, needsProfile, sendCode, bindPhone, logout, bootstrapping } =
    useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const handoff = (location.state as OnboardingHandoff | null) ?? {};
  const returnTo = sanitizeReturnTo(handoff.from);

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  if (bootstrapping) {
    return (
      <section className="relative z-10 min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-500" size={28} />
      </section>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: BIND_MOBILE_PATH }} />;
  }

  if (!needsBindMobile) {
    return (
      <Navigate
        to={needsProfile ? NICKNAME_PATH : returnTo}
        replace
        state={needsProfile ? { from: returnTo, resume: handoff.resume } : handoff.resume}
      />
    );
  }

  const handleSendCode = async () => {
    setFeedback('');
    if (!PHONE_RE.test(phone)) {
      setStatus('error');
      setFeedback('请输入有效的中国大陆手机号');
      return;
    }
    setSending(true);
    try {
      const result = await sendCode(phone);
      setCountdown(result.retry_after || 60);
      setStatus('idle');
    } catch (err) {
      setStatus('error');
      setFeedback(err instanceof Error ? err.message : '验证码发送失败');
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback('');
    if (!PHONE_RE.test(phone)) {
      setStatus('error');
      setFeedback('请输入有效的中国大陆手机号');
      return;
    }
    if (!CODE_RE.test(code)) {
      setStatus('error');
      setFeedback('请输入 6 位验证码');
      return;
    }

    setStatus('loading');
    try {
      const result = await bindPhone(phone, code);
      const next = !result.user.profile_completed
        ? NICKNAME_PATH
        : sanitizeReturnTo(handoff.from);
      if (next === NICKNAME_PATH) {
        navigate(next, { replace: true, state: { from: returnTo, resume: handoff.resume } });
      } else {
        navigate(next, { replace: true, state: handoff.resume });
      }
    } catch (err) {
      setStatus('error');
      setFeedback(err instanceof Error ? err.message : '绑定失败，请稍后重试');
    }
  };

  const busy = status === 'loading';

  return (
    <section className="relative z-10 min-h-screen flex items-center py-28">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/25 blur-[100px]" />
        <div className="absolute bottom-16 right-1/4 h-48 w-72 rounded-full bg-cyan-500/10 blur-[80px]" />
      </div>

      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-md"
        >
          <div className="mb-10 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-700 shadow-[0_0_30px_rgba(102,105,227,0.35)]">
              <Smartphone size={20} />
            </div>
            <p className="mb-3 text-xs tracking-[0.28em] uppercase text-zinc-500">UNIQMAG ID</p>
            <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">绑定手机号</h1>
            <p className="text-sm leading-relaxed text-zinc-400">
              绑定后才能下单、管理地址与设备。可先跳过，之后在个人中心随时绑定。
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="glass-panel space-y-5 rounded-3xl border border-white/10 p-8 md:p-10"
          >
            <div className="space-y-2">
              <label htmlFor="bind-phone" className="text-sm font-medium text-zinc-300">
                手机号
              </label>
              <div className="relative">
                <Smartphone
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                  id="bind-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  autoFocus
                  maxLength={11}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  disabled={busy}
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-white transition-all placeholder:text-zinc-600 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50"
                  placeholder="请输入手机号"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="bind-code" className="text-sm font-medium text-zinc-300">
                验证码
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <KeyRound
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                  />
                  <input
                    id="bind-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={busy}
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 tracking-[0.2em] text-white transition-all placeholder:tracking-normal placeholder:text-zinc-600 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50"
                    placeholder="6 位验证码"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void handleSendCode()}
                  disabled={busy || sending || countdown > 0}
                  className="min-w-[7.5rem] shrink-0 rounded-xl border border-white/10 px-4 py-3 text-sm text-zinc-200 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 size={16} className="mx-auto animate-spin" />
                  ) : countdown > 0 ? (
                    `${countdown}s`
                  ) : (
                    '获取验证码'
                  )}
                </button>
              </div>
              <p className="text-xs text-zinc-600">开发环境验证码请查看后端日志（SMS_DEV_MODE）</p>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : '确认绑定'}
            </button>

            {feedback ? (
              <p className="text-center text-sm text-red-400" role="alert">
                {feedback}
              </p>
            ) : null}

            <button
              type="button"
              onClick={() => {
                const next = skipBindDestination(handoff.from, needsProfile);
                navigate(next.path, { replace: true, state: next.state });
              }}
              className="w-full text-center text-sm text-zinc-300 transition-colors hover:text-white"
            >
              {handoff.required ? '暂时不绑，回个人中心' : '暂时跳过'}
            </button>

            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login', { replace: true });
              }}
              className="w-full text-center text-sm text-zinc-500 transition-colors hover:text-zinc-300"
            >
              换个账号登录
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
