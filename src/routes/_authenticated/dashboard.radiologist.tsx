
import { ScanLine, Clock, CheckCircle2, Pen } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { mockOrders } from "@/lib/mock/radiology";
import { cn } from "@/lib/utils";
import type { RadPriority } from "@/lib/types";
const priorityStyle: Record<RadPriority, string> = {
  stat:    "bg-allergy text-white",
  urgent:  "bg-condition/15 text-condition",
  routine: "bg-muted text-muted-foreground",
};

function RadiologistDashboard() {
  const stat    = mockOrders.filter(r => r.priority === "stat").length;
  const urgent  = mockOrders.filter(r => r.priority === "urgent").length;

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        eyebrow="Radiology"
        title="Reporting queue"
        description="Scans awaiting your report, sorted by priority."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Pending Reports" value={mockOrders.length} tone={stat > 0 ? "danger" : "warn"} />
        <KpiCard label="STAT"            value={stat}   tone="danger" />
        <KpiCard label="Urgent"          value={urgent} tone="warn" />
        <KpiCard label="Reported Today"  value={6}      tone="ok" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="space-y-3 lg:col-span-3">
          {mockOrders.map(r => (
            <div
              key={r.id}
              className={cn(
                "flex items-center gap-4 rounded-lg border border-border bg-card px-5 py-4",
                r.priority === "stat" && "border-allergy/30 bg-allergy/5",
              )}
            >
              <span className={cn("rounded px-2 py-0.5 text-[10px] font-bold uppercase shrink-0", priorityStyle[r.priority])}>
                {r.priority}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{r.test}</span>
                  <span className="text-[11px] text-muted-foreground">({r.modality})</span>
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {r.patient} · {r.uid} · Ordered by {r.orderedBy}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <div className="text-xs text-muted-foreground">Scan done {r.completedAt}</div>
                <button className="rounded bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                  Write Report
                </button>
              </div>
            </div>
          ))}
        </div>

        <QuickActions actions={[
          { label: "Write Report",  icon: Pen },
          { label: "View PACS",     icon: ScanLine },
          { label: "Reported Today",icon: CheckCircle2 },
          { label: "Avg TAT",       icon: Clock },
        ]} />
      </div>
    </div>
  );
}
export default RadiologistDashboard;
