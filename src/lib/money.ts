export const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function money(n: number) {
  return inr.format(Math.round(n));
}

export function ageDays(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

export function ageBucket(days: number): "0-30" | "31-60" | "60+" {
  if (days <= 30) return "0-30";
  if (days <= 60) return "31-60";
  return "60+";
}
