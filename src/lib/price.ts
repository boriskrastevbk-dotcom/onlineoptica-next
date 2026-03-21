// src/lib/price.ts
const EUR_TO_BGN = 1.95583;

// ако искаш да се вижда двувалутно само до 31.08.2026
const DUAL_UNTIL = new Date("2026-08-31T23:59:59+03:00");

function toNumber(v: string | number): number {
  if (typeof v === "number") return v;
  // приемаме "123.45" от Woo
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export function formatEUR(value: string | number): string {
  const n = toNumber(value);
  return new Intl.NumberFormat("bg-BG", {
    style: "currency",
    currency: "EUR",
    currencyDisplay: "symbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatBGN(valueEUR: string | number): string {
  const eur = toNumber(valueEUR);
  const bgn = eur * EUR_TO_BGN;
  return new Intl.NumberFormat("bg-BG", {
    style: "currency",
    currency: "BGN",
    currencyDisplay: "symbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(bgn);
}

export function formatDual(valueEUR: string | number): string {
  const eur = formatEUR(valueEUR);
  const showDual = new Date() <= DUAL_UNTIL;

  if (!showDual) return eur;

  // пример: "€20.00 (39,12 лв.)"
  return `${eur} (${formatBGN(valueEUR)})`;
}
