import * as React from "react";
import { Link } from "react-router-dom";
import { FilePlus2, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderStatusPill, PriorityBadge } from "@/components/radiology/StatusPill";
import { TatGauge } from "@/components/radiology/TatGauge";
import { useRadiology } from "@/lib/radiology-store";
import { useAuth } from "@/lib/auth-context";
import { findStudy, modalityLabels } from "@/lib/mock/radiology-catalog";
import type { Modality, RadiologyOrderStatus, RadiologyPriority } from "@/lib/types";
import { cn } from "@/lib/utils";
const STATUSES: { value: RadiologyOrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "ordered", label: "Ordered" },
  { value: "scheduled", label: "Scheduled" },
  { value: "in-acquisition", label: "In Acquisition" },
  { value: "acquired", label: "Acquired" },
  { value: "reporting", label: "Reporting" },
  { value: "verified", label: "Verified" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

function Worklist() {
  const { orders, studies, startAcquisition, completeAcquisition, cancelOrder } = useRadiology();
  const { user } = useAuth();
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<RadiologyOrderStatus | "all">("all");
  const [modality, setModality] = React.useState<Modality | "all">("all");
  const [priority, setPriority] = React.useState<RadiologyPriority | "all">("all");

  const counts = React.useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    orders.forEach((o) => { c[o.status] = (c[o.status] ?? 0) + 1; });
    return c;
  }, [orders]);

  const filtered = orders.filter((o) => {
    if (status !== "all" && o.status !== status) return false;
    if (modality !== "all" && o.modality !== modality) return false;
    if (priority !== "all" && o.priority !== priority) return false;
    if (search) {
      const q = search.toLowerCase();
      if (![o.patientName, o.patientUid, o.orderNo, o.studyName, o.orderedBy].some((v) => v?.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 p-8">
      <PageHeader
        eyebrow="Radiology"
        title="Worklist"
        description={`${filtered.length} of ${orders.length} studies match current filters.`}
        right={
          <Button asChild>
            <Link to="/radiology/orders/new"><FilePlus2 className="mr-2 h-4 w-4" /> New Order</Link>
          </Button>
        }
      />

      <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setStatus(s.value)}
            className={cn(
              "rounded px-3 py-1.5 text-xs font-medium transition",
              status === s.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent/50",
            )}
          >
            {s.label}
            <span className="ml-1.5 rounded bg-black/10 px-1 text-[10px] font-mono tabular-nums dark:bg-white/10">
              {counts[s.value] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3">
        <div className="relative min-w-[260px] flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patient, UID, accession, study…" className="pl-8" />
        </div>
        <select value={modality} onChange={(e) => setModality(e.target.value as Modality | "all")} className="h-9 rounded-md border border-input bg-transparent px-2 text-sm">
          <option value="all">All modalities</option>
          {(Object.keys(modalityLabels) as Modality[]).map((m) => (
            <option key={m} value={m}>{modalityLabels[m]}</option>
          ))}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value as RadiologyPriority | "all")} className="h-9 rounded-md border border-input bg-transparent px-2 text-sm">
          <option value="all">All priorities</option>
          <option value="routine">Routine</option>
          <option value="urgent">Urgent</option>
          <option value="stat">STAT</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <th className="px-4 py-2 text-left">Accession</th>
              <th className="px-4 py-2 text-left">Patient</th>
              <th className="px-4 py-2 text-left">Study</th>
              <th className="px-4 py-2 text-left">Priority</th>
              <th className="px-4 py-2 text-left">Ordered By</th>
              <th className="px-4 py-2 text-left">Ordered At</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">TAT</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => {
              const study = studies.find((s) => s.orderId === o.id);
              const cat = findStudy(o.studyCode);
              return (
                <tr key={o.id} className={cn(
                  "border-b border-border last:border-0 hover:bg-accent/30",
                  o.priority === "stat" && "bg-allergy/5"
                )}>
                  <td className="px-4 py-2.5 font-mono text-[11px]">
                    <Link to={`/radiology/orders/${o.id}`} className="text-primary hover:underline">{o.orderNo}</Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="font-medium">{o.patientName}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{o.patientUid}</div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="text-sm">{o.studyName}</div>
                    <div className="text-[10px] uppercase text-muted-foreground">{o.modality}</div>
                  </td>
                  <td className="px-4 py-2.5"><PriorityBadge priority={o.priority} /></td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{o.orderedBy}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{new Date(o.orderedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td className="px-4 py-2.5"><OrderStatusPill status={o.status} /></td>
                  <td className="px-4 py-2.5">
                    {cat && <TatGauge orderedAt={o.orderedAt} targetMin={findStudy(o.studyCode)?.targetTatMin ?? 60} />}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      {(o.status === "ordered" || o.status === "scheduled") && (
                        <button onClick={() => { startAcquisition(o.id); toast.success(`Acquisition started for ${o.patientName}`); }}
                          className="rounded bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
                          Start Scan
                        </button>
                      )}
                      {o.status === "in-acquisition" && (
                        <button onClick={() => { completeAcquisition(o.id, { series: [{ description: "Standard", imageCount: 12 }], technologist: user?.name ?? "Tech" }); toast.success("Acquisition complete"); }}
                          className="rounded bg-status-ok px-2.5 py-1 text-xs font-semibold text-white hover:bg-status-ok/90">
                          Complete ✓
                        </button>
                      )}
                      {(o.status === "acquired" || o.status === "reporting") && (
                        <Link to={study ? `/radiology/studies/${study.id}` : `/radiology/orders/${o.id}`}
                          className="rounded bg-condition px-2.5 py-1 text-xs font-semibold text-white hover:bg-condition/90">
                          Write Report →
                        </Link>
                      )}
                      {o.status === "verified" && study && (
                        <Link to={`/radiology/studies/${study.id}/report`}
                          className="rounded bg-secondary px-2.5 py-1 text-xs font-semibold hover:bg-secondary/80">
                          View Report
                        </Link>
                      )}
                      {o.status !== "cancelled" && o.status !== "verified" && (
                        <button onClick={() => { cancelOrder(o.id, "Cancelled from worklist"); toast.error("Order cancelled"); }}
                          className="rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:border-allergy hover:text-allergy">
                          ✕
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">No studies match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Worklist;
