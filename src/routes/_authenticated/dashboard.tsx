import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import {
  mockAppointments, mockIpdPatients, mockBedStatus,
  mockTransactions, mockPendingTasks, mockRecentRegs,
  mockDeptOpd, mockPendingReports, mockTpaClaims,
} from "@/lib/mock/dashboard-data";
import { cn } from "@/lib/utils";
import {
  Calendar, Users, BedDouble, Receipt, Clock,
  AlertTriangle, CheckCircle2, ScanLine, ShieldCheck,
  TrendingUp, Bed, Activity, FileText, ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardRouter,
});

// ─── Route to correct dashboard by role ──────────────────────────────────────
function DashboardRouter() {
  const { user } = useAuth();
  switch (user?.role) {
    case "doctor":      return <DoctorDashboard />;
    case "receptionist":return <ReceptionistDashboard />;
    case "nurse":       return <NurseDashboard />;
    case "billing":     return <BillingDashboard />;
    case "tpa":         return <TpaDashboard />;
    case "radiologist": return <RadiologistDashboard />;
    case "radtech":     return <RadtechDashboard />;
    default:            return <AdminDashboard />;
  }
}

// ─── Shared primitives ────────────────────────────────────────────────────────
function PageHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="border-b border-border bg-card px-8 py-5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">{title}</h1>
      {sub && <p className="mt-0.5 text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, color = "blue" }: {
  label: string; value: string | number; sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: "blue" | "green" | "amber" | "red" | "slate";
}) {
  const iconClasses: Record<string, string> = {
    blue:  "bg-status-info/10 text-status-info",
    green: "bg-status-ok/10 text-status-ok",
    amber: "bg-condition/10 text-condition",
    red:   "bg-allergy/10 text-allergy",
    slate: "bg-muted text-muted-foreground",
  };
  return (
    <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-5">
      <div className={cn("mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg", iconClasses[color])}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="mt-1 text-2xl font-bold tracking-tight">{value}</div>
        {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
      </div>
    </div>
  );
}

const statusBadgeClass: Record<string, string> = {
  scheduled:        "bg-muted text-muted-foreground",
  arrived:          "bg-status-info/10 text-status-info",
  "vitals-done":    "bg-condition/10 text-condition",
  "in-consultation":"bg-primary/10 text-primary",
  done:             "bg-status-ok/10 text-status-ok",
  absent:           "bg-allergy/10 text-allergy",
};

const statusLabel: Record<string, string> = {
  scheduled: "Scheduled", arrived: "Arrived", "vitals-done": "Vitals Done",
  "in-consultation": "In Consult", done: "Done", absent: "Absent",
};

const payerBadge: Record<string, string> = {
  insurance: "bg-status-info/10 text-status-info",
  self:      "bg-muted text-muted-foreground",
  cghs:      "bg-condition/10 text-condition",
  corporate: "bg-primary/10 text-primary",
  pmjay:     "bg-status-ok/10 text-status-ok",
};

// ─── 1. Admin Dashboard ────────────────────────────────────────────────────────
function AdminDashboard() {
  const totalBeds = mockBedStatus.reduce((s, w) => s + w.total, 0);
  const occupiedBeds = mockBedStatus.reduce((s, w) => s + w.occupied, 0);
  const occupancyPct = Math.round((occupiedBeds / totalBeds) * 100);
  const todayRevenue = mockTransactions.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="flex flex-col gap-0">
      <PageHeader eyebrow="Module 2 — Admin" title="Hospital Overview"
        sub="Today's operational summary across all departments." />
      <div className="space-y-6 p-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Today's OPD Footfall" value={mockAppointments.length} sub="+4 walk-ins" icon={Users} color="blue" />
          <StatCard label="Current IPD Census" value={mockIpdPatients.length} sub={`${occupiedBeds}/${totalBeds} beds occupied`} icon={BedDouble} color="green" />
          <StatCard label="Bed Occupancy" value={`${occupancyPct}%`} sub="Across all wards" icon={Bed} color="amber" />
          <StatCard label="Today's Revenue" value={`₹${todayRevenue.toLocaleString("en-IN")}`} sub="HMS-scope services" icon={TrendingUp} color="blue" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Dept-wise OPD */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-5 py-3.5">
              <p className="text-sm font-semibold">Department-wise OPD Today</p>
            </div>
            <div className="divide-y divide-border">
              {mockDeptOpd.map((row) => (
                <div key={row.dept} className="flex items-center gap-4 px-5 py-3 text-sm">
                  <span className="flex-1 font-medium">{row.dept}</span>
                  <span className="w-16 text-right text-muted-foreground">{row.appts} appts</span>
                  <span className="w-20 text-right text-muted-foreground">{row.walkIns} walk-ins</span>
                  <span className="w-12 text-right font-semibold">{row.total}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bed occupancy by ward */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-5 py-3.5">
              <p className="text-sm font-semibold">Bed Occupancy by Ward</p>
            </div>
            <div className="divide-y divide-border">
              {mockBedStatus.map((w) => {
                const pct = Math.round((w.occupied / w.total) * 100);
                return (
                  <div key={w.ward} className="px-5 py-3">
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium">{w.ward}</span>
                      <span className="text-muted-foreground">{w.occupied}/{w.total} — {pct}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full transition-all",
                          pct > 90 ? "bg-allergy" : pct > 75 ? "bg-condition" : "bg-status-ok")}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="mt-1 flex gap-4 text-[11px] text-muted-foreground">
                      <span>{w.available} available</span>
                      {w.cleaning > 0 && <span>{w.cleaning} cleaning</span>}
                      {w.maintenance > 0 && <span className="text-allergy">{w.maintenance} maintenance</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent transactions */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <p className="text-sm font-semibold">Recent Transactions</p>
            <span className="text-[11px] text-muted-foreground">HMS-scope only</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["Time","Bill No","Patient","Type","Mode","Amount"].map((h) => (
                    <th key={h} className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockTransactions.slice(0,6).map((t) => (
                  <tr key={t.id} className="hover:bg-muted/20">
                    <td className="px-5 py-3 text-muted-foreground">{t.time}</td>
                    <td className="px-5 py-3 font-mono text-xs">{t.billNo}</td>
                    <td className="px-5 py-3 font-medium">{t.patient}</td>
                    <td className="px-5 py-3">
                      <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-semibold",
                        t.type === "IPD" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{t.mode}</td>
                    <td className="px-5 py-3 font-semibold">₹{t.amount.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 2. Receptionist Dashboard ────────────────────────────────────────────────
function ReceptionistDashboard() {
  const todayAppts = mockAppointments.length;
  const walkIns = 4;
  const admitted = mockIpdPatients.length;
  const pendingPayments = 3;

  return (
    <div className="flex flex-col gap-0">
      <PageHeader eyebrow="Front Desk" title="Reception Dashboard"
        sub="Today's appointments, walk-ins and pending actions." />
      <div className="space-y-6 p-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Today's Appointments" value={todayAppts} sub="8 remaining" icon={Calendar} color="blue" />
          <StatCard label="Walk-ins Today" value={walkIns} icon={Users} color="green" />
          <StatCard label="Admitted Today" value={admitted} icon={BedDouble} color="amber" />
          <StatCard label="Pending Payments" value={pendingPayments} sub="₹4,850 outstanding" icon={Receipt} color="red" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Appointment list */}
          <div className="lg:col-span-2 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <p className="text-sm font-semibold">Today's Appointments</p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-2 rounded-full bg-status-ok" />Token T-03 serving
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {["Token","Time","Patient","Doctor","Type","Status"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mockAppointments.slice(0, 8).map((a) => (
                    <tr key={a.id} className={cn("hover:bg-muted/20", a.status === "in-consultation" && "bg-primary/5")}>
                      <td className="px-4 py-2.5 font-mono text-xs font-semibold">{a.token}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{a.time}</td>
                      <td className="px-4 py-2.5 font-medium">{a.patient}</td>
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">{a.doctor.replace("Dr. ", "Dr.")}</td>
                      <td className="px-4 py-2.5">
                        <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold",
                          a.type === "new" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                          {a.type === "new" ? "New" : "Follow-up"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", statusBadgeClass[a.status])}>
                          {statusLabel[a.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Walk-in queue */}
            <div className="rounded-lg border border-border bg-card p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Walk-in Queue</p>
              <div className="mt-3 flex items-end gap-4">
                <div>
                  <div className="text-[10px] text-muted-foreground">Now serving</div>
                  <div className="text-5xl font-bold tracking-tight text-primary">T-03</div>
                </div>
                <div className="mb-1 text-left">
                  <div className="text-[10px] text-muted-foreground">Waiting</div>
                  <div className="text-2xl font-bold">5</div>
                </div>
              </div>
              <button className="mt-4 w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                + Add Walk-in
              </button>
            </div>

            {/* Recent Registrations */}
            <div className="rounded-lg border border-border bg-card">
              <div className="border-b border-border px-5 py-3">
                <p className="text-sm font-semibold">Recent Registrations</p>
              </div>
              <div className="divide-y divide-border">
                {mockRecentRegs.map((r) => (
                  <div key={r.uid} className="flex items-center justify-between px-5 py-2.5">
                    <div>
                      <div className="text-sm font-medium">{r.name}</div>
                      <div className="text-[11px] text-muted-foreground">{r.uid} · {r.time}</div>
                    </div>
                    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold capitalize", payerBadge[r.payer])}>
                      {r.payer}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 3. Doctor Dashboard ──────────────────────────────────────────────────────
function DoctorDashboard() {
  const { user } = useAuth();
  const lastName = user?.name?.split(" ").slice(-1)[0] ?? "Doctor";
  const myIpd = mockIpdPatients.filter(p => p.doctor.includes("Rajesh"));

  return (
    <div className="flex flex-col gap-0">
      <PageHeader eyebrow="Clinical — Doctor" title={`Good morning, Dr. ${lastName}.`}
        sub="Your OPD schedule and IPD patients for today." />
      <div className="space-y-6 p-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Today's OPD" value={mockAppointments.filter(a => a.doctor.includes("Rajesh")).length} sub="3 remaining" icon={Calendar} color="blue" />
          <StatCard label="My IPD Patients" value={myIpd.length} sub="2 need review" icon={BedDouble} color="amber" />
          <StatCard label="Pending Reports" value={2} sub="1 critical" icon={FileText} color="red" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* OPD Schedule */}
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <p className="text-sm font-semibold">Today's OPD Schedule</p>
              <span className="text-[11px] text-muted-foreground">7 patients</span>
            </div>
            <div className="divide-y divide-border">
              {mockAppointments.filter(a => a.doctor.includes("Rajesh")).map((a) => (
                <div key={a.id} className={cn("flex items-center gap-3 px-5 py-3",
                  a.status === "in-consultation" && "bg-primary/5")}>
                  <div className="w-12 text-right font-mono text-xs text-muted-foreground">{a.time}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{a.patient}</div>
                    <div className="text-[11px] text-muted-foreground">{a.uid} · {a.type === "new" ? "New patient" : "Follow-up"}</div>
                  </div>
                  <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", statusBadgeClass[a.status])}>
                    {statusLabel[a.status]}
                  </span>
                  {(a.status === "vitals-done" || a.status === "arrived") && (
                    <button className="rounded bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                      Start
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* IPD Patients */}
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <p className="text-sm font-semibold">My IPD Patients</p>
              <span className="text-[11px] text-muted-foreground">{myIpd.length} patients</span>
            </div>
            <div className="divide-y divide-border">
              {myIpd.map((p) => (
                <div key={p.id} className="flex items-start justify-between px-5 py-3.5 gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{p.name}</span>
                      {p.tasks > 0 && (
                        <span className="rounded-full bg-allergy/10 px-1.5 py-0.5 text-[10px] font-bold text-allergy">
                          {p.tasks} task{p.tasks > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      {p.bed} · {p.ward} · Day {p.day}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{p.diagnosis}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold capitalize", payerBadge[p.payer])}>
                      {p.payer}
                    </span>
                    <button className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline">
                      Chart <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 4. Nurse / Ward Dashboard ────────────────────────────────────────────────
function NurseDashboard() {
  const wardPatients = mockIpdPatients.filter(p => p.ward === "Ward A");
  const overdueTasks = mockPendingTasks.filter(t => t.overdue);

  return (
    <div className="flex flex-col gap-0">
      <PageHeader eyebrow="Ward — Nurse" title="Ward A — Morning Shift"
        sub="Patient assignments and pending tasks." />
      <div className="space-y-6 p-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Occupied Beds" value={wardPatients.length} sub="/ 20 total" icon={BedDouble} color="blue" />
          <StatCard label="Available" value={4} icon={Bed} color="green" />
          <StatCard label="Overdue Tasks" value={overdueTasks.length} sub="Needs attention" icon={AlertTriangle} color="red" />
          <StatCard label="Vitals Due" value={3} sub="Within 1 hour" icon={Activity} color="amber" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Patient list */}
          <div className="lg:col-span-3 rounded-lg border border-border bg-card">
            <div className="border-b border-border px-5 py-3.5">
              <p className="text-sm font-semibold">Ward A — Patients</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {["Bed","Patient","Doctor","Day","Tasks",""].map((h, i) => (
                      <th key={i} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mockIpdPatients.slice(0, 6).map((p) => (
                    <tr key={p.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-mono text-xs font-semibold">{p.bed}</td>
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{p.doctor.replace("Dr. ", "Dr.")}</td>
                      <td className="px-4 py-3 text-muted-foreground">Day {p.day}</td>
                      <td className="px-4 py-3">
                        {p.tasks > 0 ? (
                          <span className="rounded-full bg-allergy/10 px-2 py-0.5 text-[10px] font-bold text-allergy">
                            {p.tasks}
                          </span>
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-status-ok" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-[11px] font-medium text-primary hover:underline">
                          Notes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending tasks */}
          <div className="lg:col-span-2 rounded-lg border border-border bg-card">
            <div className="border-b border-border px-5 py-3.5 flex items-center justify-between">
              <p className="text-sm font-semibold">Pending Tasks</p>
              {overdueTasks.length > 0 && (
                <span className="rounded-full bg-allergy/10 px-2 py-0.5 text-[11px] font-bold text-allergy">
                  {overdueTasks.length} overdue
                </span>
              )}
            </div>
            <div className="divide-y divide-border">
              {mockPendingTasks.map((t, i) => (
                <div key={i} className={cn("px-5 py-3.5", t.overdue && "bg-allergy/5")}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium">{t.patient}</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">{t.bed} · {t.task}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={cn("text-[11px] font-semibold", t.overdue ? "text-allergy" : "text-muted-foreground")}>
                        {t.overdue ? "Overdue" : "Due"} {t.due}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 5. Billing Dashboard ─────────────────────────────────────────────────────
function BillingDashboard() {
  const total = mockTransactions.reduce((s, t) => s + t.amount, 0);
  const cash  = mockTransactions.filter(t => t.mode === "Cash").reduce((s, t) => s + t.amount, 0);
  const upi   = mockTransactions.filter(t => t.mode === "UPI").reduce((s, t) => s + t.amount, 0);
  const card  = mockTransactions.filter(t => t.mode === "Card").reduce((s, t) => s + t.amount, 0);

  const modeColor: Record<string, string> = {
    Cash: "bg-status-ok/10 text-status-ok", Card: "bg-primary/10 text-primary",
    UPI: "bg-condition/10 text-condition", Insurance: "bg-status-info/10 text-status-info",
    "Payment Link": "bg-muted text-muted-foreground",
  };

  return (
    <div className="flex flex-col gap-0">
      <PageHeader eyebrow="Finance — Billing" title="Billing Dashboard"
        sub="Today's collections, pending actions, and transactions." />
      <div className="space-y-6 p-8">
        {/* Collection stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Collected" value={`₹${total.toLocaleString("en-IN")}`} sub="Today" icon={TrendingUp} color="green" />
          <StatCard label="Cash" value={`₹${cash.toLocaleString("en-IN")}`} icon={Receipt} color="slate" />
          <StatCard label="UPI" value={`₹${upi.toLocaleString("en-IN")}`} icon={Receipt} color="amber" />
          <StatCard label="Card" value={`₹${card.toLocaleString("en-IN")}`} icon={Receipt} color="blue" />
        </div>

        {/* Pending actions */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label:"Unpaid OPD Bills", value:3, amount:"₹2,850", color:"amber" as const },
            { label:"Low Advance IPD", value:2, amount:"₹18,000 short", color:"red" as const },
            { label:"Pending Discharge Bills", value:2, amount:"Awaiting TPA", color:"blue" as const },
            { label:"Discount Approvals", value:1, amount:"₹1,200 pending", color:"amber" as const },
          ].map((item) => (
            <div key={item.label} className="flex cursor-pointer items-start justify-between rounded-lg border border-border bg-card p-4 hover:bg-muted/20 transition-colors">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.label}</div>
                <div className="mt-1 text-2xl font-bold">{item.value}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{item.amount}</div>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>

        {/* Recent transactions */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <p className="text-sm font-semibold">Recent Transactions</p>
            <button className="text-xs font-medium text-primary hover:underline">View all</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["Time","Bill No","Patient","Type","Mode","Amount","Collected by"].map((h) => (
                    <th key={h} className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/20">
                    <td className="px-5 py-3 text-muted-foreground">{t.time}</td>
                    <td className="px-5 py-3 font-mono text-xs">{t.billNo}</td>
                    <td className="px-5 py-3 font-medium">{t.patient}</td>
                    <td className="px-5 py-3">
                      <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-semibold",
                        t.type === "IPD" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-semibold", modeColor[t.mode])}>
                        {t.mode}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold">₹{t.amount.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3 text-muted-foreground">{t.collectedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 6. TPA Coordinator Dashboard ─────────────────────────────────────────────
function TpaDashboard() {
  const statusBadge: Record<string, string> = {
    "pre-auth-approved": "bg-status-ok/10 text-status-ok",
    "queried":           "bg-condition/10 text-condition",
    "claim-submitted":   "bg-status-info/10 text-status-info",
    "pre-auth-pending":  "bg-allergy/10 text-allergy",
  };
  const statusText: Record<string, string> = {
    "pre-auth-approved": "Pre-auth Approved",
    "queried":           "Queried",
    "claim-submitted":   "Claim Submitted",
    "pre-auth-pending":  "Pre-auth Pending",
  };

  return (
    <div className="flex flex-col gap-0">
      <PageHeader eyebrow="Finance — TPA" title="Insurance & TPA"
        sub="Active insurance patients, pre-auth status, and claim tracking." />
      <div className="space-y-6 p-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Active Insurance Patients" value={mockTpaClaims.length} icon={Users} color="blue" />
          <StatCard label="Pre-auth Pending" value={1} sub="Needs action" icon={Clock} color="red" />
          <StatCard label="Queries to Respond" value={1} sub="Within 48 hrs" icon={AlertTriangle} color="amber" />
          <StatCard label="Claims Submitted" value={1} sub="Awaiting settlement" icon={ShieldCheck} color="green" />
        </div>

        {/* Claims table */}
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-5 py-3.5">
            <p className="text-sm font-semibold">Active Claims</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["Patient","IP No","TPA","Policy No","Admitted","Pre-Auth","Status","Days",""].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockTpaClaims.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{c.patient}</td>
                    <td className="px-4 py-3 font-mono text-xs">{c.ip}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.tpa}</td>
                    <td className="px-4 py-3 font-mono text-xs">{c.policy}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.admission}</td>
                    <td className="px-4 py-3 text-xs">{c.preAuth}</td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", statusBadge[c.status])}>
                        {statusText[c.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">Day {c.days}</td>
                    <td className="px-4 py-3">
                      <button className="text-[11px] font-medium text-primary hover:underline">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AR Ageing preview */}
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-5 py-3.5">
            <p className="text-sm font-semibold">AR Ageing Summary</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["TPA","0–30 days","31–60 days","61–90 days","90+ days","Total"].map((h) => (
                    <th key={h} className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { tpa:"MediAssist",    a:"₹85,000", b:"₹32,000", c:"—",      d:"—",      tot:"₹1,17,000" },
                  { tpa:"Star Health",   a:"—",       b:"₹45,000", c:"₹28,000",d:"—",      tot:"₹73,000" },
                  { tpa:"ICICI Lombard", a:"₹45,000", b:"—",       c:"—",      d:"—",      tot:"₹45,000" },
                  { tpa:"Bajaj Allianz", a:"—",       b:"—",       c:"₹62,000",d:"₹15,000",tot:"₹77,000" },
                ].map((row) => (
                  <tr key={row.tpa} className="hover:bg-muted/20">
                    <td className="px-5 py-3 font-medium">{row.tpa}</td>
                    <td className="px-5 py-3 text-status-ok font-medium">{row.a}</td>
                    <td className="px-5 py-3 text-condition font-medium">{row.b}</td>
                    <td className="px-5 py-3 text-allergy font-medium">{row.c}</td>
                    <td className="px-5 py-3 text-allergy font-bold">{row.d}</td>
                    <td className="px-5 py-3 font-bold">{row.tot}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 7. Radiologist Dashboard ─────────────────────────────────────────────────
function RadiologistDashboard() {
  const priorityBadge: Record<string, string> = {
    stat:    "bg-allergy text-white",
    urgent:  "bg-condition/10 text-condition",
    routine: "bg-muted text-muted-foreground",
  };

  return (
    <div className="flex flex-col gap-0">
      <PageHeader eyebrow="Radiology" title="Reporting Queue"
        sub="Pending reports awaiting sign-off." />
      <div className="space-y-6 p-8">
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Pending Reports" value={mockPendingReports.length} sub="1 STAT" icon={ScanLine} color="red" />
          <StatCard label="Reported Today" value={6} icon={CheckCircle2} color="green" />
          <StatCard label="Average TAT" value="42 min" sub="Target: 60 min" icon={Clock} color="blue" />
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-5 py-3.5">
            <p className="text-sm font-semibold">Scans Awaiting Report</p>
          </div>
          <div className="divide-y divide-border">
            {mockPendingReports.map((r) => (
              <div key={r.id} className={cn("flex items-center gap-4 px-5 py-4",
                r.priority === "stat" && "bg-allergy/5")}>
                <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold uppercase", priorityBadge[r.priority])}>
                  {r.priority}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{r.test}</span>
                    <span className="text-[11px] text-muted-foreground">({r.modality})</span>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {r.patient} · {r.uid} · Ordered by {r.orderedBy}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-muted-foreground">Scan done {r.completedAt}</div>
                  <button className="mt-1 rounded bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                    Write Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 8. Radiology Technician Dashboard ───────────────────────────────────────
function RadtechDashboard() {
  return (
    <div className="flex flex-col gap-0">
      <PageHeader eyebrow="Radiology" title="Today's Worklist"
        sub="Scheduled scans and patient arrivals." />
      <div className="space-y-6 p-8">
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Scheduled Today" value={8} sub="2 completed" icon={Calendar} color="blue" />
          <StatCard label="In Progress" value={1} icon={Activity} color="amber" />
          <StatCard label="Awaiting Report" value={mockPendingReports.length} icon={FileText} color="slate" />
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-5 py-3.5">
            <p className="text-sm font-semibold">Worklist</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["Priority","Patient","Test","Modality","Ordered by","Scheduled","Status",""].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockPendingReports.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
                        r.priority === "stat" ? "bg-allergy text-white" :
                        r.priority === "urgent" ? "bg-condition/10 text-condition" :
                        "bg-muted text-muted-foreground")}>
                        {r.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{r.patient}</td>
                    <td className="px-4 py-3">{r.test}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.modality}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{r.orderedBy}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.completedAt}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-status-ok/10 px-1.5 py-0.5 text-[10px] font-semibold text-status-ok">
                        Scan Done
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-[11px] font-medium text-primary hover:underline">
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
