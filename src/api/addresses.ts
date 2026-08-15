import { apiRequest } from './client';
import type { Address } from './types';

export type AddressInput = Omit<Address, 'id'>;

export function fetchAddresses() {
  return apiRequest<Address[]>('/app/v1/me/addresses', { method: 'GET' }, true);
}

export function createAddress(payload: AddressInput) {
  return apiRequest<Address>(
    '/app/v1/me/addresses',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    true,
  );
}

export function updateAddress(id: number, payload: AddressInput) {
  return apiRequest<Address>(
    `/app/v1/me/addresses/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
    true,
  );
}

export function deleteAddress(id: number) {
  return apiRequest<{ ok: boolean } | null>(
    `/app/v1/me/addresses/${id}`,
    { method: 'DELETE' },
    true,
  );
}
