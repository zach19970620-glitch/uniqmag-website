import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

type Props = {
  value: string;
  label?: string;
};

/** Native 支付码：白底黑码，便于微信扫一扫识别。qrcode 仅在出码时动态加载。 */
export default function WeChatPayQr({ value, label = '请使用微信扫一扫完成支付' }: Props) {
  const [dataUrl, setDataUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const code = value.trim();
    if (!code) {
      setDataUrl('');
      return;
    }
    setError('');
    setDataUrl('');
    (async () => {
      try {
        const mod = await import('qrcode');
        const toDataURL = mod.toDataURL ?? mod.default?.toDataURL;
        if (typeof toDataURL !== 'function') throw new Error('qrcode unavailable');
        const url = await toDataURL(code, {
          width: 240,
          margin: 2,
          errorCorrectionLevel: 'M',
          color: { dark: '#111111', light: '#ffffff' },
        });
        if (!cancelled) setDataUrl(url);
      } catch {
        if (!cancelled) setError('二维码生成失败，请重新拉起支付');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [value]);

  return (
    <div className="mx-auto mt-8 max-w-[16.5rem]">
      <div className="rounded-2xl bg-white p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
        {dataUrl ? (
          <img src={dataUrl} alt="微信支付二维码" width={240} height={240} className="mx-auto block h-auto w-full" />
        ) : error ? (
          <p className="py-16 text-center text-sm text-red-500">{error}</p>
        ) : (
          <div className="flex h-[240px] items-center justify-center">
            <Loader2 className="animate-spin text-zinc-400" size={22} />
          </div>
        )}
      </div>
      <p className="mt-3 text-center text-xs text-zinc-500">{label}</p>
    </div>
  );
}
