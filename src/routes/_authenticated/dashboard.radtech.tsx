
import { useNavigate } from "react-router-dom";
import { ScanLine, Calendar, Activity, FileText } from "lucide-react";
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

function RadtechDashboard() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6 p-8">
      <PageHeader
        eyebrow="Radiology"
        title="Today's scan worklist"
        description="Scheduled scans, patient arrivals and scan status."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Scheduled Today" value={8}                          tone="info" />
        <KpiCard label="Scans Done"      value={mockOrders.length}       tone="ok" />
        <KpiCard label="In Progress"     value={1}                          tone="warn" />
        <KpiCard label="Awaiting Report" value={mockOrders.length}       tone="default" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3 rounded-lg border border-border bg-card">
          <div className="border-b border-border px-5 py-3.5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Worklist
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {["Priority","Patient","Test","Modality","Ordered by","Time","Status",""].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockOrders.map(r => (
                <tr key={r.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold uppercase", priorityStyle[r.priority])}>
                      {r.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{r.patient}</td>
                  <td className="px-4 py-3">{r.test}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.modality}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.orderedBy}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.completedAt}</td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-status-ok/10 px-1.5 py-0.5 text-[10px] font-semibold text-status-ok">
                      Scan Done
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-[11px] font-medium text-primary hover:underline">Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <QuickActions actions={[
          { label: "Mark Arrived",   icon: Activity },
          { label: "Start Scan",     icon: ScanLine },
          { label: "Today's List",   icon: Calendar },
          { label: "Upload Images",  icon: FileText },
        ]} />
      </div>
    </div>
  );
}
export default RadtechDashboard;
