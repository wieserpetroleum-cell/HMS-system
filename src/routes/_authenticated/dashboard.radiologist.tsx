import * as React from "react";
import { useNavigate, Link } from "react-router-dom";
import { ScanLine, Clock, CheckCircle2, Pen, AlertTriangle } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { OrderStatusPill, PriorityBadge } from "@/components/radiology/StatusPill";
import { useRadiology } from "@/lib/radiology-store";
import { cn } from "@/lib/utils";

function RadiologistDashboard() {
  const navigate = useNavigate();
  const { orders, studies } = useRadiology();

  const today = new Date().toDateString();
  const isToday = (iso: string) => new Date(iso).toDateString() === today;

  const awaitingReport = orders.filter((o) => o.status === "acquired");
  const reporting      = orders.filter((o) => o.status === "reporting");
  const verified       = orders.filter((o) => o.status === "verified" && isToday(o.orderedAt));
  const statOrders     = orders.filter((o) => o.priority === "stat" && !["verified","cancelled","delivered"].includes(o.status));

  const myQueue = [...awaitingReport, ...reporting].sort((a, b) => {
    const p: Record<string, number> = { stat: 0, urgent: 1, routine: 2 };
    return (p[a.priority] ?? 2) - (p[b.priority] ?? 2);
  });

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        eyebrow="Radiology · Radiologist"
        title="Reporting Queue"
        description="Scans awaiting your report, sorted by priority."
        right={
          <Link to="/radiology/worklist" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Full Worklist
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Awaiting Report" value={awaitingReport.length} tone={awaitingReport.length > 0 ? "warn" : "ok"} />
        <KpiCard label="STAT Pending"    value={statOrders.length}    tone={statOrders.length > 0 ? "danger" : "ok"} />
        <KpiCard label="In Reporting"    value={reporting.length}     tone="info" />
        <KpiCard label="Verified Today"  value={verified.length}      tone="ok" />
      </div>

      {statOrders.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-allergy/30 bg-allergy/5 px-4 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-allergy" />
          <p className="text-sm font-semibold text-allergy">{statOrders.length} STAT order(s) require immediate attention!</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="space-y-3 lg:col-span-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pending Reports ({myQueue.length})</div>
          {myQueue.length === 0 && (
            <div className="rounded-lg border border-border bg-card p-10 text-center text-sm text-muted-foreground">✅ No pending reports. All caught up!</div>
          )}
          {myQueue.map((o) => {
            const study = studies.find((s) => s.orderId === o.id);
            return (
              <div key={o.id} className={cn(
                "flex items-center gap-4 rounded-lg border border-border bg-card px-5 py-4",
                o.priority === "stat" && "border-allergy/30 bg-allergy/5",
                o.priority === "urgent" && "border-condition/30 bg-condition/5",
              )}>
                <PriorityBadge priority={o.priority} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{o.studyName}</span>
                    <span className="text-[11px] uppercase text-muted-foreground">({o.modality})</span>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {o.patientName} · <span className="font-mono">{o.patientUid}</span> · {o.orderedBy}
                  </div>
                  {o.clinicalNotes && (
                    <div className="mt-1 line-clamp-1 text-[11px] italic text-muted-foreground">Clinical: {o.clinicalNotes}</div>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <OrderStatusPill status={o.status} />
                  <Link
                    to={`/radiology/studies/${o.id}`}
                    className="rounded bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    Write Report →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <QuickActions actions={[
          { label: "Write Report",   icon: Pen,          onClick: () => navigate("/radiology/worklist") },
          { label: "View PACS",      icon: ScanLine,     onClick: () => navigate("/radiology") },
          { label: "Reported Today", icon: CheckCircle2, onClick: () => navigate("/radiology/worklist") },
          { label: "Avg TAT",        icon: Clock,        onClick: () => navigate("/radiology") },
        ]} />
      </div>
    </div>
  );
}

export default RadiologistDashboard;
