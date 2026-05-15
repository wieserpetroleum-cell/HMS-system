import { createFileRoute } from "@tanstack/react-router";
import { Stethoscope, BedDouble, NotebookPen, Activity } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentList, type RecentRow } from "@/components/dashboard/RecentList";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { mockAppointments } from "@/lib/mock/appointments";

export const Route = createFileRoute("/_authenticated/dashboard/doctor")({
  component: DoctorDashboard,
});

function DoctorDashboard() {
  const seen = mockAppointments.filter((a) => a.status === "completed").length;
  const pending = mockAppointments.filter((a) =>
    ["scheduled", "checked-in", "in-consultation"].includes(a.status),
  ).length;

  const schedule: RecentRow[] = mockAppointments.map((a) => ({
    id: a.id,
    primary: a.patientName,
    secondary: `${a.type} · ${a.department}`,
    meta: a.time,
    badge: {
      label: a.status,
      tone:
        a.status === "completed"
          ? "ok"
          : a.status === "in-consultation"
            ? "info"
            : a.status === "checked-in"
              ? "warn"
              : "default",
    },
  }));

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        eyebrow="Clinician"
        title="Today's clinical workload"
        description="OPD schedule, ward rounds and pending consultations."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="OPD Patients Seen" value={seen} tone="ok" />
        <KpiCard label="Pending Consultations" value={pending} tone="warn" />
        <KpiCard label="Ward Rounds" value={3} tone="info" />
        <KpiCard label="Surgeries Scheduled" value={1} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentList title="Today's Schedule" rows={schedule} />
        </div>
        <QuickActions
          actions={[
            { label: "Start Consultation", icon: Stethoscope },
            { label: "View Ward", icon: BedDouble },
            { label: "Write Notes", icon: NotebookPen },
            { label: "Review Vitals", icon: Activity },
          ]}
        />
      </div>
    </div>
  );
}