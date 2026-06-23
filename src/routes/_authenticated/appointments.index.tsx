import * as React from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  CalendarPlus, Search, LayoutGrid, Rows3, Clock, FileText,
  Play, ClipboardCheck, X, UserX, CalendarClock, CreditCard, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAppointments } from "@/lib/appointments-store";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Appointment, AppointmentStatus } from "@/lib/types";

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

// ── Waiting Time ──────────────────────────────────────────────────
function WaitingTime({ checkedInAt }: { checkedInAt?: string }) {
  const [elapsed, setElapsed] = React.useState(0);
  React.useEffect(() => {
    if (!checkedInAt) return;
    const start = new Date(checkedInAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 60000));
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [checkedInAt]);
  if (!checkedInAt) return null;
  return (
    <span className={cn(
      "text-[10px] font-semibold tabular-nums",
      elapsed >= 30 ? "text-allergy" : elapsed >= 15 ? "text-condition-foreground" : "text-status-ok"
    )}>
      ⏱ {elapsed}m wait
    </span>
  );
}

// ── Reschedule Modal ──────────────────────────────────────────────
function RescheduleModal({ appt, onClose, onSave }: {
  appt: Appointment;
  onClose: () => void;
  onSave: (date: string, time: string) => void;
}) {
  const [date, setDate] = React.useState(appt.date ?? "");
  const [time, setTime] = React.useState(appt.time);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Reschedule Appointment</h3>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Patient: <strong>{appt.patientName}</strong><br />
          Doctor: {appt.doctor}
        </p>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New Date</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New Time</label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1" />
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={() => { onSave(date, time); onClose(); }}>
            Confirm Reschedule
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Fee Collection Modal ──────────────────────────────────────────
function FeeModal({ appt, onClose, onCollect }: {
  appt: Appointment;
  onClose: () => void;
  onCollect: (mode: string, amount: number) => void;
}) {
  const [mode, setMode] = React.useState("cash");
  const [amount, setAmount] = React.useState("500");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Collect Consultation Fee</h3>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Patient: <strong>{appt.patientName}</strong><br />
          Doctor: {appt.doctor}
        </p>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount (₹)</label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="insurance">Insurance</option>
            </select>
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={() => { onCollect(mode, Number(amount)); onClose(); }}>
            <CreditCard className="mr-1.5 h-4 w-4" /> Collect ₹{amount}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
function AppointmentsQueue() {
  const { appointments, updateStatus, reschedule } = useAppointments();
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate]     = React.useState(today);
  const [doctor, setDoctor] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [view, setView]     = React.useState<"pipeline" | "table">("pipeline");
  const [rescheduleAppt, setRescheduleAppt] = React.useState<Appointment | null>(null);
  const [feeAppt, setFeeAppt]               = React.useState<Appointment | null>(null);
  // Track check-in times for waiting time
  const [checkedInAt, setCheckedInAt] = React.useState<Record<string, string>>({});

  const doctors = React.useMemo(
    () => Array.from(new Set(appointments.map((a) => a.doctor))).sort(),
    [appointments],
  );

  const filtered = appointments.filter((a) => {
    if (date && a.date !== date) return false;
    if (doctor && a.doctor !== doctor) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!a.patientName.toLowerCase().includes(q) && !(a.patientUid ?? "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

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
    total:      filtered.length,
    waiting:    filtered.filter((a) => a.status === "checked-in").length,
    inProgress: filtered.filter((a) => a.status === "in-consultation").length,
    completed:  filtered.filter((a) => a.status === "completed").length,
    cancelled:  filtered.filter((a) => a.status === "cancelled").length,
  };

  const onCheckIn = (a: Appointment) => {
    updateStatus(a.id, "checked-in");
    setCheckedInAt((prev) => ({ ...prev, [a.id]: new Date().toISOString() }));
    setFeeAppt(a); // Show fee collection on check-in
  };

  const onAction = (a: Appointment) => {
    if (a.status === "scheduled")         { onCheckIn(a); }
    else if (a.status === "checked-in")   { updateStatus(a.id, "in-consultation"); navigate(`/consultations/${a.id}`); }
    else if (a.status === "in-consultation") { navigate(`/consultations/${a.id}`); }
    else if (a.status === "completed")    { navigate(`/consultations/${a.id}/prescription`); }
  };

  const onNoShow = (a: Appointment) => {
    updateStatus(a.id, "cancelled");
    toast.warning(`${a.patientName} marked as No-Show`);
  };

  const onCancel = (a: Appointment) => {
    updateStatus(a.id, "cancelled");
    toast.error(`Appointment for ${a.patientName} cancelled`);
  };

  const onReschedule = (date: string, time: string) => {
    if (!rescheduleAppt) return;
    reschedule(rescheduleAppt.id, date, time);
    toast.success(`Appointment rescheduled to ${date} at ${time}`);
  };

  const onCollectFee = (mode: string, amount: number) => {
    if (!feeAppt) return;
    toast.success(`₹${amount} collected via ${mode.toUpperCase()} from ${feeAppt.patientName}`);
  };

  const actionLabel = (s: AppointmentStatus) =>
    s === "scheduled"       ? "Check In"  :
    s === "checked-in"      ? "Start ▶"   :
    s === "in-consultation" ? "Resume ▶"  :
    s === "completed"       ? "View Rx"   : "—";

  const actionIcon = (s: AppointmentStatus) =>
    s === "scheduled"       ? ClipboardCheck :
    s === "checked-in"      ? Play :
    s === "in-consultation" ? Play :
    s === "completed"       ? FileText : Clock;

  return (
    <div className="space-y-6 p-8">
      {/* Modals */}
      {rescheduleAppt && (
        <RescheduleModal
          appt={rescheduleAppt}
          onClose={() => setRescheduleAppt(null)}
          onSave={onReschedule}
        />
      )}
      {feeAppt && (
        <FeeModal
          appt={feeAppt}
          onClose={() => setFeeAppt(null)}
          onCollect={onCollectFee}
        />
      )}

      <PageHeader
        eyebrow="Module 04 · OPD"
        title="Appointments Queue"
        description="Live patient pipeline. Check in, collect fee, start consultations."
        right={
          <Button asChild>
            <Link to="/appointments/new">
              <CalendarPlus className="mr-2 h-4 w-4" /> New Appointment
            </Link>
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <KpiCard label="Total"       value={counts.total}      tone="info" />
        <KpiCard label="Waiting"     value={counts.waiting}    tone="warn" />
        <KpiCard label="In Progress" value={counts.inProgress} />
        <KpiCard label="Completed"   value={counts.completed}  tone="ok" />
        <KpiCard label="Cancelled"   value={counts.cancelled}  tone="danger" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or UID" className="pl-8" />
        </div>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-40" />
        <select className="h-9 rounded-md border border-input bg-transparent px-2 text-sm" value={doctor} onChange={(e) => setDoctor(e.target.value)}>
          <option value="">All doctors</option>
          {doctors.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <div className="ml-auto flex rounded-md border border-border bg-background p-0.5">
          <button onClick={() => setView("pipeline")} className={cn("flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium", view === "pipeline" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
            <LayoutGrid className="h-3.5 w-3.5" /> Pipeline
          </button>
          <button onClick={() => setView("table")} className={cn("flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium", view === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
            <Rows3 className="h-3.5 w-3.5" /> Table
          </button>
        </div>
      </div>

      {/* Pipeline View */}
      {view === "pipeline" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => {
            const items = filtered.filter((a) => a.status === col).sort((a, b) => a.time.localeCompare(b.time));
            return (
              <div key={col} className="rounded-lg border border-border bg-card">
                <header className="flex items-center justify-between border-b border-border px-4 py-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{STATUS_LABEL[col]}</span>
                  <span className="rounded bg-secondary px-2 py-0.5 text-[11px] font-semibold tabular-nums">{items.length}</span>
                </header>
                <div className="space-y-2 p-3">
                  {items.length === 0 && <div className="py-6 text-center text-[11px] text-muted-foreground">No patients</div>}
                  {items.map((a) => {
                    const Icon = actionIcon(a.status);
                    return (
                      <div key={a.id} className="rounded-md border border-border bg-background p-3 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="grid size-6 shrink-0 place-items-center rounded bg-primary/10 text-[10px] font-bold tabular-nums text-primary">
                                {tokenMap.get(a.id) ?? "?"}
                              </span>
                              <span className="truncate font-semibold">{a.patientName}</span>
                            </div>
                            <div className="mt-1 font-mono text-[10px] text-muted-foreground">{a.patientUid}</div>
                          </div>
                          <div className="text-right text-[11px] tabular-nums text-muted-foreground">{a.time}</div>
                        </div>
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">{a.doctor} · {a.room}</span>
                          <WaitingTime checkedInAt={a.status === "checked-in" ? checkedInAt[a.id] : undefined} />
                        </div>
                        {a.complaint && (
                          <div className="mt-1 line-clamp-1 text-[11px] italic text-foreground/70">"{a.complaint}"</div>
                        )}

                        {/* Action Buttons */}
                        {a.status !== "cancelled" && a.status !== "completed" && (
                          <div className="mt-3 space-y-1.5">
                            <button
                              onClick={() => onAction(a)}
                              className="flex w-full items-center justify-center gap-1.5 rounded border border-border bg-secondary py-1.5 text-[11px] font-semibold transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                            >
                              <Icon className="h-3 w-3" /> {actionLabel(a.status)}
                            </button>
                            {a.status === "scheduled" && (
                              <div className="grid grid-cols-3 gap-1">
                                <button
                                  onClick={() => setFeeAppt(a)}
                                  className="flex items-center justify-center gap-1 rounded border border-border py-1 text-[10px] font-medium text-muted-foreground hover:border-status-ok/50 hover:bg-status-ok/10 hover:text-status-ok"
                                >
                                  <CreditCard className="h-3 w-3" /> Fee
                                </button>
                                <button
                                  onClick={() => setRescheduleAppt(a)}
                                  className="flex items-center justify-center gap-1 rounded border border-border py-1 text-[10px] font-medium text-muted-foreground hover:border-status-info/50 hover:bg-status-info/10 hover:text-status-info"
                                >
                                  <CalendarClock className="h-3 w-3" /> Move
                                </button>
                                <button
                                  onClick={() => onNoShow(a)}
                                  className="flex items-center justify-center gap-1 rounded border border-border py-1 text-[10px] font-medium text-muted-foreground hover:border-condition/50 hover:bg-condition/10 hover:text-condition-foreground"
                                >
                                  <UserX className="h-3 w-3" /> No Show
                                </button>
                              </div>
                            )}
                            {a.status === "checked-in" && (
                              <button
                                onClick={() => setFeeAppt(a)}
                                className="flex w-full items-center justify-center gap-1 rounded border border-status-ok/40 bg-status-ok/10 py-1 text-[10px] font-semibold text-status-ok hover:bg-status-ok/20"
                              >
                                <CreditCard className="h-3 w-3" /> Collect Fee
                              </button>
                            )}
                          </div>
                        )}
                        {a.status === "completed" && (
                          <button
                            onClick={() => onAction(a)}
                            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded border border-border bg-secondary py-1.5 text-[11px] font-semibold transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                          >
                            <FileText className="h-3 w-3" /> View Rx
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
        /* Table View */
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-[10px] uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left">Token</th>
                <th className="px-4 py-2.5 text-left">Time</th>
                <th className="px-4 py-2.5 text-left">Patient</th>
                <th className="px-4 py-2.5 text-left">Doctor</th>
                <th className="px-4 py-2.5 text-left">Type</th>
                <th className="px-4 py-2.5 text-left">Wait</th>
                <th className="px-4 py-2.5 text-left">Status</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="py-12 text-center text-sm text-muted-foreground">No appointments match these filters.</td></tr>
              )}
              {filtered.sort((a, b) => a.time.localeCompare(b.time)).map((a) => (
                <tr key={a.id} className="border-t border-border hover:bg-accent/30">
                  <td className="px-4 py-2.5 font-mono tabular-nums text-xs">{tokenMap.get(a.id) ?? "—"}</td>
                  <td className="px-4 py-2.5 tabular-nums">{a.time}</td>
                  <td className="px-4 py-2.5">
                    <div className="font-semibold">{a.patientName}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{a.patientUid}</div>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{a.doctor} · {a.room}</td>
                  <td className="px-4 py-2.5 text-xs">{a.type}</td>
                  <td className="px-4 py-2.5">
                    <WaitingTime checkedInAt={a.status === "checked-in" ? checkedInAt[a.id] : undefined} />
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={cn("rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", STATUS_TONE[a.status])}>
                      {STATUS_LABEL[a.status]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {a.status !== "cancelled" && a.status !== "completed" && (
                        <>
                          <Button size="sm" onClick={() => onAction(a)}>{actionLabel(a.status)}</Button>
                          {a.status === "scheduled" && (
                            <>
                              <button onClick={() => setFeeAppt(a)} title="Collect Fee" className="rounded border border-border p-1.5 text-muted-foreground hover:text-status-ok hover:border-status-ok/50">
                                <CreditCard className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => setRescheduleAppt(a)} title="Reschedule" className="rounded border border-border p-1.5 text-muted-foreground hover:text-status-info hover:border-status-info/50">
                                <CalendarClock className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => onNoShow(a)} title="No Show" className="rounded border border-border p-1.5 text-muted-foreground hover:text-condition-foreground hover:border-condition/50">
                                <UserX className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => onCancel(a)} title="Cancel" className="rounded border border-border p-1.5 text-muted-foreground hover:text-allergy hover:border-allergy/50">
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                          {a.status === "checked-in" && (
                            <button onClick={() => setFeeAppt(a)} title="Collect Fee" className="rounded border border-status-ok/40 bg-status-ok/10 p-1.5 text-status-ok hover:bg-status-ok/20">
                              <CreditCard className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </>
                      )}
                      {a.status === "completed" && (
                        <Button size="sm" variant="outline" onClick={() => onAction(a)}>View Rx</Button>
                      )}
                    </div>
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

export default AppointmentsQueue;
