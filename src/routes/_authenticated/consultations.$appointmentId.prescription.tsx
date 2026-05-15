import { createFileRoute, Link } from "@tanstack/react-router";
import { Printer, ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppointments } from "@/lib/appointments-store";
import { useConsultations } from "@/lib/consultations-store";
import { usePatients } from "@/lib/patients-store";

export const Route = createFileRoute("/_authenticated/consultations/$appointmentId/prescription")({
  component: PrescriptionPreview,
});

function PrescriptionPreview() {
  const { appointmentId } = Route.useParams();
  const { getById } = useAppointments();
  const { getByAppointment } = useConsultations();
  const { patients } = usePatients();

  const appt = getById(appointmentId);
  const consult = getByAppointment(appointmentId);
  const patient = appt ? patients.find((p) => p.uid === appt.patientUid) : undefined;

  if (!appt || !consult) {
    return (
      <div className="p-12">
        <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-8 text-center">
          <h2 className="text-lg font-bold">No prescription</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This appointment has not been completed yet.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/appointments">Back to Queue</Link>
            </Button>
            {appt && (
              <Button asChild>
                <Link to="/consultations/$appointmentId" params={{ appointmentId }}>
                  Open Consultation
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const date = new Date(consult.date).toLocaleString();
  const followUpDate = consult.followUpDays
    ? new Date(Date.now() + consult.followUpDays * 86400000).toLocaleDateString()
    : null;

  return (
    <div className="p-8">
      <div className="no-print mb-6 flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link to="/appointments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Queue
          </Link>
        </Button>
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Print Prescription
        </Button>
      </div>

      <div className="print-area mx-auto max-w-3xl rounded-lg border border-border bg-card p-10 shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-foreground pb-4">
          <div>
            <div className="text-xl font-bold tracking-tight">MEDICORE.OS Hospital</div>
            <div className="text-[11px] text-muted-foreground">
              45 Wellness Avenue · Mumbai · MH 400001 · +91 22 4000 0000
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold">{consult.doctor}</div>
            <div className="text-[11px] text-muted-foreground">Reg. No. MH-MED-2018-44521</div>
            <div className="text-[11px] text-muted-foreground">{appt.department}</div>
          </div>
        </div>

        {/* Patient block */}
        <div className="mt-4 grid grid-cols-3 gap-4 rounded border border-border bg-secondary/30 p-3 text-xs">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Patient</div>
            <div className="font-semibold">{consult.patientName}</div>
            <div className="font-mono text-[10px] text-muted-foreground">{consult.patientUid}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Sex / Age</div>
            <div className="font-semibold">{patient?.sex ?? "—"} · {patient?.age ?? "—"}</div>
            {patient?.bloodGroup && <div className="text-[10px] text-muted-foreground">Blood: {patient.bloodGroup}</div>}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Date</div>
            <div className="font-semibold tabular-nums">{date}</div>
          </div>
          {patient && patient.allergies.length > 0 && (
            <div className="col-span-3 mt-1 flex items-start gap-2 rounded border border-allergy/40 bg-allergy/10 p-2 text-allergy">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider">Allergies: </span>
                <span className="text-[11px] font-semibold">{patient.allergies.join(", ")}</span>
              </div>
            </div>
          )}
        </div>

        {/* Vitals & complaints */}
        <div className="mt-5 grid grid-cols-2 gap-5 text-xs">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Chief Complaints</div>
            <ul className="mt-1 list-disc pl-4">
              {consult.chiefComplaints.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Vitals</div>
            <div className="mt-1 grid grid-cols-2 gap-x-4 font-mono text-[11px]">
              {consult.vitals.bp && <div>BP: {consult.vitals.bp}</div>}
              {consult.vitals.pulse && <div>Pulse: {consult.vitals.pulse}/min</div>}
              {consult.vitals.temp && <div>Temp: {consult.vitals.temp}°C</div>}
              {consult.vitals.spo2 && <div>SpO₂: {consult.vitals.spo2}%</div>}
              {consult.vitals.weight && <div>Wt: {consult.vitals.weight} kg</div>}
              {consult.vitals.bmi && <div>BMI: {consult.vitals.bmi}</div>}
            </div>
          </div>
        </div>

        {/* Diagnoses */}
        <div className="mt-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Diagnoses</div>
          <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-sm">
            {consult.diagnoses.map((d) => (
              <li key={d.code}>
                <span className="font-mono text-[11px] font-bold text-primary">{d.code}</span>{" "}
                {d.text}
                {d.primary && <span className="ml-2 rounded border border-primary px-1 text-[9px] font-bold uppercase tracking-wider text-primary">Primary</span>}
              </li>
            ))}
          </ol>
        </div>

        {/* Rx */}
        <div className="mt-5">
          <div className="flex items-baseline gap-3 border-b border-border pb-1">
            <span className="text-2xl font-serif italic">℞</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Prescription</span>
          </div>
          {consult.rx.length === 0 ? (
            <p className="mt-2 text-xs italic text-muted-foreground">No medications prescribed.</p>
          ) : (
            <table className="mt-2 w-full text-xs">
              <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-1.5 pr-2 text-left">#</th>
                  <th className="py-1.5 pr-2 text-left">Drug</th>
                  <th className="py-1.5 pr-2 text-left">Dose</th>
                  <th className="py-1.5 pr-2 text-left">Frequency</th>
                  <th className="py-1.5 pr-2 text-left">Duration</th>
                  <th className="py-1.5 text-left">Instructions</th>
                </tr>
              </thead>
              <tbody>
                {consult.rx.map((r, i) => (
                  <tr key={r.id} className="border-b border-border/60">
                    <td className="py-2 pr-2 font-mono">{i + 1}</td>
                    <td className="py-2 pr-2">
                      <div className="font-semibold">{r.drug} {r.strength ?? ""}</div>
                      {r.form && <div className="text-[10px] text-muted-foreground">{r.form} · {r.route}</div>}
                    </td>
                    <td className="py-2 pr-2">{r.dose ?? "—"}</td>
                    <td className="py-2 pr-2 font-mono">{r.frequency ?? "—"}</td>
                    <td className="py-2 pr-2">{r.duration ?? "—"}</td>
                    <td className="py-2 italic text-muted-foreground">{r.instructions ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Advice + follow-up */}
        {(consult.advice || followUpDate || consult.labOrders) && (
          <div className="mt-5 grid grid-cols-2 gap-5 text-xs">
            {consult.advice && (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Advice</div>
                <p className="mt-1 whitespace-pre-line">{consult.advice}</p>
              </div>
            )}
            <div>
              {consult.labOrders && (
                <>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Labs / Imaging</div>
                  <p className="mt-1 whitespace-pre-line">{consult.labOrders}</p>
                </>
              )}
              {followUpDate && (
                <div className="mt-3 rounded border border-primary/40 bg-primary/5 p-2">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-primary">Follow-up</div>
                  <div className="mt-0.5 font-mono font-semibold">
                    {followUpDate} ({consult.followUpDays} days)
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer signature */}
        <div className="mt-12 flex items-end justify-between border-t border-border pt-4">
          <div className="text-[10px] text-muted-foreground">
            Generated by MEDICORE.OS · This is a computer-generated prescription.
          </div>
          <div className="text-right">
            <div className="h-12 w-48 border-b border-foreground" />
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider">{consult.doctor}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
