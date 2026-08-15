export type OrderStatus =
  | 'pending_pay'
  | 'paid'
  | 'shipped'
  | 'completed'
  | 'refunded'
  | 'cancelled';

const LABELS: Record<OrderStatus, string> = {
  pending_pay: '待支付',
  paid: '已支付',
  shipped: '已发货',
  completed: '已完成',
  refunded: '已退款',
  cancelled: '已取消',
};

const TONES: Record<OrderStatus, string> = {
  pending_pay: 'text-amber-300 bg-amber-400/10 border-amber-400/20',
  paid: 'text-sky-300 bg-sky-400/10 border-sky-400/20',
  shipped: 'text-violet-300 bg-violet-400/10 border-violet-400/20',
  completed: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20',
  refunded: 'text-zinc-400 bg-white/5 border-white/10',
  cancelled: 'text-zinc-500 bg-white/5 border-white/10',
};

export function orderStatusLabel(status: string): string {
  return LABELS[status as OrderStatus] ?? status;
}

export function orderStatusTone(status: string): string {
  return TONES[status as OrderStatus] ?? 'text-zinc-300 bg-white/5 border-white/10';
}

export const ORDER_STATUS_FILTERS: { value: '' | OrderStatus; label: string }[] = [
  { value: '', label: '全部' },
  { value: 'pending_pay', label: '待支付' },
  { value: 'paid', label: '已支付' },
  { value: 'shipped', label: '已发货' },
  { value: 'completed', label: '已完成' },
  { value: 'refunded', label: '已退款' },
];
