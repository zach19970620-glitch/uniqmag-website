import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CompleteNickname() {
  const { user, isAuthenticated, needsProfile, completeNickname, bootstrapping } = useAuth();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  if (bootstrapping) {
    return (
      <section className="relative z-10 min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-500" size={28} />
      </section>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!needsProfile) {
    return <Navigate to="/account" replace />;
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback('');
    const trimmed = nickname.trim();
    if (!trimmed) {
      setStatus('error');
      setFeedback('请输入昵称');
      return;
    }
    if ([...trimmed].length > 32) {
      setStatus('error');
      setFeedback('昵称最多 32 个字符');
      return;
    }

    setStatus('loading');
    try {
      await completeNickname(trimmed);
      navigate('/account', { replace: true });
    } catch (err) {
      setStatus('error');
      setFeedback(err instanceof Error ? err.message : '保存失败，请稍后重试');
    }
  };

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
            <div className="mx-auto mb-5 w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center shadow-[0_0_30px_rgba(102,105,227,0.35)]">
              <Sparkles size={20} />
            </div>
            <p className="mb-3 text-xs tracking-[0.28em] uppercase text-zinc-500">欢迎加入</p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">完善昵称</h1>
            <p className="text-zinc-400 text-sm leading-relaxed">
              账号已创建（{user?.mobile}）
              <br />
              设置昵称后即可进入个人中心
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="glass-panel rounded-3xl border border-white/10 p-8 md:p-10 space-y-5"
          >
            <div className="space-y-2">
              <label htmlFor="nickname" className="text-sm font-medium text-zinc-300">
                昵称
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  id="nickname"
                  type="text"
                  autoComplete="nickname"
                  autoFocus
                  maxLength={32}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  disabled={status === 'loading'}
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-zinc-600 disabled:opacity-50"
                  placeholder="怎么称呼你"
                />
              </div>
              <p className="text-xs text-zinc-600">1–32 个字符，可之后在个人中心修改</p>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-medium py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(102,105,227,0.3)] hover:shadow-[0_0_30px_rgba(102,105,227,0.5)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  保存中...
                </>
              ) : (
                '完成并进入个人中心'
              )}
            </button>

            {feedback && (
              <p className="text-sm text-center text-red-400" role="alert">
                {feedback}
              </p>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
}
