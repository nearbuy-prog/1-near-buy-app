/**
 * OMR formatting — Omani Rial uses 3 decimals (1 OMR = 1000 baisa).
 * We render OMR explicitly with 3 decimal places per the user's spec.
 */

const formatter = new Intl.NumberFormat("en-OM", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

export function formatOMR(amount: number): string {
  return `OMR ${formatter.format(amount)}`;
}

export function formatPriceCompact(amount: number): string {
  return formatter.format(amount);
}

export function discountPercent(price: number, original: number): number {
  if (!original || original <= price) return 0;
  return Math.round(((original - price) / original) * 100);
}
