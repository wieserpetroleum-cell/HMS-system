import { createFileRoute } from "@tanstack/react-router";
import { UserPlus, CalendarPlus, UserCog, FileBarChart } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentList, type RecentRow } from "@/components/dashboard/RecentList";
import { BedOccupancyBar } from "@/components/dashboard/BedOccupancyBar";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { mockAppointments } from "@/lib/mock/appointments";
import { mockBills, billsSummary } from "@/lib/mock/bills";
import { mockStaff } from "@/lib/mock/staff";
import { wardSummary, bedsByWard } from "@/lib/mock/wards";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { user } = useAuth();
  const ward = wardSummary();
  const bills = billsSummary();
  const staffOnDuty = mockStaff.filter((s) => s.onShift).length;

  const recentAdmissions: RecentRow[] = mockAppointments.slice(0, 5).map((a) => ({
    id: a.id,
    primary: a.patientName,
    secondary: `${a.department} · ${a.doctor}`,
    meta: a.time,
    badge: {
      label: a.status,
      tone:
        a.status === "completed" ? "ok" : a.status === "in-consultation" ? "info" : "default",
    },
  }));

  const alerts: RecentRow[] = [
    { id: "al1", primary: "ICU-01 critical vitals", secondary: "R. Verma · BP 180/110", meta: "2m", badge: { label: "critical", tone: "danger" } },
    { id: "al2", primary: "TPA claim overdue", secondary: "INV-23944 · HDFC Ergo · 45d", badge: { label: "tpa", tone: "warn" } },
    { id: "al3", primary: "Bed occupancy 73%", secondary: "ICU near capacity", badge: { label: "info", tone: "info" } },
  ];

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        eyebrow="Administrator"
        title={`Welcome back, ${user?.name?.split(" ").slice(-1)[0] ?? "Admin"}.`}
        description="Hospital-wide operational snapshot for today."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
        <KpiCard label="Total Patients" value="1,284" trend="up" trendLabel="+12 this week" />
        <KpiCard label="Staff on Duty" value={staffOnDuty} hint={`/ ${mockStaff.length}`} tone="info" />
        <KpiCard
          label="Revenue Today"
          value={`₹${bills.collectionsToday.toLocaleString()}`}
          trend="up"
          trendLabel="+8% vs yesterday"
          tone="ok"
        />
        <KpiCard
          label="Pending Bills"
          value={`₹${(bills.pendingAmount / 1000).toFixed(1)}k`}
          tone="warn"
        />
        <KpiCard
          label="Bed Occupancy"
          value={`${ward.occupancyPct}%`}
          hint={`${ward.occupied}/${ward.total}`}
          tone={ward.occupancyPct > 80 ? "danger" : "default"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <RecentList title="Today's Activity" rows={recentAdmissions} />
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Ward Occupancy
            </div>
            <div className="mt-4 space-y-4">
              {bedsByWard().map((w) => (
                <BedOccupancyBar
                  key={w.ward}
                  ward={w.ward}
                  total={w.total}
                  occupied={w.occupied}
                  available={w.available}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <QuickActions
            actions={[
              { label: "Register Patient", icon: UserPlus },
              { label: "New Appointment", icon: CalendarPlus },
              { label: "Add User", icon: UserCog },
              { label: "View Reports", icon: FileBarChart },
            ]}
          />
          <RecentList title="System Alerts" rows={alerts} />
        </div>
      </div>
    </div>
  );
}
