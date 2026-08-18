import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Lock, Mail, Smartphone, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NICKNAME_PATH } from '../lib/onboarding';

const PHONE_RE = /^1[3-9]\d{9}$/;

export default function Register() {
  const { register, isAuthenticated, needsProfile, bootstrapping } = useAuth();
  const navigate = useNavigate();

  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  if (bootstrapping) {
    return (
      <section className="relative z-10 min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-500" size={28} />
      </section>
    );
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to={needsProfile ? NICKNAME_PATH : '/account'}
        replace
      />
    );
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback('');

    const name = nickname.trim();
    if (!name || [...name].length > 32) {
      setStatus('error');
      setFeedback('昵称需为 1–32 个字符');
      return;
    }
    if (!PHONE_RE.test(phone)) {
      setStatus('error');
      setFeedback('请输入有效的中国大陆手机号');
      return;
    }
    if (password.length < 6) {
      setStatus('error');
      setFeedback('密码至少 6 位');
      return;
    }
    if (password !== confirm) {
      setStatus('error');
      setFeedback('两次输入的密码不一致');
      return;
    }

    setStatus('loading');
    try {
      const result = await register({
        mobile: phone,
        password,
        nickname: name,
        email: email.trim() || undefined,
      });
      if (result.isNewUser) {
        navigate('/onboarding/nickname', { replace: true });
      } else {
        navigate('/account', { replace: true });
      }
    } catch (err) {
      setStatus('error');
      setFeedback(err instanceof Error ? err.message : '注册失败，请稍后重试');
    }
  };

  return (
    <section className="relative z-10 min-h-screen flex items-center py-28">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 right-1/4 h-64 w-64 rounded-full bg-primary/25 blur-[90px]" />
        <div className="absolute bottom-20 left-10 h-48 w-72 rounded-full bg-cyan-500/10 blur-[80px]" />
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
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">创建账号</h1>
            <p className="text-zinc-400 text-sm leading-relaxed">
              手机号 + 密码注册，注册成功后可直接进入个人中心
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="glass-panel rounded-3xl border border-white/10 p-8 md:p-10 space-y-5"
          >
            <div className="space-y-2">
              <label htmlFor="reg-nickname" className="text-sm font-medium text-zinc-300">
                昵称
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  id="reg-nickname"
                  type="text"
                  autoComplete="nickname"
                  maxLength={32}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  disabled={status === 'loading'}
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-zinc-600 disabled:opacity-50"
                  placeholder="怎么称呼你"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="reg-phone" className="text-sm font-medium text-zinc-300">
                手机号
              </label>
              <div className="relative">
                <Smartphone
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                  id="reg-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={11}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  disabled={status === 'loading'}
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-zinc-600 disabled:opacity-50"
                  placeholder="用于登录"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="reg-email" className="text-sm font-medium text-zinc-300">
                邮箱 <span className="text-zinc-600 font-normal">（可选）</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'loading'}
                  className="w-full bg-black/20 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-zinc-600 disabled:opacity-50"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="reg-password" className="text-sm font-medium text-zinc-300">
                密码
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={status === 'loading'}
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-xl pl-11 pr-12 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-zinc-600 disabled:opacity-50"
                  placeholder="至少 6 位"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="reg-confirm" className="text-sm font-medium text-zinc-300">
                确认密码
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  id="reg-confirm"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  disabled={status === 'loading'}
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-zinc-600 disabled:opacity-50"
                  placeholder="再次输入密码"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-medium py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(102,105,227,0.3)] hover:shadow-[0_0_30px_rgba(102,105,227,0.5)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  创建中...
                </>
              ) : (
                '注册并进入个人中心'
              )}
            </button>

            {feedback && (
              <p className="text-sm text-center text-red-400" role="alert">
                {feedback}
              </p>
            )}

            <p className="text-sm text-center text-zinc-500 pt-2">
              已有账号？{' '}
              <Link to="/login" className="text-white hover:text-primary transition-colors">
                去登录
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
