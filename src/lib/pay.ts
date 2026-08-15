import { fetchPayParams } from '../api/orders';
import type { PayChannel, PayParams, PayScene } from '../api/types';

export interface StartPayTarget {
  orderId: number | string;
  orderNo?: string;
  channel?: PayChannel;
}

const qrStorageKey = (orderId: number | string) => `uniqmag_wxpay_qr_${orderId}`;

export function stashPayQr(orderId: number | string, qr: string) {
  try {
    sessionStorage.setItem(qrStorageKey(orderId), qr);
  } catch {
    /* private mode / quota */
  }
}

export function peekPayQr(orderId: number | string): string | null {
  try {
    return sessionStorage.getItem(qrStorageKey(orderId));
  } catch {
    return null;
  }
}

export function payQrFromParams(pay: PayParams): string {
  const qr = pay.payload?.qr_code || pay.payload?.code_url || '';
  return typeof qr === 'string' ? qr.trim() : '';
}

export function isNativeQrPay(pay: PayParams): boolean {
  if (pay.channel === 'wechat') return true;
  if (pay.scene === 'native' || pay.scene === 'qr') return Boolean(payQrFromParams(pay));
  return false;
}

/** 网页端支付场景：移动端 wap，桌面端 page（与服务端 UA 推断规则一致） */
function inferScene(): PayScene {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua) ? 'wap' : 'page';
}

function resultPathFor(orderId: number | string, orderNo?: string, channel?: string): string {
  const q = new URLSearchParams({ order_id: String(orderId) });
  if (orderNo) q.set('order_no', orderNo);
  if (channel) q.set('channel', channel);
  return `/pay/result?${q.toString()}`;
}

/**
 * 拉起支付。
 * - 微信 Native / 扫码：返回结果页路径，由结果页展示二维码并轮询
 * - 桌面 page：新窗口打开支付宝收银台，当前页返回结果页路径供轮询（须在用户点击同步路径里调用，先开空白窗防拦截）
 * - 移动 wap：同页跳转收银台（利于唤起支付宝 App）
 * - 拿不到 pay_url：返回结果页路径，由调用方导航后轮询
 */
export async function startPay({ orderId, orderNo, channel }: StartPayTarget): Promise<string | null> {
  let resultPath = resultPathFor(orderId, orderNo, channel);
  const scene = inferScene();
  const usePopup = channel !== 'wechat' && scene === 'page';

  // 必须在 await 之前打开，否则会被浏览器当成非用户手势弹窗而拦截
  const payWindow = usePopup ? window.open('about:blank', '_blank') : null;

  try {
    const pay = await fetchPayParams(orderId, {
      scene: channel === 'wechat' ? undefined : scene,
      // 须与后端 ALIPAY_RETURN_URL 同 scheme+host（正式站为 https://www.uniqmag.cn）
      return_url: `${window.location.origin}${resultPath}`,
    });
    resultPath = resultPathFor(orderId, orderNo || pay.order_no, pay.channel || channel);

    const qr = payQrFromParams(pay);
    if (isNativeQrPay(pay) || (qr && !pay.pay_url && !pay.payload?.pay_url)) {
      payWindow?.close();
      if (qr) stashPayQr(orderId, qr);
      return resultPath;
    }

    const payUrl = pay.pay_url || pay.payload?.pay_url;
    if (!payUrl) {
      payWindow?.close();
      return resultPath;
    }

    if (scene === 'page') {
      if (payWindow && !payWindow.closed) {
        payWindow.location.href = payUrl;
        try {
          payWindow.opener = null;
        } catch {
          /* ignore cross-origin / browser restrictions */
        }
        return resultPath;
      }
      // 弹窗被拦截：退回同页跳转
      window.location.href = payUrl;
      return null;
    }

    window.location.href = payUrl;
    return null;
  } catch {
    payWindow?.close();
    /* 渠道参数失败时退回结果页轮询 */
  }

  return resultPath;
}
