import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Keyboard, Loader2, RefreshCw, ShieldCheck, Usb } from 'lucide-react';
import { bindDevice } from '../../api/devices';
import {
  isWebHidSupported,
  KeyboardHidError,
  readKeyboardInfo,
  type KeyboardInfo,
} from '../../lib/keyboardHid';
import PageFrame from '../app/PageFrame';
import AccountNav from '../app/AccountNav';

type Phase = 'idle' | 'reading' | 'ready' | 'binding';

const STEPS = ['授权连接', '自动读取', '完成绑定'] as const;

export default function BindDevicePage() {
  const navigate = useNavigate();
  const hidSupported = isWebHidSupported();

  const [phase, setPhase] = useState<Phase>('idle');
  const [info, setInfo] = useState<KeyboardInfo | null>(null);
  const [manual, setManual] = useState(!hidSupported);
  const [manualSn, setManualSn] = useState('');
  const [manualUid, setManualUid] = useState('');
  const [error, setError] = useState('');

  const stepIndex = phase === 'idle' ? 0 : phase === 'reading' ? 1 : 2;

  const handleConnect = async () => {
    setError('');
    setPhase('reading');
    try {
      const data = await readKeyboardInfo();
      setInfo(data);
      setPhase('ready');
      if (!data.sn || !data.uid) {
        setManual(true);
      }
    } catch (err) {
      setPhase('idle');
      if (err instanceof KeyboardHidError) {
        if (err.code === 'cancelled') return;
        if (err.code === 'unsupported') setManual(true);
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : '连接失败,请重试');
      }
    }
  };

  /** 服务端要求 SN + UID 双重校验（证明实际持有设备），二者均必填 */
  const doBind = async (sn: string, uid: string) => {
    setPhase('binding');
    setError('');
    try {
      const result = await bindDevice(sn, uid);
      const qs = new URLSearchParams({
        sn,
        ok: result.success ? '1' : '0',
      });
      if (result.message) qs.set('message', result.message);
      if (result.points_delta != null) qs.set('points', String(result.points_delta));
      navigate(`/account/devices/bind/result?${qs.toString()}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '绑定失败');
      setPhase(info ? 'ready' : 'idle');
    }
  };

  const normalizeHex = (value: string) => value.trim().toUpperCase().replace(/[^0-9A-F]/g, '');

  const handleManualSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const sn = normalizeHex(manualSn);
    const uid = normalizeHex(manualUid);
    if (!sn || !uid) {
      setError('请输入键盘底部标签上的 SN 与 UID');
      return;
    }
    if (!/^[0-9A-F]{16}$/.test(sn) || !/^[0-9A-F]{24}$/.test(uid)) {
      setError('请核对键盘底部标签：SN 为 16 位十六进制，UID 为 24 位十六进制');
      return;
    }
    await doBind(sn, uid);
  };

  const busy = phase === 'reading' || phase === 'binding';

  return (
    <PageFrame narrow>
      <Link to="/account/devices" className="text-sm text-zinc-400 hover:text-white">
        ← 我的设备
      </Link>
      <div className="mt-6">
        <AccountNav />
      </div>

      <div className="mt-8">
        <h1 className="text-3xl font-bold tracking-tight">绑定键盘</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          用数据线连接键盘后点击「连接键盘」,浏览器授权读取即可自动完成校验,无需手动输入。
          激活送积分同一设备终身一次。
        </p>
      </div>

      {/* 步骤指示 */}
      <ol className="mt-8 flex items-center gap-2">
        {STEPS.map((label, i) => {
          const active = i <= stepIndex;
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                  active ? 'bg-white text-black' : 'border border-white/15 text-zinc-500'
                }`}
              >
                {i + 1}
              </span>
              <span className={`text-xs ${active ? 'text-zinc-200' : 'text-zinc-500'}`}>
                {label}
              </span>
              {i < STEPS.length - 1 ? (
                <span className="h-px flex-1 bg-white/10" aria-hidden />
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-1.5">
        <div className="space-y-5 rounded-[calc(1.75rem-0.375rem)] border border-white/10 bg-black/30 p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
          {/* 连接区 */}
          {hidSupported && !info ? (
            <div className="flex flex-col items-center py-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                {phase === 'reading' ? (
                  <Loader2 size={24} className="animate-spin text-zinc-300" />
                ) : (
                  <Usb size={24} className="text-zinc-300" />
                )}
              </div>
              <p className="mt-4 text-sm text-zinc-300">
                {phase === 'reading' ? '正在读取设备信息…' : '连接您的 UNIQMAG 键盘'}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
                点击后浏览器会弹出授权窗口,选择您的键盘并确认
              </p>
              <button
                type="button"
                onClick={handleConnect}
                disabled={busy}
                className="mt-5 flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black disabled:opacity-60"
              >
                {phase === 'reading' ? <Loader2 size={16} className="animate-spin" /> : null}
                连接键盘
              </button>
            </div>
          ) : null}

          {/* 已识别设备 */}
          {info ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/40">
                  <Keyboard size={22} className="text-zinc-200" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white">{info.model} 磁轴键盘</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {info.deviceName} · 固件 v{info.firmwareVersion}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={busy}
                  className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-zinc-300 hover:text-white disabled:opacity-50"
                >
                  <RefreshCw size={12} />
                  重新连接
                </button>
              </div>

              {info.sn && info.uid ? (
                <>
                  <p className="flex items-center justify-center gap-2 text-sm text-emerald-300">
                    <ShieldCheck size={16} />
                    设备校验信息（SN + UID）已自动读取
                  </p>
                  <button
                    type="button"
                    onClick={() => void doBind(info.sn!, info.uid!)}
                    disabled={busy}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-medium text-black disabled:opacity-60"
                  >
                    {phase === 'binding' ? <Loader2 size={16} className="animate-spin" /> : null}
                    一键绑定
                  </button>
                </>
              ) : (
                <p className="text-center text-xs leading-relaxed text-zinc-500">
                  当前固件暂不支持自动读取校验信息,请在下方输入键盘底部标签上的 SN 与 UID
                </p>
              )}
            </div>
          ) : null}

          {/* 手动输入回退 */}
          {manual ? (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              {!hidSupported ? (
                <p className="text-xs leading-relaxed text-zinc-500">
                  当前浏览器不支持设备连接(建议使用 Chrome / Edge),请输入键盘底部标签上的
                  SN 与 UID 完成绑定
                </p>
              ) : null}
              <label className="block space-y-2 text-sm">
                <span className="text-zinc-300">设备 SN（16 位）</span>
                <input
                  value={manualSn}
                  onChange={(e) => setManualSn(e.target.value.toUpperCase())}
                  disabled={busy}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="例如 6C050100084C3174"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm tracking-wide text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/40 disabled:opacity-50"
                />
              </label>
              <label className="block space-y-2 text-sm">
                <span className="text-zinc-300">设备 UID（24 位）</span>
                <input
                  value={manualUid}
                  onChange={(e) => setManualUid(e.target.value.toUpperCase())}
                  disabled={busy}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="例如 50110836345838423C140936"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm tracking-wide text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/40 disabled:opacity-50"
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-medium text-black disabled:opacity-60"
              >
                {phase === 'binding' ? <Loader2 size={16} className="animate-spin" /> : null}
                确认绑定
              </button>
            </form>
          ) : null}

          {error ? (
            <p className="text-center text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : null}

          {hidSupported && !manual ? (
            <button
              type="button"
              onClick={() => setManual(true)}
              className="mx-auto block text-xs text-zinc-500 underline-offset-4 hover:text-zinc-300 hover:underline"
            >
              无法连接?手动输入 SN / UID 绑定
            </button>
          ) : null}
        </div>
      </div>
    </PageFrame>
  );
}
