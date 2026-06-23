import * as React from "react";
import { Link } from "react-router-dom";
import { FilePlus2, Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRadiology } from "@/lib/radiology-store";
import { WorklistRow } from "@/components/radiology/WorklistRow";
import type { Modality, RadiologyOrderStatus, RadiologyPriority } from "@/lib/types";
import { modalityLabels } from "@/lib/mock/radiology-catalog";
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
  const { orders } = useRadiology();
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
              <th className="px-4 py-2 text-left">Assigned</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => <WorklistRow key={o.id} order={o} />)}
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
