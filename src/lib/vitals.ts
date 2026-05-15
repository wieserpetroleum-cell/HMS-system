export function calcBmi(weightKg?: number, heightCm?: number): number | undefined {
  if (!weightKg || !heightCm || heightCm <= 0) return undefined;
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}

export interface VitalFlag {
  level: "ok" | "watch" | "alert";
  note?: string;
}

export function flagBp(bp?: string): VitalFlag {
  if (!bp) return { level: "ok" };
  const m = bp.match(/^(\d{2,3})\s*\/\s*(\d{2,3})$/);
  if (!m) return { level: "ok" };
  const [s, d] = [Number(m[1]), Number(m[2])];
  if (s >= 160 || d >= 100) return { level: "alert", note: "Stage 2 HTN" };
  if (s >= 140 || d >= 90) return { level: "watch", note: "Stage 1 HTN" };
  if (s < 90 || d < 60) return { level: "watch", note: "Hypotension" };
  return { level: "ok" };
}

export function flagSpo2(v?: number): VitalFlag {
  if (v == null) return { level: "ok" };
  if (v < 90) return { level: "alert", note: "Severe hypoxia" };
  if (v < 94) return { level: "watch", note: "Low SpO₂" };
  return { level: "ok" };
}

export function flagPulse(v?: number): VitalFlag {
  if (v == null) return { level: "ok" };
  if (v < 50 || v > 120) return { level: "alert" };
  if (v < 60 || v > 100) return { level: "watch" };
  return { level: "ok" };
}

export function flagTemp(v?: number): VitalFlag {
  if (v == null) return { level: "ok" };
  if (v >= 39) return { level: "alert", note: "High fever" };
  if (v >= 37.8) return { level: "watch", note: "Febrile" };
  if (v < 35) return { level: "alert", note: "Hypothermia" };
  return { level: "ok" };
}
