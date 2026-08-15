import { apiRequest } from './client';
import type { BindDeviceResult, BoundDevice } from './types';

export function fetchDevices() {
  return apiRequest<BoundDevice[]>('/app/v1/me/devices', { method: 'GET' }, true);
}

/** 绑定设备：SN + UID 双重校验（均必填，证明实际持有设备） */
export function bindDevice(sn: string, uid: string) {
  return apiRequest<BindDeviceResult>(
    '/app/v1/me/devices/bind',
    {
      method: 'POST',
      body: JSON.stringify({ sn: sn.trim(), uid: uid.trim() }),
    },
    true,
  );
}

export function fetchBindResult(params?: { sn?: string }) {
  const q = new URLSearchParams();
  if (params?.sn) q.set('sn', params.sn);
  const qs = q.toString();
  return apiRequest<BindDeviceResult>(
    `/app/v1/me/devices/bind/result${qs ? `?${qs}` : ''}`,
    { method: 'GET' },
    true,
  );
}
