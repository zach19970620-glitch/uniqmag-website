import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, KeyRound, Loader2, Lock, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BIND_MOBILE_PATH, NICKNAME_PATH, sanitizeReturnTo } from '../lib/onboarding';
import WeChatQrPanel from './WeChatQrPanel';

const PHONE_RE = /^1[3-9]\d{9}$/;
const CODE_RE = /^\d{6}$/;
type LoginMode = 'code' | 'password' | 'wechat';

export default function Login() {
  const {
    loginWithCode,
    loginWithPassword,
    sendCode,
    isAuthenticated,
    needsProfile,
    bootstrapping,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const safeFrom = sanitizeReturnTo((location.state as { from?: string } | null)?.from);

  const [mode, setMode] = useState<LoginMode>('code');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  if (isAuthenticated) {
    const next = needsProfile ? NICKNAME_PATH : safeFrom;
    return (
      <Navigate
        to={next}
        replace
        state={next === NICKNAME_PATH ? { from: safeFrom } : undefined}
      />
    );
  }

  const redirectAfterAuth = (needBindMobile: boolean, isNewUser: boolean) => {
    if (needBindMobile) {
      navigate(BIND_MOBILE_PATH, { replace: true, state: { from: safeFrom } });
      return;
    }
    if (isNewUser) {
      navigate(NICKNAME_PATH, { replace: true, state: { from: safeFrom } });
      return;
    }
    navigate(safeFrom, { replace: true });
  };

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
    if (mode === 'wechat') return;
    setFeedback('');

    if (!PHONE_RE.test(phone)) {
      setStatus('error');
      setFeedback('请输入有效的中国大陆手机号');
      return;
    }

    if (mode === 'code') {
      if (!CODE_RE.test(code)) {
        setStatus('error');
        setFeedback('请输入 6 位验证码');
        return;
      }
      setStatus('loading');
      try {
        const result = await loginWithCode(phone, code);
        redirectAfterAuth(result.needBindMobile, result.isNewUser);
      } catch (err) {
        setStatus('error');
        setFeedback(err instanceof Error ? err.message : '登录失败，请稍后重试');
      }
      return;
    }

    if (password.length < 6) {
      setStatus('error');
      setFeedback('密码至少 6 位');
      return;
    }

    setStatus('loading');
    try {
      const result = await loginWithPassword(phone, password);
      redirectAfterAuth(result.needBindMobile, result.isNewUser);
    } catch (err) {
      setStatus('error');
      setFeedback(err instanceof Error ? err.message : '登录失败，请稍后重试');
    }
  };

  const busy = status === 'loading';

  return (
    <section className="relative z-10 min-h-screen flex items-center py-28">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute bottom-10 right-0 h-56 w-56 rounded-full bg-blue-600/15 blur-[80px]" />
      </div>

      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-md"
        >
          <div className="mb-10 text-center">
            <p className="mb-3 text-xs tracking-[0.28em] uppercase text-zinc-500">UNIQMAG ID</p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">登录账号</h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="glass-panel rounded-3xl border border-white/10 p-8 md:p-10 space-y-5"
          >
            <div className="flex p-1 rounded-xl bg-black/30 border border-white/10">
              {(
                [
                  { id: 'code', label: '验证码' },
                  { id: 'password', label: '密码' },
                  { id: 'wechat', label: '微信' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setMode(tab.id);
                    setFeedback('');
                    setStatus('idle');
                  }}
                  className={`flex-1 text-sm py-2.5 rounded-lg transition-colors ${
                    mode === tab.id
                      ? 'bg-white/10 text-white font-medium'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {mode === 'wechat' ? (
              <WeChatQrPanel returnTo={safeFrom} />
            ) : (
              <>
                <div className="space-y-2">
                  <label htmlFor="login-phone" className="text-sm font-medium text-zinc-300">
                    手机号
                  </label>
                  <div className="relative">
                    <Smartphone
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                    />
                    <input
                      id="login-phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={11}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      disabled={busy}
                      required
                      className="w-full bg-black/20 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-zinc-600 disabled:opacity-50"
                      placeholder="请输入手机号"
                    />
                  </div>
                </div>

                <div className="grid [&>*]:col-start-1 [&>*]:row-start-1">
                  <div
                    className={`space-y-2 transition-opacity duration-200 ${
                      mode === 'code' ? 'opacity-100' : 'opacity-0 pointer-events-none select-none'
                    }`}
                    aria-hidden={mode !== 'code'}
                  >
                    <label htmlFor="login-code" className="text-sm font-medium text-zinc-300">
                      验证码
                    </label>
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <KeyRound
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                        />
                        <input
                          id="login-code"
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={6}
                          value={code}
                          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          disabled={busy || mode !== 'code'}
                          required={mode === 'code'}
                          tabIndex={mode === 'code' ? 0 : -1}
                          className="w-full bg-black/20 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white tracking-[0.2em] focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-zinc-600 placeholder:tracking-normal disabled:opacity-50"
                          placeholder="6 位验证码"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendCode}
                        disabled={busy || sending || countdown > 0 || mode !== 'code'}
                        tabIndex={mode === 'code' ? 0 : -1}
                        className="shrink-0 min-w-[7.5rem] px-4 py-3 rounded-xl border border-white/10 text-sm text-zinc-200 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {sending ? (
                          <Loader2 size={16} className="animate-spin mx-auto" />
                        ) : countdown > 0 ? (
                          `${countdown}s`
                        ) : (
                          '获取验证码'
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-zinc-600">
                      开发环境验证码请查看后端日志（SMS_DEV_MODE）
                    </p>
                  </div>

                  <div
                    className={`space-y-2 transition-opacity duration-200 ${
                      mode === 'password'
                        ? 'opacity-100'
                        : 'opacity-0 pointer-events-none select-none'
                    }`}
                    aria-hidden={mode !== 'password'}
                  >
                    <label htmlFor="login-password" className="text-sm font-medium text-zinc-300">
                      密码
                    </label>
                    <div className="relative">
                      <Lock
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                      />
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={busy || mode !== 'password'}
                        required={mode === 'password'}
                        tabIndex={mode === 'password' ? 0 : -1}
                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-11 pr-12 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-zinc-600 disabled:opacity-50"
                        placeholder="请输入密码"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        tabIndex={mode === 'password' ? 0 : -1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                        aria-label={showPassword ? '隐藏密码' : '显示密码'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {feedback ? (
                  <p className={`text-sm ${status === 'error' ? 'text-red-400' : 'text-zinc-400'}`}>
                    {feedback}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-xl bg-white py-3.5 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {busy ? <Loader2 size={16} className="mx-auto animate-spin" /> : '登录'}
                </button>
              </>
            )}

            <p className="text-center text-sm text-zinc-500">
              还没有账号？{' '}
              <Link to="/register" className="text-zinc-300 hover:text-white">
                注册
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
