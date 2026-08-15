import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateNickname } from '../api/auth';
import PageFrame from './app/PageFrame';
import AccountNav from './app/AccountNav';

const QUICK_LINKS = [
  { to: '/account/orders', title: '我的订单', desc: '查看物流与申请退款' },
  { to: '/account/addresses', title: '收货地址', desc: '管理默认收货信息' },
  { to: '/account/points', title: '积分明细', desc: '查看积分流水' },
  { to: '/account/devices', title: '我的设备', desc: '已绑定键盘与 SN' },
  { to: '/account/devices/bind', title: '绑定键盘', desc: '输入 SN 激活设备' },
  { to: '/products', title: '产品选购', desc: '了解系列并直接下单' },
];

export default function Account() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [saving, setSaving] = useState(false);
  const [savedHint, setSavedHint] = useState('');
  const [error, setError] = useState('');

  if (!user) return null;

  const displayName = user.nickname?.trim() || 'UNIQMAG 用户';
  const initial = displayName.slice(0, 1).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError('请输入昵称');
      return;
    }
    if ([...trimmed].length > 32) {
      setError('昵称最多 32 个字符');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await updateNickname(trimmed);
      await refreshUser();
      setEditing(false);
      setSavedHint('昵称已更新');
      window.setTimeout(() => setSavedHint(''), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageFrame>
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">你好，{displayName}</h1>
          <p className="mt-3 text-sm text-zinc-400">管理订单、地址、积分与已绑设备</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut size={16} strokeWidth={1.5} />
          退出登录
        </button>
      </div>

      <AccountNav />

      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 lg:col-span-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-700 text-2xl font-bold">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xl font-semibold">{displayName}</p>
              <p className="mt-1 text-sm tabular-nums text-zinc-400">{user.mobile}</p>
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-300">账号资料</h2>
              {!editing ? (
                <button
                  type="button"
                  onClick={() => {
                    setNickname(user.nickname ?? '');
                    setEditing(true);
                    setError('');
                  }}
                  className="text-sm text-zinc-400 hover:text-white"
                >
                  编辑昵称
                </button>
              ) : null}
            </div>

            {editing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={32}
                  disabled={saving}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/40 disabled:opacity-50"
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-60"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                    保存
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-400"
                  >
                    取消
                  </button>
                </div>
                {error ? <p className="text-sm text-red-400">{error}</p> : null}
              </form>
            ) : (
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-zinc-500">状态</dt>
                  <dd>{user.status === 'active' ? '正常' : user.status}</dd>
                </div>
                {savedHint ? <p className="text-sm text-emerald-400">{savedHint}</p> : null}
              </dl>
            )}
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5 transition-colors hover:border-white/20 hover:bg-white/[0.05]"
            >
              <h3 className="font-medium">{link.title}</h3>
              <p className="mt-1 text-sm text-zinc-500">{link.desc}</p>
            </Link>
          ))}
        </section>
      </div>
    </PageFrame>
  );
}
