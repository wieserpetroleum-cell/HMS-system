import { createFileRoute } from "@tanstack/react-router";
import { UserPlus, ClipboardCheck, CalendarPlus, BedDouble } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentList, type RecentRow } from "@/components/dashboard/RecentList";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { mockAppointments } from "@/lib/mock/appointments";
import { wardSummary } from "@/lib/mock/wards";

export const Route = createFileRoute("/_authenticated/dashboard/reception")({
  component: ReceptionDashboard,
});

function ReceptionDashboard() {
  const ward = wardSummary();
  const checkedIn = mockAppointments.filter((a) => a.status === "checked-in");
  const walkIns = mockAppointments.filter((a) => a.type === "Walk-in").length;

  const queue: RecentRow[] = checkedIn.map((a) => ({
    id: a.id,
    primary: a.patientName,
    secondary: `${a.doctor} · ${a.room}`,
    meta: a.time,
    badge: { label: a.type, tone: a.type === "Walk-in" ? "warn" : "info" },
  }));

  const upcoming: RecentRow[] = mockAppointments
    .filter((a) => a.status === "scheduled")
    .map((a) => ({
      id: a.id,
      primary: a.patientName,
      secondary: `${a.doctor} · ${a.department}`,
      meta: a.time,
    }));

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        eyebrow="Reception"
        title="Front desk operations"
        description="Live queue, walk-ins and bed availability."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Appointments Today" value={mockAppointments.length} tone="info" />
        <KpiCard label="Walk-ins" value={walkIns} tone="warn" />
        <KpiCard label="Beds Available" value={ward.available} hint={`/ ${ward.total}`} tone="ok" />
        <KpiCard label="In Queue" value={checkedIn.length} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <RecentList title="Live Queue" rows={queue} emptyText="Queue is empty." />
          <RecentList title="Upcoming Appointments" rows={upcoming} />
        </div>
        <QuickActions
          actions={[
            { label: "Check-in Patient", icon: ClipboardCheck },
            { label: "Register New", icon: UserPlus },
            { label: "Book Appointment", icon: CalendarPlus },
            { label: "Allocate Bed", icon: BedDouble },
          ]}
        />
      </div>
    </div>
  );
}