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
  fetchMe,
  passwordLogin,
  passwordRegister,
  prepareWechatLogin,
  sendSmsCode,
  smsLogin,
  updateNickname,
  wechatLogin,
  type AppUserPublic,
  type SmsSendResult,
  type WeChatPrepareResult,
} from '../api/auth';
import { ApiError, getToken, setToken } from '../api/client';

export type User = AppUserPublic;

export interface CodeLoginResult {
  isNewUser: boolean;
  user: User;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
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
  completeNickname: (nickname: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function applyAuthResult(result: {
  token: string;
  is_new_user: boolean;
  profile_completed: boolean;
  user: User;
}): CodeLoginResult {
  setToken(result.token);
  return {
    isNewUser: result.is_new_user || !result.profile_completed,
    user: result.user,
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
    const me = await fetchMe();
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
        const me = await fetchMe();
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
    const result = await smsLogin(mobile, code);
    const mapped = applyAuthResult(result);
    setUser(result.user);
    return mapped;
  }, []);

  const loginWithPassword = useCallback(async (mobile: string, password: string) => {
    const result = await passwordLogin(mobile, password);
    const mapped = applyAuthResult(result);
    setUser(result.user);
    return mapped;
  }, []);

  const prepareWechat = useCallback(async () => {
    return prepareWechatLogin();
  }, []);

  const loginWithWechat = useCallback(async (code: string, state: string) => {
    const result = await wechatLogin(code, state);
    const mapped = applyAuthResult(result);
    setUser(result.user);
    return mapped;
  }, []);

  const register = useCallback(
    async (payload: {
      mobile: string;
      password: string;
      nickname: string;
      email?: string;
    }) => {
      const result = await passwordRegister(payload);
      const mapped = applyAuthResult(result);
      setUser(result.user);
      return mapped;
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
          }
        : {
            id: result.id,
            mobile: '',
            nickname: result.nickname,
            profile_completed: result.profile_completed,
            status: 'active',
          },
    );
    try {
      const me = await fetchMe();
      setUser(me);
    } catch {
      /* keep local merge */
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      needsProfile: Boolean(user && !user.profile_completed),
      bootstrapping,
      sendCode,
      loginWithCode,
      loginWithPassword,
      prepareWechat,
      loginWithWechat,
      register,
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
