import * as React from "react";
import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { z } from "zod";
import { CalendarPlus, ArrowLeft, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { FormSection, FormGrid } from "@/components/forms/FormSection";
import { Field } from "@/components/forms/Field";
import { Combobox } from "@/components/forms/Combobox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { usePatients } from "@/lib/patients-store";
import { useAppointments } from "@/lib/appointments-store";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  patientUid: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/appointments/new")({
  component: NewAppointment,
  validateSearch: (search) => searchSchema.parse(search),
});

const DOCTORS = [
  { name: "Dr. Mehta", department: "Cardiology", room: "C-204" },
  { name: "Dr. Iyer", department: "General Medicine", room: "G-101" },
  { name: "Dr. Khan", department: "Orthopedics", room: "O-302" },
  { name: "Dr. Sharma", department: "Pediatrics", room: "P-110" },
  { name: "Dr. Reddy", department: "ENT", room: "E-205" },
];

const TYPES: Array<"OPD" | "Follow-up" | "Walk-in"> = ["OPD", "Follow-up", "Walk-in"];

const SLOT_TIMES = (() => {
  const out: string[] = [];
  for (let h = 9; h < 17; h++) {
    for (let m = 0; m < 60; m += 15) {
      out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return out;
})();

const next14Days = () => {
  const out: { value: string; label: string }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(Date.now() + i * 86400000);
    const value = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
    out.push({ value, label: `${label}${i === 0 ? " · Today" : ""}` });
  }
  return out;
};

function NewAppointment() {
  const { patients } = usePatients();
  const { appointments, addAppointment } = useAppointments();
  const navigate = useNavigate();
  const { patientUid } = useSearch({ from: "/_authenticated/appointments/new" });

  const today = new Date().toISOString().slice(0, 10);
  const [selectedUid, setSelectedUid] = React.useState<string | undefined>(patientUid);
  const [doctor, setDoctor] = React.useState<string>(DOCTORS[0].name);
  const [date, setDate] = React.useState(today);
  const [time, setTime] = React.useState<string>("");
  const [type, setType] = React.useState<"OPD" | "Follow-up" | "Walk-in">("OPD");
  const [complaint, setComplaint] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const dates = React.useMemo(() => next14Days(), []);
  const doctorMeta = DOCTORS.find((d) => d.name === doctor)!;

  const patientOptions = patients.map((p) => ({
    value: p.uid,
    label: `${p.name}`,
    hint: `${p.uid} · ${p.mobile ?? ""}`,
  }));

  const takenSlots = new Set(
    appointments
      .filter((a) => a.doctor === doctor && a.date === date && a.status !== "cancelled")
      .map((a) => a.time),
  );

  const selectedPatient = patients.find((p) => p.uid === selectedUid);

  const submit = () => {
    setError(null);
    if (!selectedPatient) return setError("Select a patient");
    if (!time) return setError("Select a time slot");

    const appt = addAppointment({
      patientId: selectedPatient.id,
      patientUid: selectedPatient.uid,
      patientName: selectedPatient.name,
      doctor,
      department: doctorMeta.department,
      room: doctorMeta.room,
      date,
      time,
      status: "scheduled",
      type,
      complaint: complaint.trim() || undefined,
    });

    toast.success("Appointment booked", {
      description: `${selectedPatient.name} · ${doctor} · ${date} ${time}`,
    });
    navigate({ to: "/appointments" });
    void appt;
  };

  if (patients.length === 0) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-8 text-center">
          <h2 className="text-lg font-bold">No patients registered</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Register a patient before booking an appointment.
          </p>
          <Button asChild className="mt-4">
            <Link to="/patients/register">
              <UserPlus className="mr-2 h-4 w-4" />
              Register Patient
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pb-32">
      <PageHeader
        eyebrow="Module 04 · Screen 11"
        title="Book Appointment"
        description="Slot a registered patient with a doctor for OPD or follow-up."
        right={
          <Button variant="outline" asChild>
            <Link to="/appointments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Queue
            </Link>
          </Button>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <FormSection number="01" title="Patient" description="Search by name, UID or mobile.">
            <FormGrid cols={1}>
              <Field label="Patient" required>
                <Combobox
                  options={patientOptions}
                  value={selectedUid}
                  onChange={(v) => setSelectedUid(v)}
                  placeholder="Search registered patients…"
                  emptyText="No patients found"
                />
              </Field>
              {selectedPatient && (
                <div className="rounded-md border border-border bg-secondary/30 p-3 text-xs">
                  <div className="font-semibold">{selectedPatient.name}</div>
                  <div className="mt-0.5 font-mono text-muted-foreground">{selectedPatient.uid}</div>
                  <div className="mt-1 text-muted-foreground">
                    {selectedPatient.sex} · {selectedPatient.age}
                    {selectedPatient.mobile ? ` · ${selectedPatient.mobile}` : ""}
                  </div>
                  {selectedPatient.allergies.length > 0 && (
                    <div className="mt-2 text-allergy">
                      ⚠ Allergies: {selectedPatient.allergies.join(", ")}
                    </div>
                  )}
                </div>
              )}
            </FormGrid>
          </FormSection>

          <FormSection number="02" title="Doctor & Visit" description="Department and room auto-fill.">
            <FormGrid cols={2}>
              <Field label="Doctor" required>
                <select
                  className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                >
                  {DOCTORS.map((d) => (
                    <option key={d.name} value={d.name}>{d.name} — {d.department}</option>
                  ))}
                </select>
              </Field>
              <Field label="Room">
                <Input value={doctorMeta.room} readOnly className="bg-secondary/40" />
              </Field>
              <Field label="Visit type" required>
                <div className="flex gap-1.5">
                  {TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={cn(
                        "flex-1 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors",
                        type === t
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-primary",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Date" required>
                <select
                  className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"
                  value={date}
                  onChange={(e) => { setDate(e.target.value); setTime(""); }}
                >
                  {dates.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </Field>
            </FormGrid>
          </FormSection>

          <FormSection number="03" title="Time slot" description="15-minute slots between 09:00 and 17:00. Greyed slots are taken.">
            <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-8">
              {SLOT_TIMES.map((t) => {
                const taken = takenSlots.has(t);
                const sel = time === t;
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={taken}
                    onClick={() => setTime(t)}
                    className={cn(
                      "rounded border px-2 py-1.5 text-[11px] font-mono tabular-nums transition-colors",
                      sel
                        ? "border-primary bg-primary text-primary-foreground"
                        : taken
                          ? "cursor-not-allowed border-border bg-secondary/60 text-muted-foreground/50 line-through"
                          : "border-border bg-background hover:border-primary",
                    )}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </FormSection>

          <FormSection number="04" title="Chief complaint" description="Optional. Helps the doctor triage.">
            <Textarea
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="e.g. Chest tightness for 2 days, worse on exertion"
              rows={3}
            />
          </FormSection>
        </div>

        <aside className="lg:sticky lg:top-6 lg:h-max">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Booking Summary</div>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-[11px] uppercase text-muted-foreground">Patient</dt>
                <dd className="font-semibold">{selectedPatient?.name ?? "—"}</dd>
                {selectedPatient && <dd className="font-mono text-[11px] text-muted-foreground">{selectedPatient.uid}</dd>}
              </div>
              <div>
                <dt className="text-[11px] uppercase text-muted-foreground">Doctor</dt>
                <dd className="font-semibold">{doctor}</dd>
                <dd className="text-[11px] text-muted-foreground">{doctorMeta.department} · {doctorMeta.room}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase text-muted-foreground">Date & Time</dt>
                <dd className="font-mono font-semibold tabular-nums">
                  {date}{time ? ` · ${time}` : " · — : —"}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase text-muted-foreground">Type</dt>
                <dd className="font-semibold">{type}</dd>
              </div>
            </dl>
            {error && (
              <div className="mt-4 rounded border border-allergy/40 bg-allergy/10 px-3 py-2 text-[11px] font-medium text-allergy">
                {error}
              </div>
            )}
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur">
        <div className="flex items-center justify-end gap-2 px-8 py-3">
          <Button variant="outline" onClick={() => navigate({ to: "/appointments" })}>
            Cancel
          </Button>
          <Button onClick={submit}>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Book Appointment
          </Button>
        </div>
      </div>
    </div>
  );
}
