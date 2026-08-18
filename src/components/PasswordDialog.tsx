import { useEffect, useState, type FormEvent } from 'react';
import { Eye, EyeOff, KeyRound, Loader2, Lock, Smartphone, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PHONE_RE = /^1[3-9]\d{9}$/;
const CODE_RE = /^\d{6}$/;

export type PasswordDialogMode = 'forgot' | 'set' | 'change';

const COPY: Record<PasswordDialogMode, { title: string; hint: string; submit: string }> = {
  forgot: {
    title: '重置密码',
    hint: '用短信验证码设置新的登录密码，成功后将直接登录。',
    submit: '确认并登录',
  },
  set: {
    title: '设置密码',
    hint: '验证码将发到当前绑定手机号。设置后可用密码登录。',
    submit: '确认设置',
  },
  change: {
    title: '修改密码',
    hint: '请输入当前密码和新密码。忘记当前密码请先退出，在登录页重置。',
    submit: '确认修改',
  },
};

interface PasswordDialogProps {
  open: boolean;
  mode: PasswordDialogMode;
  initialMobile?: string;
  maskedMobile?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PasswordDialog({
  open,
  mode,
  initialMobile = '',
  maskedMobile = '',
  onClose,
  onSuccess,
}: PasswordDialogProps) {
  const { sendCode, sendMyCode, setPassword: savePassword, changePassword, resetPassword } = useAuth();
  const copy = COPY[mode];

  const [phone, setPhone] = useState(initialMobile);
  const [code, setCode] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [sending, setSending] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setPhone(initialMobile);
    setCode('');
    setOldPassword('');
    setNewPassword('');
    setConfirm('');
    setShowPassword(false);
    setCountdown(0);
    setSending(false);
    setBusy(false);
    setError('');
  }, [open, initialMobile, mode]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, onClose]);

  if (!open) return null;

  const handleSend = async () => {
    setError('');
    if (mode === 'forgot' && !PHONE_RE.test(phone)) {
      setError('请输入有效的中国大陆手机号');
      return;
    }
    setSending(true);
    try {
      const result = mode === 'set' ? await sendMyCode() : await sendCode(phone);
      setCountdown(result.retry_after || 60);
    } catch (err) {
      setError(err instanceof Error ? err.message : '验证码发送失败');
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (mode === 'forgot' && !PHONE_RE.test(phone)) {
      setError('请输入有效的中国大陆手机号');
      return;
    }
    if (mode !== 'change' && !CODE_RE.test(code)) {
      setError('请输入 6 位验证码');
      return;
    }
    if (mode === 'change' && oldPassword.length < 6) {
      setError('当前密码至少 6 位');
      return;
    }
    if (newPassword.length < 6) {
      setError('密码至少 6 位');
      return;
    }
    if (mode === 'change' && newPassword === oldPassword) {
      setError('新密码不能与当前密码相同');
      return;
    }
    if (newPassword !== confirm) {
      setError('两次输入的密码不一致');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'forgot') {
        await resetPassword({ mobile: phone, code, password: newPassword });
      } else if (mode === 'set') {
        await savePassword({ code, password: newPassword });
      } else {
        await changePassword({ old_password: oldPassword, password: newPassword });
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    'w-full bg-black/20 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-zinc-600 disabled:opacity-50';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        aria-label="关闭"
        disabled={busy}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-dialog-title"
        className="glass-panel relative w-full max-w-md rounded-3xl border border-white/10 p-8"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="absolute right-4 top-4 text-zinc-500 transition-colors hover:text-white disabled:opacity-50"
          aria-label="关闭"
        >
          <X size={18} />
        </button>
        <p className="mb-2 text-xs uppercase tracking-[0.28em] text-zinc-500">UNIQMAG ID</p>
        <h2 id="password-dialog-title" className="text-2xl font-bold tracking-tight">
          {copy.title}
        </h2>
        <p className="mt-2 text-sm text-zinc-400">{copy.hint}</p>
        {mode === 'set' && maskedMobile ? (
          <p className="mt-1 text-sm tabular-nums text-zinc-500">验证码将发送至 {maskedMobile}</p>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === 'forgot' ? (
            <div className="space-y-2">
              <label htmlFor="pwd-phone" className="text-sm font-medium text-zinc-300">
                手机号
              </label>
              <div className="relative">
                <Smartphone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  id="pwd-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={11}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  disabled={busy}
                  className={inputClass}
                  placeholder="请输入手机号"
                />
              </div>
            </div>
          ) : null}

          {mode !== 'change' ? (
            <div className="space-y-2">
              <label htmlFor="pwd-code" className="text-sm font-medium text-zinc-300">
                验证码
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    id="pwd-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={busy}
                    className={`${inputClass} tracking-[0.2em] placeholder:tracking-normal`}
                    placeholder="6 位验证码"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSend}
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
            </div>
          ) : (
            <div className="space-y-2">
              <label htmlFor="pwd-old" className="text-sm font-medium text-zinc-300">
                当前密码
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  id="pwd-old"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  disabled={busy}
                  className={inputClass}
                  placeholder="请输入当前密码"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="pwd-new" className="text-sm font-medium text-zinc-300">
              {mode === 'change' ? '新密码' : '密码'}
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                id="pwd-new"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={busy}
                className={`${inputClass} pr-12`}
                placeholder="至少 6 位"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                aria-label={showPassword ? '隐藏密码' : '显示密码'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="pwd-confirm" className="text-sm font-medium text-zinc-300">
              确认密码
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                id="pwd-confirm"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={busy}
                className={inputClass}
                placeholder="再输入一次"
              />
            </div>
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-white py-3.5 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? <Loader2 size={16} className="mx-auto animate-spin" /> : copy.submit}
          </button>
        </form>
      </div>
    </div>
  );
}
