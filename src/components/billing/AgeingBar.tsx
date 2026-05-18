import { money } from "@/lib/money";

export function AgeingBar({ buckets }: { buckets: Record<string, number> }) {
  const total = Object.values(buckets).reduce((a, b) => a + b, 0) || 1;
  const entries = Object.entries(buckets);
  const tone = (key: string) =>
    key === "0-30" ? "bg-status-ok" : key === "31-60" ? "bg-condition" : "bg-allergy";

  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-muted">
        {entries.map(([k, v]) => (
          <div key={k} className={tone(k)} style={{ width: `${(v / total) * 100}%` }} title={`${k}: ${money(v)}`} />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        {entries.map(([k, v]) => (
          <div key={k} className="rounded border border-border bg-card px-3 py-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{k} days</div>
            <div className="mt-0.5 font-semibold tabular-nums">{money(v)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
