import { cn } from "@/lib/utils";

export function TatGauge({ orderedAt, verifiedAt, targetMin }: { orderedAt: string; verifiedAt?: string; targetMin: number }) {
  const end = verifiedAt ? new Date(verifiedAt).getTime() : Date.now();
  const elapsedMin = Math.max(0, Math.round((end - new Date(orderedAt).getTime()) / 60_000));
  const pct = Math.min(100, Math.round((elapsedMin / targetMin) * 100));
  const over = elapsedMin > targetMin;
  const tone = verifiedAt ? "bg-status-ok" : over ? "bg-allergy" : pct > 80 ? "bg-condition" : "bg-primary";
  const label = elapsedMin < 60 ? `${elapsedMin}m` : `${Math.floor(elapsedMin / 60)}h ${elapsedMin % 60}m`;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full transition-all", tone)} style={{ width: `${pct}%` }} />
      </div>
      <div className={cn("font-mono text-[11px] tabular-nums", over && !verifiedAt && "text-allergy")}>{label} / {targetMin}m</div>
    </div>
  );
}