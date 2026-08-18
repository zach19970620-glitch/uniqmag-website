import { apiRequest } from './client';

export interface AppUserPublic {
  id: number;
  mobile: string;
  nickname: string | null;
  profile_completed: boolean;
  need_bind_mobile: boolean;
  status: string;
}

export interface SmsSendResult {
  expire_in: number;
  retry_after: number;
}

export interface SmsLoginResult {
  token: string;
  is_new_user: boolean;
  profile_completed: boolean;
  need_bind_mobile: boolean;
  user: AppUserPublic;
}

export interface BindMobileResult extends SmsLoginResult {
  merged: boolean;
}

export interface NicknameUpdateResult {
  id: number;
  nickname: string;
  profile_completed: boolean;
  need_bind_mobile?: boolean;
}

/** 与短信登录成功结构一致，便于前端统一处理 */
export type PasswordAuthResult = SmsLoginResult;

export function sendSmsCode(mobile: string) {
  return apiRequest<SmsSendResult>('/app/v1/auth/sms/send', {
    method: 'POST',
    body: JSON.stringify({ mobile }),
  });
}

export function smsLogin(mobile: string, code: string) {
  return apiRequest<SmsLoginResult>('/app/v1/auth/sms/login', {
    method: 'POST',
    body: JSON.stringify({ mobile, code }),
  });
}

export function passwordLogin(mobile: string, password: string) {
  return apiRequest<PasswordAuthResult>('/app/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ mobile, password }),
  });
}

export function passwordRegister(payload: {
  mobile: string;
  password: string;
  nickname: string;
  email?: string;
}) {
  return apiRequest<PasswordAuthResult>('/app/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchMe() {
  return apiRequest<AppUserPublic>('/app/v1/me', { method: 'GET' }, true);
}

export function updateNickname(nickname: string) {
  return apiRequest<NicknameUpdateResult>(
    '/app/v1/me/nickname',
    {
      method: 'PUT',
      body: JSON.stringify({ nickname }),
    },
    true,
  );
}

/** 微信扫码后强制绑定；目标号已有未绑微信账号时会合并并返回新 token */
export function bindMobile(mobile: string, code: string) {
  return apiRequest<BindMobileResult>(
    '/app/v1/me/mobile/bind',
    {
      method: 'POST',
      body: JSON.stringify({ mobile, code }),
    },
    true,
  );
}

/** 已绑用户更换手机号；新号被占用则失败，不合并账号 */
export function changeMobile(payload: {
  old_mobile: string;
  old_code: string;
  mobile: string;
  code: string;
}) {
  return apiRequest<SmsLoginResult>(
    '/app/v1/me/mobile/change',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    true,
  );
}

export interface WeChatPrepareResult {
  enabled: boolean;
  app_id?: string;
  redirect_uri?: string;
  state?: string;
  scope?: string;
}

/** GET /app/v1/auth/wechat/prepare */
export function prepareWechatLogin() {
  return apiRequest<WeChatPrepareResult>('/app/v1/auth/wechat/prepare', { method: 'GET' });
}

/** POST /app/v1/auth/wechat/login — 扫码授权后用 code 换 token */
export function wechatLogin(code: string, state: string) {
  return apiRequest<SmsLoginResult>('/app/v1/auth/wechat/login', {
    method: 'POST',
    body: JSON.stringify({ code, state }),
  });
}
