import { cn } from "@/lib/utils";

export interface RecentRow {
  id: string;
  primary: string;
  secondary?: string;
  meta?: string;
  badge?: { label: string; tone?: "ok" | "warn" | "danger" | "info" | "default" };
}

const badgeTone: Record<NonNullable<NonNullable<RecentRow["badge"]>["tone"]>, string> = {
  default: "bg-muted text-muted-foreground",
  ok: "bg-status-ok/10 text-status-ok",
  warn: "bg-condition/15 text-condition",
  danger: "bg-allergy/10 text-allergy",
  info: "bg-status-info/10 text-status-info",
};

export function RecentList({ title, rows, emptyText = "Nothing here yet." }: { title: string; rows: RecentRow[]; emptyText?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {title}
        </div>
        <span className="text-[10px] tabular-nums text-muted-foreground">{rows.length}</span>
      </div>
      <ul className="divide-y divide-border">
        {rows.length === 0 ? (
          <li className="px-5 py-6 text-center text-xs text-muted-foreground">{emptyText}</li>
        ) : (
          rows.map((r) => (
            <li key={r.id} className="flex items-center gap-3 px-5 py-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{r.primary}</div>
                {r.secondary && (
                  <div className="truncate text-xs text-muted-foreground">{r.secondary}</div>
                )}
              </div>
              {r.meta && <div className="text-xs tabular-nums text-muted-foreground">{r.meta}</div>}
              {r.badge && (
                <span
                  className={cn(
                    "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    badgeTone[r.badge.tone ?? "default"],
                  )}
                >
                  {r.badge.label}
                </span>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}