export interface PageResult<T> {
  list: T[];
  total: number;
}

/** 商品富信息 JSON（后台编辑，官网约定含 slogan/tags/specs/highlights） */
export interface ShopProductDetail {
  slogan?: string;
  tags?: string[];
  specs?: Record<string, string>;
  highlights?: string[];
  [extra: string]: unknown;
}

export interface ShopProduct {
  id: number;
  sku: string;
  name: string;
  cover: string | null;
  images?: string[];
  detail?: ShopProductDetail | null;
  price_cent: number;
  stock_summary: number;
  status: 'on' | 'off' | string;
  freight_hint?: string | null;
  description?: string | null;
}

export interface CartItem {
  product_id: number;
  sku: string;
  title: string;
  cover: string | null;
  price_cent: number;
  qty: number;
  stock_summary: number;
}

export interface CartPayload {
  items: CartItem[];
  amount_cent: number;
}

export interface Address {
  id: number;
  name: string;
  mobile: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  is_default: boolean;
}

export type PayChannel = 'wechat' | 'alipay';

export interface CheckoutRequest {
  address_id: number;
  pay_channel: PayChannel;
  items?: { product_id: number; qty: number }[];
}

export interface CheckoutResult {
  order_id: number;
  order_no: string;
  amount_cent: number;
  freight_cent: number;
  pay_channel: PayChannel;
}

export interface OrderItem {
  id: number;
  product_id: number;
  sku: string;
  title: string;
  cover?: string | null;
  price_cent: number;
  qty: number;
  need_sn?: boolean;
  sn_list?: string[];
}

export interface OrderSummary {
  id: number;
  order_no: string;
  status: string;
  pay_channel: PayChannel | null;
  amount_cent: number;
  freight_cent: number;
  created_at: string;
  items?: OrderItem[];
}

export interface OrderDetail extends OrderSummary {
  address_snapshot?: {
    name: string;
    mobile: string;
    province: string;
    city: string;
    district: string;
    detail: string;
  } | null;
  express_company?: string | null;
  express_no?: string | null;
  shipped_at?: string | null;
  refunded_at?: string | null;
  items: OrderItem[];
}

/** 支付场景：page 电脑网站 / wap 手机网站 / app 原生 / qr 支付宝扫码 / native 微信 Native */
export type PayScene = 'page' | 'wap' | 'app' | 'qr' | 'native';

export interface PayParams {
  order_id: number;
  order_no: string;
  channel: PayChannel;
  /** 实际使用的场景（含服务端推断结果） */
  scene?: PayScene | string;
  amount_cent?: number;
  /** 渠道拉起参数（按场景含 pay_url / order_string / qr_code 之一） */
  payload?: {
    out_trade_no?: string;
    pay_url?: string;
    order_string?: string;
    qr_code?: string;
    code_url?: string;
    [extra: string]: unknown;
  };
  pay_url?: string | null;
}

export interface PayResult {
  order_id: number;
  order_no: string;
  status: string;
  amount_cent: number;
  paid: boolean;
  paid_at?: string | null;
  message?: string | null;
}

export interface PointsEntry {
  id: number;
  delta: number;
  balance_after: number;
  reason_code: string;
  remark?: string | null;
  created_at: string;
}

export interface PointsPayload {
  balance: number;
  list: PointsEntry[];
  total: number;
}

export interface BoundDevice {
  id: number;
  product_name: string;
  sku?: string | null;
  sn_masked: string;
  bound_at: string | null;
  activated_at?: string | null;
}

export interface BindDeviceResult {
  success: boolean;
  message?: string | null;
  device?: BoundDevice | null;
  points_delta?: number | null;
}
