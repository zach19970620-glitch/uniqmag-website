/** 金额单位：分 → 展示元 */
export function formatCent(cent: number | null | undefined): string {
  const n = Number(cent ?? 0);
  return (n / 100).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatCentLabel(cent: number | null | undefined): string {
  return `¥${formatCent(cent)}`;
}
