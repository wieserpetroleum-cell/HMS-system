// OPD Queue v3.0 - Complete flow with all scenarios handled
import * as React from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  CalendarPlus, Search, LayoutGrid, Rows3, Clock, FileText,
  Play, ClipboardCheck, X, UserX, CalendarClock, CreditCard,
  Printer, AlertCircle, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useAppointments } from "@/lib/appointments-store";
import { useInvoices } from "@/lib/invoices-store";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Appointment, AppointmentStatus } from "@/lib/types";

// ── Constants ────────────────────────────────────────────────────
const STATUS_LABEL: Record<AppointmentStatus, string> = {
  scheduled: "Scheduled",
  "checked-in": "Checked-in",
  "in-consultation": "In Consultation",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_TONE: Record<AppointmentStatus, string> = {
  scheduled:         "border-border bg-secondary text-foreground",
  "checked-in":      "border-status-info/40 bg-status-info/10 text-status-info",
  "in-consultation": "border-condition/40 bg-condition/15 text-condition-foreground",
  completed:         "border-status-ok/40 bg-status-ok/10 text-status-ok",
  cancelled:         "border-allergy/40 bg-allergy/10 text-allergy",
};

const PIPELINE_COLS: AppointmentStatus[] = ["scheduled", "checked-in", "in-consultation", "completed"];

// ── Waiting Time ─────────────────────────────────────────────────
function WaitingTime({ since }: { since?: string }) {
  const [mins, setMins] = React.useState(0);
  React.useEffect(() => {
    if (!since) return;
    const start = new Date(since).getTime();
    const tick = () => setMins(Math.floor((Date.now() - start) / 60000));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [since]);
  if (!since) return null;
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 text-[10px] font-semibold tabular-nums",
      mins >= 30 ? "text-allergy" : mins >= 15 ? "text-condition-foreground" : "text-status-ok"
    )}>
      <Clock className="h-2.5 w-2.5" /> {mins}m
    </span>
  );
}

// ── Reschedule Modal ──────────────────────────────────────────────
function RescheduleModal({ appt, onClose, onSave }: { appt: Appointment; onClose: () => void; onSave: (d: string, t: string) => void }) {
  const [date, setDate] = React.useState(appt.date ?? "");
  const [time, setTime] = React.useState(appt.time);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Reschedule Appointment</h3>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <div className="mb-4 rounded-lg bg-secondary/50 p-3 text-sm">
          <div className="font-semibold">{appt.patientName}</div>
          <div className="text-xs text-muted-foreground">{appt.doctor} · {appt.department}</div>
        </div>
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
          <Button className="flex-1" onClick={() => { onSave(date, time); onClose(); }}>Confirm</Button>
        </div>
      </div>
    </div>
  );
}

