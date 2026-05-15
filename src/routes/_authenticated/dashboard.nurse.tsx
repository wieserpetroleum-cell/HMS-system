import { createFileRoute } from "@tanstack/react-router";
import { Activity, Pill, AlertTriangle, ClipboardList } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { bedsByWard, mockBeds } from "@/lib/mock/wards";
import { cn } from "@/lib/utils";
import type { WardBed } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/dashboard/nurse")({
  component: NurseDashboard,
});

const statusStyles: Record<WardBed["status"], string> = {
  occupied: "border-primary/40 bg-primary/5",
  available: "border-status-ok/40 bg-status-ok/5",
  reserved: "border-condition/40 bg-condition/5",
  cleaning: "border-border bg-muted",
};

const alertStyles: Record<NonNullable<WardBed["alert"]>, string> = {
  stable: "bg-status-ok/10 text-status-ok",
  watch: "bg-condition/15 text-condition",
  critical: "bg-allergy/10 text-allergy",
};

function NurseDashboard() {
  const occupied = mockBeds.filter((b) => b.status === "occupied");
  const vitalsDue = occupied.filter((b) => b.vitalsDue).length;
  const alerts = occupied.filter((b) => b.alert === "critical" || b.alert === "watch").length;

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        eyebrow="Nursing"
        title="Ward floor overview"
        description="Patients under care, vitals due and active alerts."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Beds Under Care" value={occupied.length} tone="info" />
        <KpiCard label="Vitals Due" value={vitalsDue} tone="warn" />
        <KpiCard label="Medication Rounds" value={4} />
        <KpiCard label="Active Alerts" value={alerts} tone={alerts > 0 ? "danger" : "ok"} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-3">
          {bedsByWard().map((w) => (
            <div key={w.ward} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{w.ward}</div>
                <div className="text-xs text-muted-foreground tabular-nums">
                  {w.occupied}/{w.total} occupied
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                {w.beds.map((b) => (
                  <div
                    key={b.id}
                    className={cn(
                      "rounded-md border p-3 text-xs transition-colors",
                      statusStyles[b.status],
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold">{b.bedNumber}</span>
                      {b.alert && (
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase",
                            alertStyles[b.alert],
                          )}
                        >
                          {b.alert}
                        </span>
                      )}
                    </div>
                    {b.patientName ? (
                      <>
                        <div className="mt-1 truncate text-[11px] font-medium">{b.patientName}</div>
                        <div className="mt-1 text-[10px] text-muted-foreground">
                          {b.vitalsDue ? "Vitals due" : "Up to date"}
                        </div>
                      </>
                    ) : (
                      <div className="mt-1 text-[10px] capitalize text-muted-foreground">
                        {b.status}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <QuickActions
          actions={[
            { label: "Record Vitals", icon: Activity },
            { label: "Administer Meds", icon: Pill },
            { label: "Raise Alert", icon: AlertTriangle },
            { label: "Care Notes", icon: ClipboardList },
          ]}
        />
      </div>
    </div>
  );
}