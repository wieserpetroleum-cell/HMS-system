import * as React from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { CalendarPlus, Search, LayoutGrid, Rows3, Clock, FileText, Play, ClipboardCheck } from "lucide-react";
import { useAppointments } from "@/lib/appointments-store";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Appointment, AppointmentStatus } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/appointments/")({
  component: AppointmentsQueue,
});

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  scheduled: "Scheduled",
  "checked-in": "Checked-in",
  "in-consultation": "In Consultation",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_TONE: Record<AppointmentStatus, string> = {
  scheduled: "border-border bg-secondary text-foreground",
  "checked-in": "border-status-info/40 bg-status-info/10 text-status-info",
  "in-consultation": "border-condition/40 bg-condition/15 text-condition-foreground",
  completed: "border-status-ok/40 bg-status-ok/10 text-status-ok",
  cancelled: "border-allergy/40 bg-allergy/10 text-allergy",
};

const COLUMNS: AppointmentStatus[] = ["scheduled", "checked-in", "in-consultation", "completed"];

function AppointmentsQueue() {
  const { appointments, updateStatus } = useAppointments();
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate] = React.useState(today);
  const [doctor, setDoctor] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [view, setView] = React.useState<"pipeline" | "table">("pipeline");

  const doctors = React.useMemo(
    () => Array.from(new Set(appointments.map((a) => a.doctor))).sort(),
    [appointments],
  );

  const filtered = appointments.filter((a) => {
    if (date && a.date !== date) return false;
    if (doctor && a.doctor !== doctor) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!a.patientName.toLowerCase().includes(q) && !(a.patientUid ?? "").toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Tokens by doctor + date sorted by time
  const tokenMap = React.useMemo(() => {
    const m = new Map<string, number>();
    const groups = new Map<string, Appointment[]>();
    appointments.forEach((a) => {
      const k = `${a.date}__${a.doctor}`;
      const arr = groups.get(k) ?? [];
      arr.push(a);
      groups.set(k, arr);
    });
    groups.forEach((arr) => {
      arr.sort((x, y) => x.time.localeCompare(y.time)).forEach((a, i) => m.set(a.id, i + 1));
    });
    return m;
  }, [appointments]);

  const counts = {
    total: filtered.length,
    waiting: filtered.filter((a) => a.status === "checked-in").length,
    inProgress: filtered.filter((a) => a.status === "in-consultation").length,
    completed: filtered.filter((a) => a.status === "completed").length,
  };

  const onAction = (a: Appointment) => {
    if (a.status === "scheduled") {
      updateStatus(a.id, "checked-in");
    } else if (a.status === "checked-in") {
      updateStatus(a.id, "in-consultation");
      navigate({ to: "/consultations/$appointmentId", params: { appointmentId: a.id } });
    } else if (a.status === "in-consultation") {
      navigate({ to: "/consultations/$appointmentId", params: { appointmentId: a.id } });
    } else if (a.status === "completed") {
      navigate({ to: "/consultations/$appointmentId/prescription", params: { appointmentId: a.id } });
    }
  };

  const actionLabel = (s: AppointmentStatus) =>
    s === "scheduled" ? "Check In" :
    s === "checked-in" ? "Start" :
    s === "in-consultation" ? "Resume" :
    s === "completed" ? "View Rx" : "—";

  const actionIcon = (s: AppointmentStatus) =>
    s === "scheduled" ? ClipboardCheck :
    s === "checked-in" ? Play :
    s === "in-consultation" ? Play :
    s === "completed" ? FileText : Clock;

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        eyebrow="Module 04 · Appointments"
        title="OPD Queue"
        description="Live patient pipeline. Check in, start consultations and review completed visits."
        right={
          <Button asChild>
            <Link to="/appointments/new">
              <CalendarPlus className="mr-2 h-4 w-4" />
              New Appointment
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <KpiCard label="Total" value={counts.total} tone="info" />
        <KpiCard label="Waiting" value={counts.waiting} tone="warn" />
        <KpiCard label="In Progress" value={counts.inProgress} />
        <KpiCard label="Completed" value={counts.completed} tone="ok" />
        <KpiCard label="Avg Wait" value="14m" hint="mock" />
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or UID"
            className="pl-8"
          />
        </div>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-40"
        />
        <select
          className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
          value={doctor}
          onChange={(e) => setDoctor(e.target.value)}
        >
          <option value="">All doctors</option>
          {doctors.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <div className="ml-auto flex rounded-md border border-border bg-background p-0.5">
          <button
            onClick={() => setView("pipeline")}
            className={cn("flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium",
              view === "pipeline" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Pipeline
          </button>
          <button
            onClick={() => setView("table")}
            className={cn("flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium",
              view === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            <Rows3 className="h-3.5 w-3.5" /> Table
          </button>
        </div>
      </div>

      {view === "pipeline" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => {
            const items = filtered.filter((a) => a.status === col).sort((a, b) => a.time.localeCompare(b.time));
            return (
              <div key={col} className="rounded-lg border border-border bg-card">
                <header className="flex items-center justify-between border-b border-border px-4 py-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {STATUS_LABEL[col]}
                  </span>
                  <span className="rounded bg-secondary px-2 py-0.5 text-[11px] font-semibold tabular-nums">
                    {items.length}
                  </span>
                </header>
                <div className="space-y-2 p-3">
                  {items.length === 0 && (
                    <div className="py-6 text-center text-[11px] text-muted-foreground">No patients</div>
                  )}
                  {items.map((a) => {
                    const Icon = actionIcon(a.status);
                    return (
                      <div key={a.id} className="rounded-md border border-border bg-background p-3 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="grid size-6 place-items-center rounded bg-primary/10 text-[10px] font-bold tabular-nums text-primary">
                                {tokenMap.get(a.id) ?? "?"}
                              </span>
                              <span className="truncate font-semibold">{a.patientName}</span>
                            </div>
                            <div className="mt-1 font-mono text-[10px] text-muted-foreground">{a.patientUid}</div>
                          </div>
                          <div className="text-right text-[11px] tabular-nums text-muted-foreground">
                            {a.time}
                          </div>
                        </div>
                        <div className="mt-2 text-[11px] text-muted-foreground">
                          {a.doctor} · {a.room}
                        </div>
                        {a.complaint && (
                          <div className="mt-1 line-clamp-2 text-[11px] italic text-foreground/80">
                            "{a.complaint}"
                          </div>
                        )}
                        {a.status !== "cancelled" && (
                          <button
                            onClick={() => onAction(a)}
                            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded border border-border bg-secondary py-1.5 text-[11px] font-semibold transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                          >
                            <Icon className="h-3 w-3" />
                            {actionLabel(a.status)}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-[10px] uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left">Token</th>
                <th className="px-4 py-2.5 text-left">Time</th>
                <th className="px-4 py-2.5 text-left">Patient</th>
                <th className="px-4 py-2.5 text-left">Doctor</th>
                <th className="px-4 py-2.5 text-left">Type</th>
                <th className="px-4 py-2.5 text-left">Complaint</th>
                <th className="px-4 py-2.5 text-left">Status</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                    No appointments match these filters.
                  </td>
                </tr>
              )}
              {filtered
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((a) => (
                  <tr key={a.id} className="border-t border-border hover:bg-accent/30">
                    <td className="px-4 py-2.5 font-mono tabular-nums text-xs">{tokenMap.get(a.id) ?? "—"}</td>
                    <td className="px-4 py-2.5 tabular-nums">{a.time}</td>
                    <td className="px-4 py-2.5">
                      <div className="font-semibold">{a.patientName}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{a.patientUid}</div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">
                      {a.doctor} · {a.room}
                    </td>
                    <td className="px-4 py-2.5 text-xs">{a.type}</td>
                    <td className="px-4 py-2.5 max-w-xs truncate text-xs italic text-muted-foreground">{a.complaint}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn("rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", STATUS_TONE[a.status])}>
                        {STATUS_LABEL[a.status]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {a.status !== "cancelled" && (
                        <Button size="sm" variant="outline" onClick={() => onAction(a)}>
                          {actionLabel(a.status)}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
