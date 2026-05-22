import * as React from "react";
import { cn } from "@/lib/utils";
import type { WardBed } from "@/lib/types";
import { bedsByWard } from "@/lib/mock/wards";
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
  const wards = bedsByWard().filter((w) => !filterWard || filterWard === "All" || w.ward === filterWard);
  const { markBedReady } = useAdmissions();

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
                <div key={b.id} className="relative">
                  <button
                    type="button"
                    disabled={!clickable && b.status !== "cleaning"}
                    onClick={() => {
                      if (b.status === "available" && onSelect) onSelect(b);
                      else if (b.status === "occupied" && onOccupiedClick) onOccupiedClick(b);
                    }}
                    className={cn(
                      "w-full rounded-md border p-3 text-left text-xs transition-all",
                      statusStyles[b.status],
                      isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-card",
                      clickable ? "cursor-pointer" : "cursor-default opacity-90",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold">{b.bedNumber}</span>
                      {b.alert && (
                        <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-bold uppercase", alertStyles[b.alert])}>
                          {b.alert}
                        </span>
                      )}
                      {b.status === "cleaning" && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-700">
                          🧹 cleaning
                        </span>
                      )}
                    </div>
                    {b.patientName ? (
                      <>
                        <div className="mt-1 truncate text-[11px] font-medium">{b.patientName}</div>
                        <div className="mt-0.5 text-[10px] text-muted-foreground">
                          {b.vitalsDue ? "Vitals due" : "Up to date"}
                        </div>
                      </>
                    ) : (
                      <div className="mt-1 text-[10px] capitalize text-muted-foreground">{b.status}</div>
                    )}
                    {b.status === "cleaning" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markBedReady(b.id);
                          toast.success(`Bed ${b.bedNumber} is now available`);
                        }}
                        className="mt-2 w-full rounded bg-status-ok/20 px-2 py-1 text-[10px] font-bold text-status-ok hover:bg-status-ok/30 transition-colors"
                      >
                        ✓ Mark Ready
                      </button>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

const statusStyles: Record<WardBed["status"], string> = {
  occupied: "border-primary/40 bg-primary/5 text-foreground",
  available: "border-status-ok/50 bg-status-ok/10 hover:bg-status-ok/20",
  reserved: "border-condition/40 bg-condition/10 text-condition-foreground",
  cleaning: "border-border bg-muted text-muted-foreground",
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
  const wards = bedsByWard().filter((w) => !filterWard || filterWard === "All" || w.ward === filterWard);

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
                <button
                  key={b.id}
                  type="button"
                  disabled={!clickable}
                  onClick={() => {
                    if (b.status === "available" && onSelect) onSelect(b);
                    else if (b.status === "occupied" && onOccupiedClick) onOccupiedClick(b);
                  }}
                  className={cn(
                    "rounded-md border p-3 text-left text-xs transition-all",
                    statusStyles[b.status],
                    isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-card",
                    clickable ? "cursor-pointer" : "cursor-not-allowed opacity-90",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold">{b.bedNumber}</span>
                    {b.alert && (
                      <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-bold uppercase", alertStyles[b.alert])}>
                        {b.alert}
                      </span>
                    )}
                  </div>
                  {b.patientName ? (
                    <>
                      <div className="mt-1 truncate text-[11px] font-medium">{b.patientName}</div>
                      <div className="mt-0.5 text-[10px] text-muted-foreground">
                        {b.vitalsDue ? "Vitals due" : "Up to date"}
                      </div>
                    </>
                  ) : (
                    <div className="mt-1 text-[10px] capitalize text-muted-foreground">{b.status}</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}