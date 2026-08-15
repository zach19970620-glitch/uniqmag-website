export class ApiError extends Error {
  readonly status: number;
  readonly errorCode?: string;

  constructor(message: string, status: number, errorCode?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errorCode = errorCode;
  }
}

export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  errorMessage?: string;
  errorCode?: string;
  /** 部分列表接口把分页字段放在信封顶层 */
  [extra: string]: unknown;
}

const TOKEN_KEY = 'uniqmag_app_token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    /* ignore */
  }
}

/** 开发走 Vite 代理 `/app`；生产可用 `VITE_API_BASE_URL` 指向后端根地址 */
function apiBase(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
  return configured || '';
}

/** 发请求并返回完整信封（校验 success/401 后）。 */
export async function apiRequestEnvelope<T>(
  path: string,
  options: RequestInit = {},
  auth = false,
): Promise<ApiEnvelope<T>> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = getToken();
    if (!token) {
      throw new ApiError('请先登录！', 401, '401');
    }
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${apiBase()}${path}`, {
    cache: 'no-store',
    ...options,
    headers,
  });

  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiError(
      response.ok ? '响应解析失败' : `请求失败（${response.status}）`,
      response.status,
    );
  }

  if (response.status === 401) {
    setToken(null);
    throw new ApiError(payload.errorMessage || '请先登录！', 401, payload.errorCode);
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(
      payload.errorMessage || `请求失败（${response.status}）`,
      response.status,
      payload.errorCode,
    );
  }

  return payload;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  auth = false,
): Promise<T> {
  const payload = await apiRequestEnvelope<T>(path, options, auth);
  return payload.data as T;
}

export interface PageEnvelope<T> {
  list: T[];
  total: number;
}

/**
 * 列表请求：兼容两种信封
 * 1. { success, data: { list, total } }
 * 2. { success, data: [...], list: [...], total }（分页字段在顶层）
 */
export async function apiRequestPage<T>(
  path: string,
  options: RequestInit = {},
  auth = false,
): Promise<PageEnvelope<T>> {
  const payload = await apiRequestEnvelope<unknown>(path, options, auth);
  const data = payload.data;

  if (data && !Array.isArray(data) && typeof data === 'object' && 'list' in data) {
    const nested = data as { list?: T[]; total?: number };
    return { list: nested.list ?? [], total: nested.total ?? nested.list?.length ?? 0 };
  }

  const topList = payload.list as T[] | undefined;
  const list = topList ?? (Array.isArray(data) ? (data as T[]) : []);
  const total = typeof payload.total === 'number' ? payload.total : list.length;
  return { list, total };
}
