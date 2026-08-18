export const BIND_MOBILE_PATH = '/onboarding/mobile';
export const CHANGE_MOBILE_PATH = '/account/mobile';
export const NICKNAME_PATH = '/onboarding/nickname';
export const NEED_BIND_MOBILE_MSG = '请先绑定手机号';

const BLOCKED_RETURN = new Set([
  '/login',
  '/register',
  BIND_MOBILE_PATH,
  CHANGE_MOBILE_PATH,
  NICKNAME_PATH,
  '/auth/wechat/callback',
]);

/** 这些路径后端要求已绑手机；跳过绑定时不能再送回去 */
const MOBILE_GATED_PREFIXES = [
  '/checkout',
  '/pay',
  '/account/orders',
  '/account/addresses',
  '/account/points',
  '/account/devices',
];

export interface OnboardingHandoff {
  from?: string;
  /** Checkout 等页的 location.state（如 buyNow），绑完后原样交回 */
  resume?: unknown;
  /** 下单/订单等业务强制绑定；跳过则回个人中心，不回到来源页 */
  required?: boolean;
}

export function sanitizeReturnTo(path: string | null | undefined, fallback = '/account'): string {
  const trimmed = path?.trim() || '';
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return fallback;
  const pathname = trimmed.split(/[?#]/)[0];
  if (BLOCKED_RETURN.has(pathname)) return fallback;
  return trimmed;
}

export function requiresMobile(path: string | null | undefined): boolean {
  const pathname = (path ?? '').split(/[?#]/)[0];
  return MOBILE_GATED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function nextOnboardingPath(flags: { profileCompleted?: boolean }): string | null {
  if (flags.profileCompleted === false) return NICKNAME_PATH;
  return null;
}

export function skipBindDestination(
  from: string | null | undefined,
  needsProfile: boolean,
): { path: string; state?: OnboardingHandoff } {
  const dest = requiresMobile(from) ? '/account' : sanitizeReturnTo(from);
  if (needsProfile) {
    return { path: NICKNAME_PATH, state: { from: dest } };
  }
  return { path: dest };
}

export function isNeedBindMobileError(err: unknown): boolean {
  return err instanceof Error && err.message === NEED_BIND_MOBILE_MSG;
}
