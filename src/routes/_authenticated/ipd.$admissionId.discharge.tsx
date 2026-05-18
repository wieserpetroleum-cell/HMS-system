import { useParams } from "react-router-dom";
import * as React from "react";
import { Link, useNavigate, useSearch } from "react-router-dom";
import { z } from "zod";
import { ArrowLeft, LogOut, Printer, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { FormSection } from "@/components/forms/FormSection";
import { Field } from "@/components/forms/Field";
import { Combobox } from "@/components/forms/Combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RxRowEditor } from "@/components/consultation/RxRowEditor";
import { StatusPill } from "@/components/ipd/StatusPill";
import { useAdmissions } from "@/lib/admissions-store";
import { useAuth } from "@/lib/auth-context";
import { mockDiagnoses } from "@/lib/mock/diagnoses";
import { dischargeSchema } from "@/lib/validation/admission";
import type { DiagnosisEntry, DischargeCondition, RxItem } from "@/lib/types";

const searchSchema = z.object({ print: z.string().optional() });

  component: DischargePage,
  validateSearch: (s) => searchSchema.parse(s),
});

const CONDITIONS: DischargeCondition[] = ["Stable", "Improved", "Critical", "LAMA", "Expired"];

function DischargePage() {
  const { admissionId } = useParams();
  const { print } = useSearch({ from: "/_authenticated/ipd/$admissionId/discharge" });
  const { getById, discharge } = useAdmissions();
  const { user } = useAuth();
  const navigate = useNavigate();
  const adm = getById(admissionId);

  const [diagnosisCode, setDiagnosisCode] = React.useState<string | undefined>(adm?.provisionalDiagnosis?.code);
  const [hospitalCourse, setHospitalCourse] = React.useState("");
  const [procedures, setProcedures] = React.useState("");
  const [condition, setCondition] = React.useState<DischargeCondition>("Stable");
  const [meds, setMeds] = React.useState<RxItem[]>([]);
  const [followUpInstr, setFollowUpInstr] = React.useState("");
  const [followUpDate, setFollowUpDate] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (print === "1") setTimeout(() => window.print(), 350);
  }, [print]);

  if (!adm) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
        <p className="text-sm text-muted-foreground">Admission not found.</p>
        <Button variant="outline" onClick={() => navigate("/ipd")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Floor view
        </Button>
      </div>
    );
  }

  // Already discharged → print-only view
  if (adm.status === "discharged" && adm.dischargeSummary) {
    return <DischargePrintable admission={adm} />;
  }

  const diagnosis: DiagnosisEntry | undefined = (() => {
    const d = mockDiagnoses.find((x) => x.code === diagnosisCode);
    return d ? { code: d.code, text: d.text, primary: true } : undefined;
  })();

  const finalDiagnoses = diagnosis ? [diagnosis] : [];

  const submit = () => {
    setError(null);
    const parsed = dischargeSchema.safeParse({
      finalDiagnosis: finalDiagnoses,
      hospitalCourse,
      condition,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    discharge(adm.id, {
      finalDiagnosis: finalDiagnoses,
      procedures,
      hospitalCourse,
      condition,
      dischargeMeds: meds,
      followUpInstructions: followUpInstr,
      followUpDate,
      signedBy: user?.name ?? "Clinician",
    });
    toast.success("Discharge summary saved");
    navigate("/ipd/$admissionId/discharge", params: { admissionId: adm.id }, search: { print: "1" });
  };

  const previewSummary = {
    finalDiagnosis: finalDiagnoses,
    hospitalCourse,
    procedures,
    condition,
    dischargeMeds: meds,
    followUpInstructions: followUpInstr,
    followUpDate,
    signedBy: user?.name ?? "—",
  };

  return (
    <div className="p-8">
      <Link
        to="/ipd/$admissionId"
        params={{ admissionId: adm.id }}
        className="mb-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground print:hidden"
      >
        <ArrowLeft className="h-3 w-3" /> Back to chart
      </Link>

      <div className="print:hidden">
        <PageHeader eyebrow="IPD · Discharge" title={`Discharge ${adm.patientName}`} description="Author the discharge summary. Submitting frees the bed for cleaning." />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4 print:hidden">
          <FormSection title="Diagnosis & Course" number="01">
            <Field label="Final diagnosis" required>
              <Combobox
                options={mockDiagnoses.map((d) => ({ value: d.code, label: d.text, hint: d.code }))}
                value={diagnosisCode}
                onChange={(v) => setDiagnosisCode(v)}
                placeholder="Search ICD-10…"
              />
            </Field>
            <Field label="Procedures performed">
              <Textarea rows={2} value={procedures} onChange={(e) => setProcedures(e.target.value)} placeholder="e.g. ECG, cardiac echo, IV cannulation" />
            </Field>
            <Field label="Hospital course" required>
              <Textarea rows={5} value={hospitalCourse} onChange={(e) => setHospitalCourse(e.target.value)} placeholder="Summarise the patient's stay, response to treatment, complications…" />
            </Field>
            <Field label="Condition at discharge" required>
              <select
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={condition}
                onChange={(e) => setCondition(e.target.value as DischargeCondition)}
              >
                {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </FormSection>

          <FormSection title="Discharge Medications" number="02">
            <div className="space-y-2">
              {meds.map((m, i) => (
                <RxRowEditor
                  key={m.id}
                  index={i}
                  item={m}
                  onChange={(n) => setMeds((prev) => prev.map((p, idx) => (idx === i ? n : p)))}
                  onRemove={() => setMeds((prev) => prev.filter((_, idx) => idx !== i))}
                />
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMeds((prev) => [...prev, { id: `rx${Date.now()}`, drug: "", route: "PO" }])}
              >
                <Plus className="mr-1 h-4 w-4" /> Add medication
              </Button>
            </div>
          </FormSection>

          <FormSection title="Follow-up" number="03">
            <Field label="Instructions">
              <Textarea rows={3} value={followUpInstr} onChange={(e) => setFollowUpInstr(e.target.value)} placeholder="Wound care, activity restrictions, red flags to watch for…" />
            </Field>
            <Field label="Follow-up date">
              <Input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
            </Field>
          </FormSection>

          {error && <div className="rounded-md border border-allergy/40 bg-allergy/10 px-3 py-2 text-sm text-allergy">{error}</div>}

          <div className="flex justify-end gap-2">
            <Button variant="outline" asChild>
              <Link to="/ipd/$admissionId" params={{ admissionId: adm.id }}>Cancel</Link>
            </Button>
            <Button onClick={submit}>
              <LogOut className="mr-1.5 h-4 w-4" /> Discharge & Print
            </Button>
          </div>
        </div>

        <div className="print-area">
          <DischargePreview admission={adm} summary={previewSummary} />
        </div>
      </div>
    </div>
  );
}

function DischargePreview({
  admission,
  summary,
}: {
  admission: import("@/lib/types").Admission;
  summary: {
    finalDiagnosis: DiagnosisEntry[]; hospitalCourse: string; procedures?: string;
    condition: DischargeCondition; dischargeMeds: RxItem[];
    followUpInstructions?: string; followUpDate?: string; signedBy: string;
  };
}) {
  return (
    <div className="mx-auto max-w-[820px] rounded-lg border border-border bg-white p-10 text-slate-900 shadow-sm print:rounded-none print:border-0 print:shadow-none">
      <header className="flex items-start justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="text-xl font-bold tracking-tight">MEDICORE Hospital</div>
          <div className="text-[11px] text-slate-500">123 Health Avenue · Mumbai · +91 22 1234 5678</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Discharge Summary</div>
          <div className="font-mono text-xs">{admission.admissionNo}</div>
        </div>
      </header>

      <section className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-[12px]">
        <Row k="Patient" v={`${admission.patientName} (${admission.patientUid})`} />
        <Row k="Ward / Bed" v={`${admission.ward} · ${admission.bedNumber}`} />
        <Row k="Primary Doctor" v={`${admission.primaryDoctor} · ${admission.department}`} />
        <Row k="Admitted" v={new Date(admission.admittedAt).toLocaleString()} />
        <Row k="Discharged" v={new Date().toLocaleString()} />
        <Row k="Condition" v={summary.condition} />
      </section>

      <Section title="Diagnosis">
        {summary.finalDiagnosis.length === 0 ? (
          <p className="text-[12px] italic text-slate-400">No diagnosis recorded</p>
        ) : (
          <ul className="text-[12px]">
            {summary.finalDiagnosis.map((d) => (
              <li key={d.code}><b>{d.code}</b> · {d.text}</li>
            ))}
          </ul>
        )}
      </Section>

      {summary.procedures && (
        <Section title="Procedures">
          <p className="whitespace-pre-wrap text-[12px]">{summary.procedures}</p>
        </Section>
      )}

      <Section title="Hospital Course">
        <p className="whitespace-pre-wrap text-[12px]">{summary.hospitalCourse || <span className="italic text-slate-400">—</span>}</p>
      </Section>

      <Section title="Discharge Medications">
        {summary.dischargeMeds.length === 0 ? (
          <p className="text-[12px] italic text-slate-400">None</p>
        ) : (
          <table className="w-full text-[12px]">
            <thead className="border-b border-slate-200 text-left text-[10px] uppercase tracking-wider text-slate-500">
              <tr><th className="py-1">Medicine</th><th>Dose</th><th>Freq</th><th>Duration</th><th>Route</th></tr>
            </thead>
            <tbody>
              {summary.dischargeMeds.map((m) => (
                <tr key={m.id} className="border-b border-slate-100">
                  <td className="py-1.5">{m.drug} {m.strength ?? ""}</td>
                  <td>{m.dose ?? "—"}</td>
                  <td>{m.frequency ?? "—"}</td>
                  <td>{m.duration ?? "—"}</td>
                  <td>{m.route ?? "PO"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      <Section title="Follow-up">
        <p className="text-[12px]">{summary.followUpInstructions || <span className="italic text-slate-400">—</span>}</p>
        {summary.followUpDate && (
          <p className="mt-1 text-[12px]"><b>Next visit:</b> {summary.followUpDate}</p>
        )}
      </Section>

      <footer className="mt-10 flex items-end justify-between border-t border-slate-200 pt-4 text-[11px]">
        <div>Stamp & Hospital Seal</div>
        <div className="text-right">
          <div className="border-t border-slate-400 pt-1 font-mono">{summary.signedBy}</div>
          <div className="text-[10px] text-slate-500">Discharging Clinician</div>
        </div>
      </footer>

      <div className="mt-4 flex justify-end print:hidden">
        <Button size="sm" variant="outline" onClick={() => window.print()}>
          <Printer className="mr-1.5 h-4 w-4" /> Print
        </Button>
      </div>
    </div>
  );
}

function DischargePrintable({ admission }: { admission: import("@/lib/types").Admission }) {
  const s = admission.dischargeSummary!;
  return (
    <div className="p-8">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link
          to="/ipd"
          className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Floor view
        </Link>
        <StatusPill tone="ok">Discharged · {new Date(admission.dischargedAt!).toLocaleString()}</StatusPill>
      </div>
      <div className="print-area">
        <DischargePreview admission={admission} summary={{ ...s }} />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4 border-t border-slate-200 pt-3">
      <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">{title}</h3>
      {children}
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2">
      <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{k}</dt>
      <dd className="text-[12px]">{v}</dd>
    </div>
  );
}export default DischargePage;
