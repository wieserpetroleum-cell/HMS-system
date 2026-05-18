import type { AuditEvent } from "@/lib/types";
import { Circle } from "lucide-react";

export function AuditTimeline({ events }: { events: AuditEvent[] }) {
  if (events.length === 0) return <div className="text-sm text-muted-foreground">No events yet.</div>;
  return (
    <ol className="relative space-y-4 border-l border-border pl-5">
      {events.map((e, i) => (
        <li key={i} className="relative">
          <Circle className="absolute -left-[27px] top-1 h-3 w-3 fill-primary text-primary" />
          <div className="flex items-baseline justify-between gap-3">
            <div className="text-sm font-medium">{e.action}</div>
            <div className="text-[11px] text-muted-foreground">{new Date(e.at).toLocaleString()}</div>
          </div>
          {e.detail && <div className="text-xs text-muted-foreground">{e.detail}</div>}
          <div className="text-[11px] text-muted-foreground">by {e.by}</div>
        </li>
      ))}
    </ol>
  );
}