// ── Fee Modal ─────────────────────────────────────────────────────
function FeeModal({ appt, onClose, onCollect }: { appt: Appointment; onClose: () => void; onCollect: (mode: string, amount: number) => void }) {
  const [mode, setMode] = React.useState("cash");
  const [amount, setAmount] = React.useState("500");
  const QUICK = [200, 300, 500, 1000];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Collect Consultation Fee</h3>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <div className="mb-4 rounded-lg bg-secondary/50 p-3 text-sm">
          <div className="font-semibold">{appt.patientName}</div>
          <div className="text-xs text-muted-foreground">{appt.patientUid} · {appt.doctor} · {appt.department}</div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick Amount</label>
            <div className="mt-1.5 grid grid-cols-4 gap-1.5">
              {QUICK.map((q) => (
                <button key={q} onClick={() => setAmount(String(q))}
                  className={cn("rounded border py-1.5 text-sm font-semibold transition-colors",
                    amount === String(q) ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"
                  )}>₹{q}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount (₹)</label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 text-lg font-bold" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment Mode</label>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              {[["cash","💵 Cash"],["upi","📱 UPI"],["card","💳 Card"],["insurance","🏥 Insurance"]].map(([v,l]) => (
                <button key={v} onClick={() => setMode(v)}
                  className={cn("rounded border py-2 text-sm font-medium transition-colors",
                    mode === v ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary"
                  )}>{l}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Skip for Now</Button>
          <Button className="flex-1 bg-status-ok hover:bg-status-ok/90"
            onClick={() => { onCollect(mode, Number(amount)); onClose(); }}>
            <Printer className="mr-1.5 h-4 w-4" /> Collect & Print ₹{amount}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
function AppointmentsQueue() {
  const { appointments, updateStatus, reschedule } = useAppointments();
  const { addInvoice, invoices } = useInvoices();
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate]     = React.useState(today);
  const [doctor, setDoctor] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [view, setView]     = React.useState<"pipeline" | "table">("pipeline");
  const [rescheduleAppt, setRescheduleAppt] = React.useState<Appointment | null>(null);
  const [feeAppt, setFeeAppt]               = React.useState<Appointment | null>(null);
  const [checkedInAt, setCheckedInAt] = React.useState<Record<string, string>>({});

  // Check if fee already collected by looking at existing invoices
  const isFeeCollected = React.useCallback((apptId: string) =>
    invoices.some((inv) => inv.sourceId === apptId && inv.sourceType === "opd" && inv.status !== "cancelled"),
    [invoices]
  );

  const doctors = React.useMemo(() => Array.from(new Set(appointments.map((a) => a.doctor))).sort(), [appointments]);

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
      groups.set(k, [...(groups.get(k) ?? []), a]);
    });
    groups.forEach((arr) => arr.sort((x, y) => x.time.localeCompare(y.time)).forEach((a, i) => m.set(a.id, i + 1)));
    return m;
  }, [appointments]);

  const counts = {
    total:      filtered.length,
    waiting:    filtered.filter((a) => a.status === "checked-in").length,
    inProgress: filtered.filter((a) => a.status === "in-consultation").length,
    completed:  filtered.filter((a) => a.status === "completed").length,
    cancelled:  filtered.filter((a) => a.status === "cancelled").length,
  };

  // ── Actions ──────────────────────────────────────────────────
  const onCheckIn = (a: Appointment) => {
    updateStatus(a.id, "checked-in");
    setCheckedInAt((prev) => ({ ...prev, [a.id]: new Date().toISOString() }));
    // Show fee modal after check-in
    setTimeout(() => setFeeAppt(a), 150);
  };

  const onStartConsultation = (a: Appointment) => {
    if (!isFeeCollected(a.id)) {
      // Warn but allow - show fee modal first
      toast.warning("⚠️ Fee not collected. Please collect fee before starting.", {
        action: { label: "Collect Now", onClick: () => setFeeAppt(a) },
        duration: 6000,
      });
      setFeeAppt(a);
      return;
    }
    updateStatus(a.id, "in-consultation");
    navigate(`/consultations/${a.id}`);
  };

  const onResumeConsultation = (a: Appointment) => navigate(`/consultations/${a.id}`);
  const onViewPrescription   = (a: Appointment) => navigate(`/consultations/${a.id}/prescription`);

  const onAction = (a: Appointment) => {
    if      (a.status === "scheduled")         { onCheckIn(a); }
    else if (a.status === "checked-in")        { onStartConsultation(a); }
    else if (a.status === "in-consultation")   { onResumeConsultation(a); }
    else if (a.status === "completed")         { onViewPrescription(a); }
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
    toast.success(`Rescheduled to ${date} at ${time}`);
  };

  const onCollectFee = (mode: string, amount: number) => {
    if (!feeAppt) return;
    try {
      const inv = addInvoice({
        patientUid: feeAppt.patientUid ?? "",
        patientName: feeAppt.patientName,
        sourceType: "opd",
        sourceId: feeAppt.id,
        items: [{
          id: `tmp-opd-${Date.now()}`,
          category: "consultation",
          code: "OPD-CONSULT",
          description: `OPD Consultation — ${feeAppt.doctor} (${feeAppt.department || "General"})`,
          qty: 1, unitPrice: amount, amount, taxable: false,
        }],
        discount: 0, taxRate: 0, status: "paid",
        createdAt: new Date().toISOString(),
        dueAt: new Date().toISOString(),
        payments: [{
          id: `pay-${Date.now()}`,
          at: new Date().toISOString(),
          mode: mode as "cash" | "card" | "upi" | "bank" | "tpa",
          amount,
          reference: mode === "upi" ? `UPI-${Date.now()}` : undefined,
          collectedBy: "Reception",
        }],
      });
      toast.success(`✅ ₹${amount} collected — ${inv.invoiceNo}`, { duration: 4000 });
      navigate(`/billing/invoices/${inv.id}`);
    } catch {
      toast.error("Failed to create invoice. Please try again.");
    }
  };

  const actionLabel = (s: AppointmentStatus) =>
    s === "scheduled" ? "Check In" : s === "checked-in" ? "Start ▶" :
    s === "in-consultation" ? "Resume ▶" : s === "completed" ? "Prescription" : "—";

  const actionIcon = (s: AppointmentStatus) =>
    s === "scheduled" ? ClipboardCheck : s === "checked-in" ? Play :
    s === "in-consultation" ? Play : s === "completed" ? FileText : Clock;

  // ── Render card ───────────────────────────────────────────────
  const renderCard = (a: Appointment) => {
    const Icon = actionIcon(a.status);
    const feePaid = isFeeCollected(a.id);
    return (
      <div key={a.id} className="rounded-md border border-border bg-background p-3 text-xs space-y-2">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="grid size-6 shrink-0 place-items-center rounded bg-primary/10 text-[10px] font-bold text-primary">
                {tokenMap.get(a.id) ?? "?"}
              </span>
              <span className="truncate font-semibold">{a.patientName}</span>
            </div>
            <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{a.patientUid}</div>
          </div>
          <div className="text-right">
            <div className="tabular-nums text-[11px] text-muted-foreground">{a.time}</div>
            <WaitingTime since={a.status === "checked-in" ? checkedInAt[a.id] : undefined} />
          </div>
        </div>

        {/* Doctor + complaint */}
        <div className="text-[11px] text-muted-foreground">{a.doctor} · {a.room}</div>
        {a.complaint && <div className="line-clamp-1 text-[11px] italic text-foreground/60">"{a.complaint}"</div>}

        {/* Fee status indicator */}
        {a.status === "checked-in" && (
          <div className={cn("flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold w-fit",
            feePaid ? "bg-status-ok/10 text-status-ok" : "bg-amber-50 text-amber-700 border border-amber-200"
          )}>
            {feePaid ? <><CheckCircle2 className="h-3 w-3" /> Fee Paid</> : <><AlertCircle className="h-3 w-3" /> Fee Pending</>}
          </div>
        )}

        {/* Actions */}
        {a.status !== "cancelled" && (
          <div className="space-y-1.5">
            {/* Primary action */}
            <button onClick={() => onAction(a)}
              className="flex w-full items-center justify-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 py-2 text-[12px] font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Icon className="h-3.5 w-3.5" /> {actionLabel(a.status)}
            </button>

            {/* Secondary actions for scheduled */}
            {a.status === "scheduled" && (
              <div className="grid grid-cols-3 gap-1.5">
                <button onClick={() => !feePaid && setFeeAppt(a)} disabled={feePaid}
                  className={cn("flex items-center justify-center gap-1 rounded-md border py-1.5 text-[10px] font-medium transition-colors",
                    feePaid ? "border-status-ok/30 bg-status-ok/10 text-status-ok opacity-70 cursor-not-allowed"
                            : "border-border text-muted-foreground hover:border-status-ok hover:bg-status-ok/10 hover:text-status-ok"
                  )}>
                  <CreditCard className="h-3 w-3" /> {feePaid ? "Paid ✓" : "Fee"}
                </button>
                <button onClick={() => setRescheduleAppt(a)}
                  className="flex items-center justify-center gap-1 rounded-md border border-border py-1.5 text-[10px] font-medium text-muted-foreground hover:border-status-info hover:bg-status-info/10 hover:text-status-info">
                  <CalendarClock className="h-3 w-3" /> Move
                </button>
                <button onClick={() => onNoShow(a)}
                  className="flex items-center justify-center gap-1 rounded-md border border-border py-1.5 text-[10px] font-medium text-muted-foreground hover:border-allergy hover:bg-allergy/10 hover:text-allergy">
                  <UserX className="h-3 w-3" /> No Show
                </button>
              </div>
            )}

            {/* Collect fee for checked-in */}
            {a.status === "checked-in" && !feePaid && (
              <button onClick={() => setFeeAppt(a)}
                className="flex w-full items-center justify-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 py-1.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-100 transition-colors">
                <CreditCard className="h-3 w-3" /> ⚠️ Collect Fee Before Starting
              </button>
            )}
            {a.status === "checked-in" && feePaid && (
              <div className="flex w-full items-center justify-center gap-1.5 rounded-md border border-status-ok/30 bg-status-ok/5 py-1.5 text-[11px] font-medium text-status-ok">
                <CheckCircle2 className="h-3 w-3" /> Fee Collected ✓
              </div>
            )}

            {/* Cancel button for scheduled/checked-in */}
            {(a.status === "scheduled" || a.status === "checked-in") && (
              <button onClick={() => onCancel(a)}
                className="flex w-full items-center justify-center gap-1 rounded-md border border-border py-1 text-[10px] font-medium text-muted-foreground hover:border-allergy hover:bg-allergy/10 hover:text-allergy transition-colors">
                <X className="h-3 w-3" /> Cancel Appointment
              </button>
            )}
          </div>
        )}

        {/* Completed - view prescription */}
        {a.status === "completed" && (
          <button onClick={() => onViewPrescription(a)}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-secondary py-2 text-[11px] font-semibold hover:border-primary hover:bg-primary hover:text-primary-foreground transition-colors">
            <FileText className="h-3 w-3" /> View Prescription
          </button>
        )}
      </div>
    );
  };

  // ── JSX ───────────────────────────────────────────────────────
  return (
    <div className="space-y-5 p-8">
      {/* Modals */}
      {rescheduleAppt && <RescheduleModal appt={rescheduleAppt} onClose={() => setRescheduleAppt(null)} onSave={onReschedule} />}
      {feeAppt && <FeeModal appt={feeAppt} onClose={() => setFeeAppt(null)} onCollect={onCollectFee} />}

      <PageHeader
        eyebrow="OPD · Appointments"
        title="OPD Queue"
        description="Live patient pipeline. Check in, collect fee, start consultations."
        right={
          <Button asChild>
            <Link to="/appointments/new"><CalendarPlus className="mr-2 h-4 w-4" /> New Appointment</Link>
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
          <button onClick={() => setView("pipeline")} className={cn("flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium", view === "pipeline" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
            <LayoutGrid className="h-3.5 w-3.5" /> Pipeline
          </button>
          <button onClick={() => setView("table")} className={cn("flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium", view === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
            <Rows3 className="h-3.5 w-3.5" /> Table
          </button>
        </div>
      </div>

      {/* Doctor Status */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Doctor Status — Today</div>
        <div className="flex flex-wrap gap-3">
          {doctors.length === 0 && <p className="text-xs text-muted-foreground">No appointments today</p>}
          {doctors.map((doc) => {
            const da = filtered.filter((a) => a.doctor === doc);
            const busy = da.filter((a) => a.status === "in-consultation").length > 0;
            const waiting = da.filter((a) => a.status === "checked-in").length;
            const done = da.filter((a) => a.status === "completed").length;
            return (
              <div key={doc} className={cn("flex items-center gap-2 rounded-lg border px-3 py-2 text-xs",
                busy ? "border-condition/40 bg-condition/10" : "border-status-ok/40 bg-status-ok/10"
              )}>
                <div className={cn("h-2 w-2 rounded-full", busy ? "bg-condition animate-pulse" : "bg-status-ok")} />
                <div>
                  <div className="font-semibold">{doc}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {busy ? "🟡 In Consultation" : "🟢 Free"}
                    {waiting > 0 && ` · ${waiting} waiting`}
                    {done > 0 && ` · ${done} done`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pipeline View */}
      {view === "pipeline" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PIPELINE_COLS.map((col) => {
            const items = filtered.filter((a) => a.status === col).sort((a, b) => a.time.localeCompare(b.time));
            return (
              <div key={col} className="rounded-lg border border-border bg-card">
                <header className="flex items-center justify-between border-b border-border px-4 py-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{STATUS_LABEL[col]}</span>
                  <span className="rounded bg-secondary px-2 py-0.5 text-[11px] font-semibold tabular-nums">{items.length}</span>
                </header>
                <div className="space-y-2 p-3">
                  {items.length === 0 && <div className="py-6 text-center text-[11px] text-muted-foreground">No patients</div>}
                  {items.map(renderCard)}
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
                <th className="px-4 py-2.5 text-left">Fee</th>
                <th className="px-4 py-2.5 text-left">Status</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="py-12 text-center text-sm text-muted-foreground">No appointments match filters.</td></tr>
              )}
              {filtered.sort((a, b) => a.time.localeCompare(b.time)).map((a) => {
                const feePaid = isFeeCollected(a.id);
                return (
                  <tr key={a.id} className="border-t border-border hover:bg-accent/30">
                    <td className="px-4 py-2.5 font-mono text-xs">{tokenMap.get(a.id) ?? "—"}</td>
                    <td className="px-4 py-2.5 tabular-nums text-sm">{a.time}</td>
                    <td className="px-4 py-2.5">
                      <div className="font-semibold">{a.patientName}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{a.patientUid}</div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{a.doctor} · {a.room}</td>
                    <td className="px-4 py-2.5 text-xs">{a.type}</td>
                    <td className="px-4 py-2.5">
                      {feePaid
                        ? <span className="rounded bg-status-ok/10 px-2 py-0.5 text-[10px] font-semibold text-status-ok">✓ Paid</span>
                        : <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Pending</span>
                      }
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={cn("rounded border px-2 py-0.5 text-[10px] font-semibold uppercase", STATUS_TONE[a.status])}>
                        {STATUS_LABEL[a.status]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1.5">
                        {a.status !== "cancelled" && (
                          <Button size="sm" onClick={() => onAction(a)}>{actionLabel(a.status)}</Button>
                        )}
                        {a.status === "scheduled" && (
                          <>
                            <button onClick={() => !feePaid && setFeeAppt(a)} disabled={feePaid} title={feePaid ? "Fee Paid" : "Collect Fee"}
                              className={cn("rounded border p-1.5 transition-colors", feePaid ? "border-status-ok/30 text-status-ok cursor-not-allowed" : "border-border text-muted-foreground hover:text-status-ok hover:border-status-ok/50")}>
                              <CreditCard className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => setRescheduleAppt(a)} title="Reschedule"
                              className="rounded border border-border p-1.5 text-muted-foreground hover:text-status-info hover:border-status-info/50">
                              <CalendarClock className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => onNoShow(a)} title="No Show"
                              className="rounded border border-border p-1.5 text-muted-foreground hover:text-condition-foreground">
                              <UserX className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => onCancel(a)} title="Cancel"
                              className="rounded border border-border p-1.5 text-muted-foreground hover:text-allergy hover:border-allergy/50">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                        {a.status === "checked-in" && !feePaid && (
                          <button onClick={() => setFeeAppt(a)} title="Collect Fee"
                            className="rounded border border-amber-300 bg-amber-50 p-1.5 text-amber-700 hover:bg-amber-100">
                            <CreditCard className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AppointmentsQueue;
