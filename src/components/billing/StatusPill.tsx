import { cn } from "@/lib/utils";
import type { InvoiceStatus, TpaClaimStatus } from "@/lib/types";

const invoiceStyles: Record<InvoiceStatus, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  pending: "bg-condition/15 text-condition-foreground border-condition/30",
  partial: "bg-status-info/10 text-status-info border-status-info/30",
  paid: "bg-status-ok/10 text-status-ok border-status-ok/30",
  "tpa-pending": "bg-primary/10 text-primary border-primary/30",
  overdue: "bg-allergy/10 text-allergy border-allergy/30",
  cancelled: "bg-muted text-muted-foreground line-through border-border",
};

const tpaStyles: Record<TpaClaimStatus, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  "pre-auth": "bg-status-info/10 text-status-info border-status-info/30",
  submitted: "bg-primary/10 text-primary border-primary/30",
  query: "bg-condition/15 text-condition-foreground border-condition/30",
  approved: "bg-status-ok/10 text-status-ok border-status-ok/30",
  settled: "bg-status-ok/15 text-status-ok border-status-ok/40",
  rejected: "bg-allergy/10 text-allergy border-allergy/30",
};

export function InvoiceStatusPill({ status, className }: { status: InvoiceStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", invoiceStyles[status], className)}>
      {status}
    </span>
  );
}

export function TpaStatusPill({ status, className }: { status: TpaClaimStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", tpaStyles[status], className)}>
      {status}
    </span>
  );
}
