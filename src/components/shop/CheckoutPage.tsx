import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Plus } from 'lucide-react';
import { createAddress, fetchAddresses, type AddressInput } from '../../api/addresses';
import { checkout, type PayChannel } from '../../api/orders';
import type { Address, CartItem } from '../../api/types';
import { formatCentLabel } from '../../lib/money';
import { startPay } from '../../lib/pay';
import { useCart } from '../../context/CartContext';
import { BIND_MOBILE_PATH, isNeedBindMobileError } from '../../lib/onboarding';
import PageFrame from '../app/PageFrame';
import ProductCover from '../app/ProductCover';
import EmptyState from '../app/EmptyState';

const EMPTY_ADDRESS: AddressInput = {
  name: '',
  mobile: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  is_default: false,
};

const PHONE_RE = /^1[3-9]\d{9}$/;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items: cartItems, clearLocal, refresh } = useCart();

  /** 直购模式：从商品页「立即购买」带入单件，不影响购物车 */
  const buyNow = (location.state as { buyNow?: CartItem } | null)?.buyNow ?? null;
  const items = useMemo(() => (buyNow ? [buyNow] : cartItems), [buyNow, cartItems]);
  const amountCent = useMemo(
    () => items.reduce((acc, i) => acc + i.price_cent * i.qty, 0),
    [items],
  );
  /** 已下架/删除的行（stock_summary=0）不可结算，需先回购物车移除 */
  const invalidItems = useMemo(
    () => (buyNow ? [] : items.filter((i) => i.stock_summary <= 0)),
    [buyNow, items],
  );

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState<number | null>(null);
  const [channel, setChannel] = useState<PayChannel>('alipay');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [addingAddress, setAddingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressInput>(EMPTY_ADDRESS);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await fetchAddresses();
        if (cancelled) return;
        setAddresses(list);
        const preferred = list.find((a) => a.is_default) ?? list[0];
        setAddressId(preferred?.id ?? null);
        if (list.length === 0) setAddingAddress(true);
      } catch (err) {
        if (cancelled) return;
        if (isNeedBindMobileError(err)) {
          navigate(BIND_MOBILE_PATH, {
            replace: true,
            state: { from: '/checkout', resume: location.state, required: true },
          });
          return;
        }
        setError(err instanceof Error ? err.message : '地址加载失败');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [location.state, navigate]);

  const handleSaveAddress = async (e: FormEvent) => {
    e.preventDefault();
    const f = addressForm;
    if (!f.name.trim() || !f.detail.trim() || !f.province.trim() || !f.city.trim()) {
      setAddressError('请填写收货人、省市与详细地址');
      return;
    }
    if (!PHONE_RE.test(f.mobile.trim())) {
      setAddressError('请输入有效的手机号');
      return;
    }
    setAddressSaving(true);
    setAddressError('');
    try {
      const created = await createAddress({
        ...f,
        is_default: f.is_default || addresses.length === 0,
      });
      const list = await fetchAddresses();
      setAddresses(list);
      setAddressId(created.id ?? list.find((a) => a.is_default)?.id ?? list[0]?.id ?? null);
      setAddingAddress(false);
      setAddressForm(EMPTY_ADDRESS);
    } catch (err) {
      setAddressError(err instanceof Error ? err.message : '地址保存失败');
    } finally {
      setAddressSaving(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!addressId) {
      setError('请选择或添加收货地址');
      return;
    }
    if (items.length === 0) {
      setError('没有可结算的商品');
      return;
    }
    if (invalidItems.length > 0) {
      setError('部分商品已下架或缺货，请回购物车移除后再结算');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      // 购物车结算省略 items：服务端按购物车下单并自动清空；直购传单件，不影响购物车
      const order = await checkout({
        address_id: addressId,
        pay_channel: channel,
        ...(buyNow ? { items: [{ product_id: buyNow.product_id, qty: buyNow.qty }] } : {}),
      });

      if (!buyNow) {
        clearLocal();
        void refresh();
      }

      const resultPath = await startPay({
        orderId: order.order_id,
        orderNo: order.order_no,
        channel,
      });
      if (resultPath) navigate(resultPath, { replace: true });
    } catch (err) {
      if (isNeedBindMobileError(err)) {
        navigate(BIND_MOBILE_PATH, {
          replace: true,
          state: { from: '/checkout', resume: location.state, required: true },
        });
        return;
      }
      setError(err instanceof Error ? err.message : '下单失败');
      setSubmitting(false);
    }
  };

  if (!loading && items.length === 0) {
    return (
      <PageFrame>
        <EmptyState
          title="没有可结算的商品"
          description="请先将商品加入购物车"
          actionLabel="浏览产品"
          actionTo="/products"
        />
      </PageFrame>
    );
  }

  const addressField = (
    key: Exclude<keyof AddressInput, 'is_default'>,
    label: string,
    className = '',
  ) => (
    <label className={`block space-y-1.5 text-sm ${className}`}>
      <span className="text-zinc-400">{label}</span>
      <input
        value={addressForm[key]}
        onChange={(e) => setAddressForm((f) => ({ ...f, [key]: e.target.value }))}
        disabled={addressSaving}
        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/40 disabled:opacity-50"
      />
    </label>
  );

  return (
    <PageFrame>
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">确认订单</h1>
      <p className="mt-2 text-sm text-zinc-400">
        {buyNow ? '单件直购，不影响购物车内商品' : '核对地址、支付方式后提交'}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-medium">收货地址</h2>
              <div className="flex items-center gap-4">
                {!addingAddress ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAddingAddress(true);
                      setAddressError('');
                    }}
                    className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"
                  >
                    <Plus size={14} />
                    新增
                  </button>
                ) : null}
                <Link to="/account/addresses" className="text-sm text-zinc-400 hover:text-white">
                  管理地址
                </Link>
              </div>
            </div>

            {loading ? (
              <Loader2 className="animate-spin text-zinc-500" size={20} />
            ) : (
              <>
                {addresses.length > 0 ? (
                  <div className="space-y-2">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`flex cursor-pointer gap-3 rounded-xl border px-4 py-3 transition-colors ${
                          addressId === addr.id
                            ? 'border-primary/50 bg-primary/10'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          className="mt-1"
                          checked={addressId === addr.id}
                          onChange={() => setAddressId(addr.id)}
                        />
                        <span className="min-w-0 text-sm">
                          <span className="font-medium text-white">
                            {addr.name} {addr.mobile}
                            {addr.is_default ? (
                              <span className="ml-2 text-xs text-zinc-500">默认</span>
                            ) : null}
                          </span>
                          <span className="mt-1 block text-zinc-400">
                            {addr.province}
                            {addr.city}
                            {addr.district}
                            {addr.detail}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                ) : null}

                {addingAddress ? (
                  <div
                    className={`rounded-xl border border-dashed border-white/15 p-4 ${
                      addresses.length > 0 ? 'mt-3' : ''
                    }`}
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      {addressField('name', '收货人')}
                      {addressField('mobile', '手机号')}
                      {addressField('province', '省')}
                      {addressField('city', '市')}
                      {addressField('district', '区/县')}
                      {addressField('detail', '详细地址', 'sm:col-span-2')}
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => void handleSaveAddress(e)}
                        disabled={addressSaving}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-60"
                      >
                        {addressSaving ? <Loader2 size={14} className="animate-spin" /> : null}
                        保存地址
                      </button>
                      {addresses.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setAddingAddress(false);
                            setAddressError('');
                          }}
                          className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-400"
                        >
                          取消
                        </button>
                      ) : null}
                    </div>
                    {addressError ? (
                      <p className="mt-3 text-sm text-red-400" role="alert">
                        {addressError}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
            <h2 className="mb-4 font-medium">支付方式</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  { id: 'alipay' as const, label: '支付宝', note: '跳转收银台' },
                  { id: 'wechat' as const, label: '微信支付', note: '微信扫码' },
                ]
              ).map((opt) => (
                <label
                  key={opt.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                    channel === opt.id
                      ? 'border-primary/50 bg-primary/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="pay"
                    checked={channel === opt.id}
                    onChange={() => setChannel(opt.id)}
                  />
                  {opt.label}
                  {opt.note ? <span className="text-xs text-zinc-500">{opt.note}</span> : null}
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
            <h2 className="mb-4 font-medium">商品清单</h2>
            <ul className="space-y-4">
              {items.map((item) => {
                const invalid = !buyNow && item.stock_summary <= 0;
                return (
                  <li
                    key={item.product_id}
                    className={`flex items-center gap-4 text-sm ${invalid ? 'opacity-50' : ''}`}
                  >
                    <ProductCover
                      src={item.cover}
                      alt={item.title}
                      className="h-14 w-14 shrink-0 rounded-lg"
                    />
                    <span className="min-w-0 flex-1 truncate text-zinc-300">
                      {item.title} × {item.qty}
                      {invalid ? (
                        <span className="ml-2 text-xs text-amber-300">已下架/缺货</span>
                      ) : null}
                    </span>
                    <span className="tabular-nums text-white">
                      {formatCentLabel(item.price_cent * item.qty)}
                    </span>
                  </li>
                );
              })}
            </ul>
            {invalidItems.length > 0 ? (
              <p className="mt-4 text-sm text-amber-300">
                {invalidItems.length} 件商品已下架或缺货，
                <Link to="/cart" className="underline underline-offset-4">
                  回购物车移除
                </Link>
                后才能结算
              </p>
            ) : null}
          </section>
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-28 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex justify-between text-sm text-zinc-400">
              <span>商品金额</span>
              <span className="tabular-nums text-white">{formatCentLabel(amountCent)}</span>
            </div>
            <div className="mt-3 flex justify-between text-sm text-zinc-400">
              <span>运费</span>
              <span>按运费规则计算，支付前确认</span>
            </div>
            <button
              type="submit"
              disabled={
                submitting || !addressId || items.length === 0 || invalidItems.length > 0
              }
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-medium text-black transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {submitting ? '正在下单…' : '提交并支付'}
            </button>
            {error ? (
              <p className="mt-3 text-sm text-red-400" role="alert">
                {error}
              </p>
            ) : null}
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              {channel === 'wechat'
                ? '提交后将展示微信支付二维码，请使用微信扫一扫完成支付。'
                : '提交后将跳转支付宝收银台。未支付订单可在「我的订单」中继续支付。'}
            </p>
          </div>
        </aside>
      </form>
    </PageFrame>
  );
}
