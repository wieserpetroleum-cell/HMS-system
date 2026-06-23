import * as React from "react";
import { useNavigate, Link } from "react-router-dom";
import { ScanLine, Calendar, Activity, FileText } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { OrderStatusPill, PriorityBadge } from "@/components/radiology/StatusPill";
import { useRadiology } from "@/lib/radiology-store";
import { cn } from "@/lib/utils";

function RadtechDashboard() {
  const navigate = useNavigate();
  const { orders, startAcquisition, completeAcquisition } = useRadiology();

  const today = new Date().toDateString();
  const isToday = (iso: string) => new Date(iso).toDateString() === today;

  const scheduled    = orders.filter((o) => o.status === "scheduled");
  const inAcquisition = orders.filter((o) => o.status === "in-acquisition");
  const acquired     = orders.filter((o) => o.status === "acquired" && isToday(o.orderedAt));
  const myWorklist   = orders.filter((o) => ["ordered", "scheduled", "in-acquisition"].includes(o.status));

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        eyebrow="Radiology · Rad Tech"
        title="Today's Scan Worklist"
        description="Scheduled scans, patient arrivals and acquisition status."
        right={
          <Link to="/radiology/worklist" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Full Worklist
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Scheduled"      value={scheduled.length}     tone="info" />
        <KpiCard label="In Acquisition" value={inAcquisition.length} tone="warn" />
        <KpiCard label="Scans Done"     value={acquired.length}      tone="ok" />
        <KpiCard label="Pending"        value={myWorklist.length}    tone="default" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3 overflow-hidden rounded-lg border border-border bg-card">
          <div className="border-b border-border px-5 py-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Worklist — Pending Scans ({myWorklist.length})
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-2.5 text-left">Priority</th>
                <th className="px-4 py-2.5 text-left">Patient</th>
                <th className="px-4 py-2.5 text-left">Study</th>
                <th className="px-4 py-2.5 text-left">Modality</th>
                <th className="px-4 py-2.5 text-left">Ordered By</th>
                <th className="px-4 py-2.5 text-left">Status</th>
                <th className="px-4 py-2.5 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {myWorklist.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">✅ No pending scans!</td></tr>
              )}
              {myWorklist.map((o) => (
                <tr key={o.id} className={cn("hover:bg-muted/20", o.priority === "stat" && "bg-allergy/5")}>
                  <td className="px-4 py-3"><PriorityBadge priority={o.priority} /></td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{o.patientName}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{o.patientUid}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">{o.studyName}</td>
                  <td className="px-4 py-3 text-xs uppercase text-muted-foreground">{o.modality}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{o.orderedBy}</td>
                  <td className="px-4 py-3"><OrderStatusPill status={o.status} /></td>
                  <td className="px-4 py-3">
                    {o.status === "ordered" || o.status === "scheduled" ? (
                      <button
                        onClick={() => startAcquisition(o.id)}
                        className="rounded bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                      >
                        Start Scan
                      </button>
                    ) : o.status === "in-acquisition" ? (
                      <button
                        onClick={() => completeAcquisition(o.id, { series: [{ description: "Standard series", imageCount: 12 }], technologist: "Rad Tech" })}
                        className="rounded bg-status-ok px-3 py-1 text-xs font-semibold text-white hover:bg-status-ok/90"
                      >
                        Complete ✓
                      </button>
                    ) : (
                      <Link to={`/radiology/orders/${o.id}`} className="text-xs text-primary hover:underline">View</Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <QuickActions actions={[
          { label: "Mark Arrived", icon: Activity, onClick: () => navigate("/radiology/worklist") },
          { label: "Start Scan",   icon: ScanLine,  onClick: () => navigate("/radiology/worklist") },
          { label: "Today's List", icon: Calendar,  onClick: () => navigate("/radiology/worklist") },
          { label: "Upload Images",icon: FileText,  onClick: () => navigate("/radiology") },
        ]} />
      </div>
    </div>
  );
}

export default RadtechDashboard;
