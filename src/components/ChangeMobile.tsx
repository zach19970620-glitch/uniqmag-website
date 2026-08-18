import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, Loader2, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CHANGE_MOBILE_PATH } from '../lib/onboarding';

const PHONE_RE = /^1[3-9]\d{9}$/;
const CODE_RE = /^\d{6}$/;

export default function ChangeMobile() {
  const { isAuthenticated, needsBindMobile, sendCode, changePhone, bootstrapping } = useAuth();
  const navigate = useNavigate();

  const [oldPhone, setOldPhone] = useState('');
  const [oldCode, setOldCode] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [oldCountdown, setOldCountdown] = useState(0);
  const [newCountdown, setNewCountdown] = useState(0);
  const [sendingOld, setSendingOld] = useState(false);
  const [sendingNew, setSendingNew] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (oldCountdown <= 0) return;
    const timer = window.setTimeout(() => setOldCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [oldCountdown]);

  useEffect(() => {
    if (newCountdown <= 0) return;
    const timer = window.setTimeout(() => setNewCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [newCountdown]);

  if (bootstrapping) {
    return (
      <section className="relative z-10 min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-500" size={28} />
      </section>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: CHANGE_MOBILE_PATH }} />;
  }

  if (needsBindMobile) {
    return <Navigate to="/onboarding/mobile" replace state={{ from: CHANGE_MOBILE_PATH }} />;
  }

  const send = async (which: 'old' | 'new') => {
    const target = which === 'old' ? oldPhone : phone;
    setFeedback('');
    if (!PHONE_RE.test(target)) {
      setStatus('error');
      setFeedback(which === 'old' ? '请输入当前完整手机号' : '请输入有效的新手机号');
      return;
    }
    if (which === 'old') setSendingOld(true);
    else setSendingNew(true);
    try {
      const result = await sendCode(target);
      if (which === 'old') setOldCountdown(result.retry_after || 60);
      else setNewCountdown(result.retry_after || 60);
      setStatus('idle');
    } catch (err) {
      setStatus('error');
      setFeedback(err instanceof Error ? err.message : '验证码发送失败');
    } finally {
      if (which === 'old') setSendingOld(false);
      else setSendingNew(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback('');
    if (!PHONE_RE.test(oldPhone)) {
      setStatus('error');
      setFeedback('请输入当前完整手机号');
      return;
    }
    if (!PHONE_RE.test(phone)) {
      setStatus('error');
      setFeedback('请输入有效的新手机号');
      return;
    }
    if (!CODE_RE.test(oldCode) || !CODE_RE.test(code)) {
      setStatus('error');
      setFeedback('请输入 6 位验证码');
      return;
    }
    if (oldPhone === phone) {
      setStatus('error');
      setFeedback('新手机号不能与当前号相同');
      return;
    }

    setStatus('loading');
    try {
      await changePhone({
        old_mobile: oldPhone,
        old_code: oldCode,
        mobile: phone,
        code,
      });
      navigate('/account', { replace: true });
    } catch (err) {
      setStatus('error');
      setFeedback(err instanceof Error ? err.message : '更换失败，请稍后重试');
    }
  };

  const busy = status === 'loading';

  const codeField = (
    id: string,
    value: string,
    onChange: (v: string) => void,
    onSend: () => void,
    sending: boolean,
    countdown: number,
  ) => (
    <div className="flex gap-3">
      <div className="relative flex-1">
        <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
          disabled={busy}
          required
          className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 tracking-[0.2em] text-white transition-all placeholder:tracking-normal placeholder:text-zinc-600 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50"
          placeholder="6 位验证码"
        />
      </div>
      <button
        type="button"
        onClick={onSend}
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
  );

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
            <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">更换手机号</h1>
            <p className="text-sm leading-relaxed text-zinc-400">
              请输入当前完整号码（不是带 * 的脱敏号），并分别验证新旧手机号。
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="glass-panel space-y-5 rounded-3xl border border-white/10 p-8 md:p-10"
          >
            <div className="space-y-2">
              <label htmlFor="change-old-phone" className="text-sm font-medium text-zinc-300">
                当前手机号
              </label>
              <div className="relative">
                <Smartphone
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                  id="change-old-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={11}
                  value={oldPhone}
                  onChange={(e) => setOldPhone(e.target.value.replace(/\D/g, ''))}
                  disabled={busy}
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-white transition-all placeholder:text-zinc-600 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50"
                  placeholder="11 位完整号码"
                />
              </div>
              {codeField(
                'change-old-code',
                oldCode,
                setOldCode,
                () => void send('old'),
                sendingOld,
                oldCountdown,
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="change-new-phone" className="text-sm font-medium text-zinc-300">
                新手机号
              </label>
              <div className="relative">
                <Smartphone
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                  id="change-new-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={11}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  disabled={busy}
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-white transition-all placeholder:text-zinc-600 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50"
                  placeholder="未注册的新号码"
                />
              </div>
              {codeField(
                'change-new-code',
                code,
                setCode,
                () => void send('new'),
                sendingNew,
                newCountdown,
              )}
            </div>

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : '确认更换'}
            </button>

            {feedback ? (
              <p className="text-center text-sm text-red-400" role="alert">
                {feedback}
              </p>
            ) : null}

            <Link
              to="/account"
              className="block w-full text-center text-sm text-zinc-500 transition-colors hover:text-zinc-300"
            >
              返回个人中心
            </Link>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
