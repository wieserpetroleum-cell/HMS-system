import { cn } from "@/lib/utils";
import type { NotificationStatus, TemplateStatus } from "@/lib/types";

const notifStyles: Record<NotificationStatus, string> = {
  delivered: "bg-status-ok/10 text-status-ok border-status-ok/30",
  failed: "bg-allergy/10 text-allergy border-allergy/30",
  pending: "bg-condition/15 text-condition-foreground border-condition/30",
};

const tmplStyles: Record<TemplateStatus, string> = {
  active: "bg-status-ok/10 text-status-ok border-status-ok/30",
  inactive: "bg-muted text-muted-foreground border-border",
  "pending-meta": "bg-condition/15 text-condition-foreground border-condition/30",
  rejected: "bg-allergy/10 text-allergy border-allergy/30",
};

export function NotificationStatusPill({ status, className }: { status: NotificationStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        notifStyles[status],
        className,
      )}
    >
      {status}
    </span>
  );
}

export function TemplateStatusPill({ status, className }: { status: TemplateStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        tmplStyles[status],
        className,
      )}
    >
      {status === "pending-meta" ? "pending meta" : status}
    </span>
  );
}