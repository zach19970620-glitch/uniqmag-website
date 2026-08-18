import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { fetchCart, updateCart } from '../api/cart';
import type { CartItem } from '../api/types';
import { ApiError } from '../api/client';
import { useAuth } from './AuthContext';
import { isNeedBindMobileError } from '../lib/onboarding';

interface CartContextValue {
  items: CartItem[];
  amountCent: number;
  count: number;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  setQty: (productId: number, qty: number, meta?: Partial<CartItem>) => Promise<void>;
  addItem: (item: Omit<CartItem, 'qty'> & { qty?: number }) => Promise<void>;
  clearLocal: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
/** 游客（未登录）购物车的本地存储；登录后以服务端购物车为准 */
const LOCAL_KEY = 'uniqmag_cart_v1';
/** 服务端约束：单行数量 1–99 */
const MAX_QTY = 99;

function readLocal(): CartItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(items: CartItem[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

function sumAmount(items: CartItem[]) {
  return items.reduce((acc, item) => acc + item.price_cent * item.qty, 0);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, needsBindMobile, bootstrapping } = useAuth();
  const remoteCartReady = isAuthenticated && !needsBindMobile;
  const [items, setItems] = useState<CartItem[]>(() => readLocal());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  /** 上一次已确定的远端购物车就绪态；null = 尚未确定（bootstrap 中） */
  const wasRemote = useRef<boolean | null>(null);

  const refresh = useCallback(async () => {
    if (!remoteCartReady) {
      setItems(readLocal());
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await fetchCart();
      setItems(data.items ?? []);
    } catch (err) {
      if (isNeedBindMobileError(err)) {
        setItems(readLocal());
        return;
      }
      setError(err instanceof Error ? err.message : '购物车加载失败');
    } finally {
      setLoading(false);
    }
  }, [remoteCartReady]);

  /** 登录或绑手机后把本地购物车合并进服务端（重复商品数量相加，上限 99） */
  const mergeGuestCart = useCallback(async (guest: CartItem[]) => {
    setLoading(true);
    setError('');
    try {
      const server = await fetchCart();
      const merged = new Map<number, number>();
      for (const item of server.items ?? []) {
        merged.set(item.product_id, Math.min(MAX_QTY, item.qty));
      }
      for (const item of guest) {
        merged.set(
          item.product_id,
          Math.min(MAX_QTY, (merged.get(item.product_id) ?? 0) + item.qty),
        );
      }
      const data = await updateCart(
        [...merged].map(([product_id, qty]) => ({ product_id, qty })),
      );
      setItems(data.items ?? []);
      writeLocal([]);
    } catch (err) {
      if (isNeedBindMobileError(err)) {
        setItems(guest);
        writeLocal(guest);
        return;
      }
      setError(err instanceof Error ? err.message : '购物车同步失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (bootstrapping) return;
    const was = wasRemote.current;
    wasRemote.current = remoteCartReady;

    if (remoteCartReady && was === false) {
      const guest = readLocal();
      if (guest.length > 0) {
        void mergeGuestCart(guest);
        return;
      }
    }
    void refresh();
  }, [bootstrapping, remoteCartReady, refresh, mergeGuestCart]);

  const syncRemote = useCallback(
    async (next: CartItem[]) => {
      setItems(next);
      if (!remoteCartReady) {
        writeLocal(next);
        return;
      }
      try {
        const data = await updateCart(
          next.map((item) => ({ product_id: item.product_id, qty: item.qty })),
        );
        setItems(data.items ?? next);
        setError('');
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) return;
        if (isNeedBindMobileError(err)) {
          writeLocal(next);
          return;
        }
        setError(err instanceof Error ? err.message : '购物车同步失败');
      }
    },
    [remoteCartReady],
  );

  const setQty = useCallback(
    async (productId: number, qty: number, meta?: Partial<CartItem>) => {
      const nextQty = Math.min(MAX_QTY, Math.max(0, Math.floor(qty)));
      let next = items.slice();
      const idx = next.findIndex((i) => i.product_id === productId);
      if (nextQty === 0) {
        next = next.filter((i) => i.product_id !== productId);
      } else if (idx >= 0) {
        next[idx] = { ...next[idx], ...meta, qty: nextQty };
      } else if (meta?.title && meta.price_cent != null) {
        next.push({
          product_id: productId,
          sku: meta.sku ?? '',
          title: meta.title,
          cover: meta.cover ?? null,
          price_cent: meta.price_cent,
          stock_summary: meta.stock_summary ?? 0,
          qty: nextQty,
        });
      }
      await syncRemote(next);
    },
    [items, syncRemote],
  );

  const addItem = useCallback(
    async (item: Omit<CartItem, 'qty'> & { qty?: number }) => {
      const addQty = Math.max(1, item.qty ?? 1);
      const existing = items.find((i) => i.product_id === item.product_id);
      const nextQty = (existing?.qty ?? 0) + addQty;
      await setQty(item.product_id, nextQty, item);
    },
    [items, setQty],
  );

  const clearLocal = useCallback(() => {
    setItems([]);
    writeLocal([]);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      amountCent: sumAmount(items),
      count: items.reduce((acc, i) => acc + i.qty, 0),
      loading,
      error,
      refresh,
      setQty,
      addItem,
      clearLocal,
    }),
    [items, loading, error, refresh, setQty, addItem, clearLocal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
