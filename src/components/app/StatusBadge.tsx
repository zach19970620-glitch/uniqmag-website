import { orderStatusLabel, orderStatusTone } from '../../lib/orderStatus';

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs ${orderStatusTone(status)}`}
    >
      {orderStatusLabel(status)}
    </span>
  );
}
