import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { prepareWechatLogin, type WeChatPrepareResult } from '../api/auth';

const AUTH_FROM_KEY = 'uniqmag_auth_from';
const WX_SCRIPT = 'https://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js';

declare global {
  interface Window {
    WxLogin?: new (opts: {
      self_redirect?: boolean;
      id: string;
      appid: string;
      scope: string;
      redirect_uri: string;
      state: string;
      style?: string;
      href?: string;
    }) => void;
  }
}

function loadWxLoginScript(): Promise<void> {
  if (typeof window.WxLogin === 'function') return Promise.resolve();
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${WX_SCRIPT}"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('微信登录组件加载失败')));
      if (typeof window.WxLogin === 'function') resolve();
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = WX_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('微信登录组件加载失败'));
    document.body.appendChild(script);
  });
}

export function rememberAuthFrom(path: string) {
  try {
    sessionStorage.setItem(AUTH_FROM_KEY, path);
  } catch {
    /* ignore */
  }
}

export function takeAuthFrom(fallback = '/account'): string {
  try {
    const v = sessionStorage.getItem(AUTH_FROM_KEY);
    sessionStorage.removeItem(AUTH_FROM_KEY);
    if (v && v !== '/login' && v !== '/register' && v !== '/onboarding/nickname') {
      return v;
    }
  } catch {
    /* ignore */
  }
  return fallback;
}

type Props = {
  /** Where to go after successful login (stored for callback page). */
  returnTo?: string;
  onUnavailable?: () => void;
};

export default function WeChatQrPanel({ returnTo = '/account', onUnavailable }: Props) {
  const containerId = useRef(`wx_login_${Math.random().toString(36).slice(2, 9)}`).current;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cfg, setCfg] = useState<WeChatPrepareResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await prepareWechatLogin();
        if (cancelled) return;
        if (!data.enabled || !data.app_id || !data.redirect_uri || !data.state) {
          setCfg(data);
          onUnavailable?.();
          setLoading(false);
          return;
        }
        rememberAuthFrom(returnTo);
        await loadWxLoginScript();
        if (cancelled) return;
        setCfg(data);
        // Clear previous iframe if any
        const el = document.getElementById(containerId);
        if (el) el.innerHTML = '';
        if (typeof window.WxLogin !== 'function') {
          throw new Error('微信登录组件不可用');
        }
        // WxLogin expects redirect_uri already encodeURIComponent'd
        new window.WxLogin({
          self_redirect: false,
          id: containerId,
          appid: data.app_id,
          scope: data.scope || 'snsapi_login',
          redirect_uri: encodeURIComponent(data.redirect_uri),
          state: data.state,
          style: 'black',
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '微信登录暂不可用');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [containerId, onUnavailable, returnTo]);

  if (cfg && !cfg.enabled) {
    return (
      <p className="py-8 text-center text-sm text-zinc-500">
        微信扫码登录暂未开通，请使用手机号登录
      </p>
    );
  }

  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center">
      {loading ? <Loader2 className="animate-spin text-zinc-500" size={28} /> : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <div
        id={containerId}
        className={`overflow-hidden rounded-xl ${loading || error ? 'hidden' : ''}`}
      />
      {!loading && !error && cfg?.enabled ? (
        <p className="mt-3 text-xs text-zinc-500">请使用微信扫一扫登录</p>
      ) : null}
    </div>
  );
}
