import { apiRequest, apiRequestPage } from './client';
import type {
  CheckoutRequest,
  CheckoutResult,
  OrderDetail,
  OrderSummary,
  PageResult,
  PayChannel,
  PayParams,
  PayResult,
  PayScene,
} from './types';

export function checkout(payload: CheckoutRequest) {
  return apiRequest<CheckoutResult>(
    '/app/v1/checkout',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    true,
  );
}

export function fetchPayParams(
  orderId: number | string,
  opts?: {
    /** 支付场景；省略时服务端按 User-Agent 推断 */
    scene?: PayScene;
    /** 支付完成后的同步回跳地址（须与服务端配置同 scheme + host，否则被忽略） */
    return_url?: string;
  },
) {
  const q = new URLSearchParams();
  if (opts?.scene) q.set('scene', opts.scene);
  if (opts?.return_url) q.set('return_url', opts.return_url);
  const qs = q.toString();
  return apiRequest<PayParams>(
    `/app/v1/pay/orders/${orderId}${qs ? `?${qs}` : ''}`,
    { method: 'GET' },
    true,
  );
}

export function fetchPayResult(params: { order_id?: string; order_no?: string }) {
  const q = new URLSearchParams();
  if (params.order_id) q.set('order_id', params.order_id);
  if (params.order_no) q.set('order_no', params.order_no);
  // POST：避免 CDN/浏览器把「未支付」缓存成后续轮询结果
  return apiRequest<PayResult>(`/app/v1/pay/result?${q.toString()}`, { method: 'POST' }, true);
}

export function fetchOrders(params?: {
  page?: number;
  page_size?: number;
  status?: string;
}) {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.page_size) q.set('page_size', String(params.page_size));
  if (params?.status) q.set('status', params.status);
  const qs = q.toString();
  return apiRequestPage<OrderSummary>(
    `/app/v1/me/orders${qs ? `?${qs}` : ''}`,
    { method: 'GET' },
    true,
  ) as Promise<PageResult<OrderSummary>>;
}

export function fetchOrder(id: string | number) {
  return apiRequest<OrderDetail>(`/app/v1/me/orders/${id}`, { method: 'GET' }, true);
}

export function refundOrder(id: string | number) {
  return apiRequest<{ order_id: number; status: string }>(
    `/app/v1/me/orders/${id}/refund`,
    { method: 'POST' },
    true,
  );
}

/** 确认收货：已发货 → 已完成 */
export function confirmOrder(id: string | number) {
  return apiRequest<{ order_id: number; status: string }>(
    `/app/v1/me/orders/${id}/confirm`,
    { method: 'POST' },
    true,
  );
}

export type { PayChannel };
