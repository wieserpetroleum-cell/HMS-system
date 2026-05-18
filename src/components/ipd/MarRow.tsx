import { Check, X, Clock } from "lucide-react";
import type { MarEntry, MarStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  entry: MarEntry;
  onMark: (slotIndex: number, status: MarStatus) => void;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}
function fmtDay(iso: string) {
  return new Date(iso).toLocaleDateString([], { weekday: "short", day: "numeric" });
}

const slotStyles = {
  due: "border-condition/50 bg-condition/10 text-condition-foreground",
  given: "border-status-ok/50 bg-status-ok/15 text-status-ok",
  missed: "border-allergy/40 bg-allergy/10 text-allergy",
  refused: "border-muted-foreground/30 bg-muted text-muted-foreground line-through",
} as const;

export function MarRow({ entry, onMark }: Props) {
  const byDay = new Map<string, { slot: typeof entry.schedule[number]; idx: number }[]>();
  entry.schedule.forEach((slot, idx) => {
    const key = fmtDay(slot.scheduledFor);
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push({ slot, idx });
  });

  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <div className="text-sm font-semibold">
            {entry.drug} {entry.strength && <span className="text-muted-foreground">· {entry.strength}</span>}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {entry.dose} · {entry.route} · {entry.frequencyLabel}
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {Array.from(byDay.entries()).map(([day, slots]) => (
          <div key={day} className="flex flex-wrap items-center gap-2">
            <div className="w-16 shrink-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {day}
            </div>
            {slots.map(({ slot, idx }) => {
              const status = slot.status;
              return (
                <div
                  key={idx}
                  className={cn(
                    "group inline-flex items-center gap-1 rounded border px-2 py-1 text-[11px] tabular-nums",
                    slotStyles[status],
                  )}
                >
                  <Clock className="h-3 w-3" />
                  <span>{fmtTime(slot.scheduledFor)}</span>
                  {status === "given" && <Check className="h-3 w-3" />}
                  {status === "missed" && <X className="h-3 w-3" />}
                  {status === "due" && (
                    <div className="ml-1 hidden gap-0.5 group-hover:inline-flex">
                      <button
                        type="button"
                        onClick={() => onMark(idx, "given")}
                        className="rounded bg-status-ok/20 px-1 py-0.5 text-[9px] font-bold text-status-ok hover:bg-status-ok/30"
                      >
                        GIVE
                      </button>
                      <button
                        type="button"
                        onClick={() => onMark(idx, "missed")}
                        className="rounded bg-allergy/15 px-1 py-0.5 text-[9px] font-bold text-allergy hover:bg-allergy/25"
                      >
                        MISS
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}