import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  bindMobile,
  changeMobile,
  fetchMe,
  passwordLogin,
  passwordRegister,
  prepareWechatLogin,
  sendSmsCode,
  smsLogin,
  updateNickname,
  wechatLogin,
  type AppUserPublic,
  type BindMobileResult,
  type SmsLoginResult,
  type SmsSendResult,
  type WeChatPrepareResult,
} from '../api/auth';
import { ApiError, getToken, setToken } from '../api/client';

export type User = AppUserPublic;

export interface CodeLoginResult {
  isNewUser: boolean;
  needBindMobile: boolean;
  user: User;
}

export interface BindPhoneResult {
  merged: boolean;
  user: User;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  needsBindMobile: boolean;
  needsProfile: boolean;
  bootstrapping: boolean;
  sendCode: (mobile: string) => Promise<SmsSendResult>;
  loginWithCode: (mobile: string, code: string) => Promise<CodeLoginResult>;
  loginWithPassword: (mobile: string, password: string) => Promise<CodeLoginResult>;
  prepareWechat: () => Promise<WeChatPrepareResult>;
  loginWithWechat: (code: string, state: string) => Promise<CodeLoginResult>;
  register: (payload: {
    mobile: string;
    password: string;
    nickname: string;
    email?: string;
  }) => Promise<CodeLoginResult>;
  bindPhone: (mobile: string, code: string) => Promise<BindPhoneResult>;
  changePhone: (payload: {
    old_mobile: string;
    old_code: string;
    mobile: string;
    code: string;
  }) => Promise<User>;
  completeNickname: (nickname: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeUser(user: AppUserPublic): User {
  return {
    ...user,
    need_bind_mobile: Boolean(user.need_bind_mobile || !user.mobile),
  };
}

function applyAuthResult(result: SmsLoginResult): CodeLoginResult {
  setToken(result.token);
  const user = normalizeUser({
    ...result.user,
    need_bind_mobile: Boolean(
      result.need_bind_mobile || result.user?.need_bind_mobile || !result.user?.mobile,
    ),
  });
  return {
    isNewUser: result.is_new_user || !result.profile_completed,
    needBindMobile: user.need_bind_mobile,
    user,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [bootstrapping, setBootstrapping] = useState(() => Boolean(getToken()));

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const me = normalizeUser(await fetchMe());
    setUser(me);
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setBootstrapping(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const me = normalizeUser(await fetchMe());
        if (!cancelled) setUser(me);
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError && err.status === 401) {
            setToken(null);
          }
          setUser(null);
        }
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const sendCode = useCallback(async (mobile: string) => {
    return sendSmsCode(mobile);
  }, []);

  const loginWithCode = useCallback(async (mobile: string, code: string) => {
    const mapped = applyAuthResult(await smsLogin(mobile, code));
    setUser(mapped.user);
    return mapped;
  }, []);

  const loginWithPassword = useCallback(async (mobile: string, password: string) => {
    const mapped = applyAuthResult(await passwordLogin(mobile, password));
    setUser(mapped.user);
    return mapped;
  }, []);

  const prepareWechat = useCallback(async () => {
    return prepareWechatLogin();
  }, []);

  const loginWithWechat = useCallback(async (code: string, state: string) => {
    const mapped = applyAuthResult(await wechatLogin(code, state));
    setUser(mapped.user);
    return mapped;
  }, []);

  const register = useCallback(
    async (payload: {
      mobile: string;
      password: string;
      nickname: string;
      email?: string;
    }) => {
      const mapped = applyAuthResult(await passwordRegister(payload));
      setUser(mapped.user);
      return mapped;
    },
    [],
  );

  const bindPhone = useCallback(async (mobile: string, code: string) => {
    const result: BindMobileResult = await bindMobile(mobile, code);
    const mapped = applyAuthResult(result);
    setUser(mapped.user);
    return { merged: Boolean(result.merged), user: mapped.user };
  }, []);

  const changePhone = useCallback(
    async (payload: {
      old_mobile: string;
      old_code: string;
      mobile: string;
      code: string;
    }) => {
      const mapped = applyAuthResult(await changeMobile(payload));
      setUser(mapped.user);
      return mapped.user;
    },
    [],
  );

  const completeNickname = useCallback(async (nickname: string) => {
    const result = await updateNickname(nickname.trim());
    setUser((prev) =>
      prev
        ? {
            ...prev,
            nickname: result.nickname,
            profile_completed: result.profile_completed,
            need_bind_mobile: Boolean(result.need_bind_mobile ?? prev.need_bind_mobile),
          }
        : {
            id: result.id,
            mobile: '',
            nickname: result.nickname,
            profile_completed: result.profile_completed,
            need_bind_mobile: Boolean(result.need_bind_mobile),
            status: 'active',
          },
    );
    try {
      setUser(normalizeUser(await fetchMe()));
    } catch {
      /* keep local merge */
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      needsBindMobile: Boolean(user?.need_bind_mobile),
      needsProfile: Boolean(user && !user.profile_completed),
      bootstrapping,
      sendCode,
      loginWithCode,
      loginWithPassword,
      prepareWechat,
      loginWithWechat,
      register,
      bindPhone,
      changePhone,
      completeNickname,
      refreshUser,
      logout,
    }),
    [
      user,
      bootstrapping,
      sendCode,
      loginWithCode,
      loginWithPassword,
      prepareWechat,
      loginWithWechat,
      register,
      bindPhone,
      changePhone,
      completeNickname,
      refreshUser,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
