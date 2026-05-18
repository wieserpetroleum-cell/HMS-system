import { cn } from "@/lib/utils";
import type { RadiologyOrderStatus, RadiologyPriority } from "@/lib/types";

const orderStyles: Record<RadiologyOrderStatus, string> = {
  ordered: "bg-muted text-muted-foreground border-border",
  scheduled: "bg-status-info/10 text-status-info border-status-info/30",
  "in-acquisition": "bg-condition/15 text-condition-foreground border-condition/30",
  acquired: "bg-primary/10 text-primary border-primary/30",
  reporting: "bg-condition/15 text-condition-foreground border-condition/40",
  verified: "bg-status-ok/10 text-status-ok border-status-ok/30",
  delivered: "bg-status-ok/15 text-status-ok border-status-ok/40",
  cancelled: "bg-muted text-muted-foreground line-through border-border",
};

const orderLabels: Record<RadiologyOrderStatus, string> = {
  ordered: "Ordered",
  scheduled: "Scheduled",
  "in-acquisition": "In Acquisition",
  acquired: "Acquired",
  reporting: "Reporting",
  verified: "Verified",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function OrderStatusPill({ status, className }: { status: RadiologyOrderStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", orderStyles[status], className)}>
      {orderLabels[status]}
    </span>
  );
}

const priorityStyles: Record<RadiologyPriority, string> = {
  routine: "bg-muted text-muted-foreground border-border",
  urgent: "bg-condition/15 text-condition-foreground border-condition/40",
  stat: "bg-allergy/15 text-allergy border-allergy/40",
};

export function PriorityBadge({ priority, className }: { priority: RadiologyPriority; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", priorityStyles[priority], className)}>
      {priority === "stat" ? "STAT" : priority}
    </span>
  );
}