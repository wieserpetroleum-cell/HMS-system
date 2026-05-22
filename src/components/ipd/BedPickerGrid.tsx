import * as React from "react";
import { cn } from "@/lib/utils";
import type { WardBed } from "@/lib/types";
import { mockBeds, setBedStatus, bedsByWard } from "@/lib/mock/wards";
import { useAdmissions } from "@/lib/admissions-store";
import { toast } from "sonner";

const statusStyles: Record<WardBed["status"], string> = {
  occupied: "border-primary/40 bg-primary/5 text-foreground",
  available: "border-status-ok/50 bg-status-ok/10 hover:bg-status-ok/20",
  reserved: "border-condition/40 bg-condition/10 text-condition-foreground",
  cleaning: "border-amber-300/50 bg-amber-50/50 text-amber-700",
};

const alertStyles: Record<NonNullable<WardBed["alert"]>, string> = {
  stable: "bg-status-ok/15 text-status-ok",
  watch: "bg-condition/20 text-condition-foreground",
  critical: "bg-allergy/15 text-allergy",
};

interface Props {
  selectedBedId?: string;
  onSelect?: (bed: WardBed) => void;
  readOnly?: boolean;
  filterWard?: string;
  onOccupiedClick?: (bed: WardBed) => void;
}

export function BedPickerGrid({ selectedBedId, onSelect, readOnly, filterWard, onOccupiedClick }: Props) {
  // Use local state to force re-render when bed status changes
  const [beds, setBeds] = React.useState<WardBed[]>([...mockBeds]);
  const { markBedReady } = useAdmissions();

  const handleMarkReady = (bedId: string, bedNumber: string) => {
    setBedStatus(bedId, { 
      status: "available", 
      patientName: undefined, 
      patientId: undefined, 
      alert: undefined, 
      vitalsDue: false 
    });
    // Update local state to trigger re-render immediately
    setBeds([...mockBeds]);
    toast.success(`Bed ${bedNumber} is now available ✓`);
  };

  const wards = React.useMemo(() => {
    const grouped: Record<string, { ward: string; beds: WardBed[]; total: number; occupied: number; available: number }> = {};
    for (const b of beds) {
      if (!grouped[b.ward]) grouped[b.ward] = { ward: b.ward, beds: [], total: 0, occupied: 0, available: 0 };
      grouped[b.ward].beds.push(b);
      grouped[b.ward].total++;
      if (b.status === "occupied") grouped[b.ward].occupied++;
      if (b.status === "available") grouped[b.ward].available++;
    }
    return Object.values(grouped).filter((w) => !filterWard || filterWard === "All" || w.ward === filterWard);
  }, [beds, filterWard]);

  return (
    <div className="space-y-4">
      {wards.map((w) => (
        <div key={w.ward} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-widest">{w.ward}</div>
            <div className="text-[11px] tabular-nums text-muted-foreground">
              {w.occupied}/{w.total} occupied · {w.available} free
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {w.beds.map((b) => {
              const isSelected = b.id === selectedBedId;
              const clickable =
                (!readOnly && b.status === "available" && onSelect) ||
                (b.status === "occupied" && onOccupiedClick);
              return (
                <div key={b.id} className="flex flex-col gap-1">
                  <button
                    type="button"
                    disabled={!clickable}
                    onClick={() => {
                      if (b.status === "available" && onSelect) onSelect(b);
                      else if (b.status === "occupied" && onOccupiedClick) onOccupiedClick(b);
                    }}
                    className={cn(
                      "w-full rounded-md border p-3 text-left text-xs transition-all",
                      statusStyles[b.status],
                      isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-card",
                      clickable ? "cursor-pointer" : "cursor-default",
                    )}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono font-semibold">{b.bedNumber}</span>
                      {b.alert && (
                        <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-bold uppercase", alertStyles[b.alert])}>
                          {b.alert}
                        </span>
                      )}
                    </div>
                    {b.patientName ? (
                      <>
                        {/* Show FULL name - no truncate */}
                        <div className="mt-1 text-[11px] font-medium leading-tight">{b.patientName}</div>
                        <div className="mt-0.5 text-[10px] text-muted-foreground">
                          {b.vitalsDue ? "⚠ Vitals due" : "✓ Up to date"}
                        </div>
                      </>
                    ) : (
                      <div className="mt-1 text-[10px] capitalize text-muted-foreground">{b.status}</div>
                    )}
                  </button>
                  {b.status === "cleaning" && (
                    <button
                      type="button"
                      onClick={() => handleMarkReady(b.id, b.bedNumber)}
                      className="w-full rounded-md border border-status-ok/40 bg-status-ok/10 px-2 py-1.5 text-[11px] font-bold text-status-ok hover:bg-status-ok/20 transition-colors"
                    >
                      🧹 → ✓ Mark Ready
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
