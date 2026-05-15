import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "default" | "ok" | "warn" | "danger" | "info";

interface KpiCardProps {
  label: string;
  value: string | number;
  hint?: string;
  trend?: "up" | "down" | "flat";
  trendLabel?: string;
  tone?: Tone;
}

const toneAccent: Record<Tone, string> = {
  default: "bg-primary",
  ok: "bg-status-ok",
  warn: "bg-condition",
  danger: "bg-allergy",
  info: "bg-status-info",
};

export function KpiCard({ label, value, hint, trend, trendLabel, tone = "default" }: KpiCardProps) {
  const Icon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  const trendColor =
    trend === "up" ? "text-status-ok" : trend === "down" ? "text-allergy" : "text-muted-foreground";

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-card p-5">
      <div className={cn("absolute inset-y-0 left-0 w-1", toneAccent[tone])} />
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-3xl font-bold tracking-tight tabular-nums">{value}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
      {trend && (
        <div className={cn("mt-3 flex items-center gap-1 text-xs font-medium", trendColor)}>
          <Icon className="h-3.5 w-3.5" />
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  );
}