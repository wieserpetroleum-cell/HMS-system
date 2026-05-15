import { AlertTriangle, Activity, Calendar } from "lucide-react";
import type { Patient } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PatientSummaryRail({ patient, lastVisit }: { patient: Patient; lastVisit?: string }) {
  const initials = patient.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  return (
    <aside className="rounded-lg border border-border bg-card">
      <div className="border-b border-border bg-secondary/40 p-4">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold">{patient.name}</div>
            <div className="text-[11px] font-mono text-muted-foreground">{patient.uid}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              {patient.sex} · {patient.age}
              {patient.bloodGroup && ` · ${patient.bloodGroup}`}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {patient.allergies.length > 0 && (
          <div>
            <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-allergy">
              <AlertTriangle className="h-3 w-3" /> Allergies
            </div>
            <div className="flex flex-wrap gap-1">
              {patient.allergies.map((a) => (
                <span key={a} className="rounded border border-allergy/30 bg-allergy/10 px-1.5 py-0.5 text-[10px] font-medium text-allergy">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {patient.conditions.length > 0 && (
          <div>
            <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <Activity className="h-3 w-3" /> Chronic
            </div>
            <div className="flex flex-wrap gap-1">
              {patient.conditions.map((c) => (
                <span key={c} className="rounded border border-condition/40 bg-condition/15 px-1.5 py-0.5 text-[10px] font-medium text-condition-foreground">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {(lastVisit ?? patient.lastVisit) && (
          <div className={cn("flex items-center gap-1.5 text-[11px] text-muted-foreground")}>
            <Calendar className="h-3 w-3" />
            Last visit: {lastVisit ?? patient.lastVisit}
          </div>
        )}

        {patient.mobile && (
          <div className="border-t border-border pt-3 text-[11px] text-muted-foreground">
            <div className="font-mono">{patient.mobile}</div>
            {patient.city && <div>{patient.city}, {patient.state}</div>}
          </div>
        )}
      </div>
    </aside>
  );
}
