import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { BedDouble, Activity, AlertTriangle, Plus, LayoutGrid, Rows } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Button } from "@/components/ui/button";
import { BedPickerGrid } from "@/components/ipd/BedPickerGrid";
import { StatusPill } from "@/components/ipd/StatusPill";
import { BedOccupancyBar } from "@/components/dashboard/BedOccupancyBar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockBeds, wardSummary, bedsByWard } from "@/lib/mock/wards";
import { useAdmissions } from "@/lib/admissions-store";
import { cn } from "@/lib/utils";
const WARDS = ["All", "ICU", "General A", "General B", "Pediatric"];

function FloorView() {
  const summary = wardSummary();
  const vitalsDue = mockBeds.filter((b) => b.status === "occupied" && b.vitalsDue).length;
  const alerts = mockBeds.filter((b) => b.alert === "critical" || b.alert === "watch").length;
  const navigate = useNavigate();
  const [ward, setWard] = React.useState("All");
  const [view, setView] = React.useState<"grid" | "table">("grid");
  const { admissions } = useAdmissions();

  const activeAdmissions = admissions.filter((a) => a.status === "active");

  const goToBed = (bedId: string) => {
    const adm = activeAdmissions.find((a) => a.bedId === bedId);
    if (adm) navigate(`/ipd/${adm.id}`);
  };

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-start justify-between gap-4">
        <PageHeader eyebrow="IPD" title="Ward floor view" description="Live bed status across all wards. Click any occupied bed to open the patient chart." />
        <Button asChild>
          <Link to="/ipd/admit">
            <Plus className="mr-1.5 h-4 w-4" /> New Admission
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <KpiCard label="Total Beds" value={summary.total} />
        <KpiCard label="Occupied" value={summary.occupied} tone="info" />
        <KpiCard label="Available" value={summary.available} tone="ok" />
        <KpiCard label="Vitals Due" value={vitalsDue} tone="warn" />
        <KpiCard label="Active Alerts" value={alerts} tone={alerts > 0 ? "danger" : "ok"} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {WARDS.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setWard(w)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                ward === w
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {w}
            </button>
          ))}
        </div>
        <div className="inline-flex rounded-md border border-border bg-card p-0.5">
          <button
            type="button"
            onClick={() => setView("grid")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium",
              view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Grid
          </button>
          <button
            type="button"
            onClick={() => setView("table")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium",
              view === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            <Rows className="h-3.5 w-3.5" /> Table
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {bedsByWard()
          .filter((w) => ward === "All" || w.ward === ward)
          .map((w) => (
            <div key={w.ward} className="rounded-lg border border-border bg-card p-4">
              <BedOccupancyBar ward={w.ward} total={w.total} occupied={w.occupied} available={w.available} />
            </div>
          ))}
      </div>

      {view === "grid" ? (
        <BedPickerGrid filterWard={ward} readOnly onOccupiedClick={(b) => goToBed(b.id)} />
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bed</TableHead>
                <TableHead>Ward</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Alert</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBeds
                .filter((b) => ward === "All" || b.ward === ward)
                .map((b) => {
                  const adm = activeAdmissions.find((a) => a.bedId === b.id);
                  return (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-xs font-semibold">{b.bedNumber}</TableCell>
                      <TableCell className="text-xs">{b.ward}</TableCell>
                      <TableCell>
                        <StatusPill
                          tone={
                            b.status === "occupied"
                              ? "info"
                              : b.status === "available"
                                ? "ok"
                                : b.status === "reserved"
                                  ? "warn"
                                  : "neutral"
                          }
                        >
                          {b.status}
                        </StatusPill>
                      </TableCell>
                      <TableCell className="text-xs">{b.patientName ?? "—"}</TableCell>
                      <TableCell className="text-xs">{adm?.primaryDoctor ?? "—"}</TableCell>
                      <TableCell>
                        {b.alert ? (
                          <StatusPill tone={b.alert === "critical" ? "danger" : b.alert === "watch" ? "warn" : "ok"}>
                            {b.alert}
                          </StatusPill>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {adm ? (
                          <Button asChild size="sm" variant="outline">
                            <Link to={`/ipd/${adm.id}`}>
                              <Activity className="mr-1.5 h-3.5 w-3.5" /> Open Chart
                            </Link>
                          </Button>
                        ) : b.status === "available" ? (
                          <Button asChild size="sm">
                            <Link to="/ipd/admit">
                              <BedDouble className="mr-1.5 h-3.5 w-3.5" /> Admit
                            </Link>
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      )}

      {alerts === 0 && view === "grid" && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <AlertTriangle className="h-3 w-3" /> No critical alerts. All occupied beds within stable parameters.
        </p>
      )}
    </div>
  );
}export default FloorView;
