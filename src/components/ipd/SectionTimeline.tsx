import { cn } from "@/lib/utils";

interface TimelineItem {
  id: string;
  at: string;
  by: string;
  label?: string;
  tone?: "primary" | "condition" | "status-ok" | "allergy" | "muted";
  body: React.ReactNode;
}

const dotTone: Record<NonNullable<TimelineItem["tone"]>, string> = {
  primary: "bg-primary",
  condition: "bg-condition",
  "status-ok": "bg-status-ok",
  allergy: "bg-allergy",
  muted: "bg-muted-foreground",
};

export function SectionTimeline({ items }: { items: TimelineItem[] }) {
  if (items.length === 0) {
    return <p className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">No entries yet.</p>;
  }
  return (
    <ol className="relative space-y-4 border-l border-border pl-5">
      {items.map((it) => (
        <li key={it.id} className="relative">
          <span
            className={cn(
              "absolute -left-[1.4rem] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-background",
              dotTone[it.tone ?? "primary"],
            )}
          />
          <div className="flex flex-wrap items-baseline gap-2">
            <time className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {new Date(it.at).toLocaleString([], { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
            </time>
            {it.label && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {it.label}
              </span>
            )}
            <span className="text-[11px] font-medium text-muted-foreground">· {it.by}</span>
          </div>
          <div className="mt-1 text-sm">{it.body}</div>
        </li>
      ))}
    </ol>
  );
}