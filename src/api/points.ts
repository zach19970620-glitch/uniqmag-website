import { apiRequestEnvelope } from './client';
import type { PointsEntry, PointsPayload } from './types';

export async function fetchPoints(params?: {
  page?: number;
  page_size?: number;
}): Promise<PointsPayload> {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.page_size) q.set('page_size', String(params.page_size));
  const qs = q.toString();
  const payload = await apiRequestEnvelope<unknown>(
    `/app/v1/me/points${qs ? `?${qs}` : ''}`,
    { method: 'GET' },
    true,
  );

  // 兼容 balance/list/total 在 data 内或信封顶层两种返回
  const data = payload.data;
  if (data && !Array.isArray(data) && typeof data === 'object' && 'list' in data) {
    const nested = data as Partial<PointsPayload>;
    return {
      balance: nested.balance ?? 0,
      list: nested.list ?? [],
      total: nested.total ?? nested.list?.length ?? 0,
    };
  }

  const list =
    (payload.list as PointsEntry[] | undefined) ??
    (Array.isArray(data) ? (data as PointsEntry[]) : []);
  return {
    balance: typeof payload.balance === 'number' ? payload.balance : 0,
    list,
    total: typeof payload.total === 'number' ? payload.total : list.length,
  };
}
