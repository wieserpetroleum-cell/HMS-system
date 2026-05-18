import * as React from "react";
import { Link, useNavigate, useSearch } from "react-router-dom";
import { z } from "zod";
import { BedDouble, ArrowLeft, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { FormSection, FormGrid } from "@/components/forms/FormSection";
import { Field } from "@/components/forms/Field";
import { Combobox } from "@/components/forms/Combobox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BedPickerGrid } from "@/components/ipd/BedPickerGrid";
import { PatientSummaryRail } from "@/components/consultation/PatientSummaryRail";
import { usePatients } from "@/lib/patients-store";
import { useAdmissions } from "@/lib/admissions-store";
import { admissionSchema } from "@/lib/validation/admission";
import { mockDiagnoses } from "@/lib/mock/diagnoses";
import type { DietType, WardBed } from "@/lib/types";

const searchSchema = z.object({ patientUid: z.string().optional() });

  component: AdmitPatient,
  validateSearch: (search) => searchSchema.parse(search),
});

const DOCTORS = [
  { name: "Dr. Mehta", department: "Cardiology" },
  { name: "Dr. Iyer", department: "General Medicine" },
  { name: "Dr. Khan", department: "Orthopedics" },
  { name: "Dr. Sharma", department: "Pediatrics" },
  { name: "Dr. Reddy", department: "ENT" },
];

const DIETS: DietType[] = ["Regular", "Diabetic", "Soft", "Liquid", "NPO"];

function AdmitPatient() {
  const { patients, getPatient } = usePatients();
  const { addAdmission } = useAdmissions();
  const navigate = useNavigate();
  const { patientUid } = useSearch({ from: "/_authenticated/ipd/admit" });

  const [selectedUid, setSelectedUid] = React.useState<string | undefined>(patientUid);
  const [bed, setBed] = React.useState<WardBed | undefined>();
  const [doctor, setDoctor] = React.useState(DOCTORS[0].name);
  const [reason, setReason] = React.useState("");
  const [diagnosisCode, setDiagnosisCode] = React.useState<string | undefined>();
  const [diet, setDiet] = React.useState<DietType>("Regular");
  const [isolation, setIsolation] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const patient = selectedUid ? getPatient(selectedUid) : undefined;
  const doctorMeta = DOCTORS.find((d) => d.name === doctor)!;

  const patientOptions = patients.map((p) => ({
    value: p.uid,
    label: p.name,
    hint: `${p.uid} · ${p.mobile ?? ""}`,
  }));
  const diagnosisOptions = mockDiagnoses.map((d) => ({ value: d.code, label: d.text, hint: d.code }));

  const submit = React.useCallback(() => {
    setError(null);
    if (!patient || !bed) {
      setError("Select patient and bed");
      return;
    }
    const parsed = admissionSchema.safeParse({
      patientUid: patient.uid,
      bedId: bed.id,
      primaryDoctor: doctor,
      department: doctorMeta.department,
      reason,
      diet,
      isolation,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    const dx = mockDiagnoses.find((d) => d.code === diagnosisCode);
    const adm = addAdmission({
      patientUid: patient.uid,
      patientName: patient.name,
      bedId: bed.id,
      ward: bed.ward,
      bedNumber: bed.bedNumber,
      primaryDoctor: doctor,
      department: doctorMeta.department,
      reason,
      provisionalDiagnosis: dx ? { code: dx.code, text: dx.text, primary: true } : undefined,
      diet,
      isolation,
    });
    toast.success(`Admitted ${patient.name} → ${bed.bedNumber}`);
    navigate("/ipd/$admissionId", params: { admissionId: adm.id });
  }, [patient, bed, doctor, doctorMeta.department, reason, diet, isolation, diagnosisCode, addAdmission, navigate]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        submit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [submit]);

  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-16 text-center">
        <p className="text-sm text-muted-foreground">No patients registered yet.</p>
        <Button asChild>
          <Link to="/patients/register">
            <UserPlus className="mr-1.5 h-4 w-4" /> Register Patient
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <Link
        to="/ipd"
        className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Floor View
      </Link>

      <PageHeader eyebrow="IPD" title="New admission" description="Convert an existing patient into an in-patient and allocate a bed." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <FormSection title="Patient & Care Team" number="01">
            <FormGrid cols={2}>
              <Field label="Patient" required>
                <Combobox
                  options={patientOptions}
                  value={selectedUid}
                  onChange={(v) => setSelectedUid(v)}
                  placeholder="Search by name or UID…"
                />
              </Field>
              <Field label="Primary doctor" required>
                <Combobox
                  options={DOCTORS.map((d) => ({ value: d.name, label: d.name, hint: d.department }))}
                  value={doctor}
                  onChange={(v) => setDoctor(v)}
                />
              </Field>
            </FormGrid>
            <FormGrid cols={2}>
              <Field label="Department">
                <Input value={doctorMeta.department} readOnly className="bg-muted/40" />
              </Field>
              <Field label="Diet" required>
                <select
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                  value={diet}
                  onChange={(e) => setDiet(e.target.value as DietType)}
                >
                  {DIETS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
            </FormGrid>
          </FormSection>

          <FormSection title="Clinical" number="02">
            <Field label="Reason for admission" required>
              <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Chest pain — rule out ACS" />
            </Field>
            <FormGrid cols={2}>
              <Field label="Provisional diagnosis">
                <Combobox
                  options={diagnosisOptions}
                  value={diagnosisCode}
                  onChange={(v) => setDiagnosisCode(v)}
                  placeholder="Search ICD-10…"
                />
              </Field>
              <Field label="Isolation">
                <label className="flex h-9 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isolation}
                    onChange={(e) => setIsolation(e.target.checked)}
                    className="size-4 rounded border-border"
                  />
                  Requires isolation precautions
                </label>
              </Field>
            </FormGrid>
          </FormSection>

          <FormSection title="Bed Allocation" number="03">
            {bed ? (
              <div className="mb-3 flex items-center justify-between rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
                <span>
                  Selected: <span className="font-mono font-semibold">{bed.bedNumber}</span> · {bed.ward}
                </span>
                <Button variant="ghost" size="sm" onClick={() => setBed(undefined)}>Change</Button>
              </div>
            ) : (
              <p className="mb-3 text-xs text-muted-foreground">Click an available (green) bed to allocate.</p>
            )}
            <BedPickerGrid selectedBedId={bed?.id} onSelect={(b) => setBed(b)} />
          </FormSection>

          {error && (
            <div className="rounded-md border border-allergy/40 bg-allergy/10 px-3 py-2 text-sm text-allergy">{error}</div>
          )}

          <div className="sticky bottom-0 -mx-8 flex items-center justify-end gap-2 border-t border-border bg-background/95 px-8 py-3 backdrop-blur">
            <Button variant="outline" asChild>
              <Link to="/ipd">Cancel</Link>
            </Button>
            <Button onClick={submit}>
              <BedDouble className="mr-1.5 h-4 w-4" /> Admit Patient
              <kbd className="ml-2 rounded bg-primary-foreground/20 px-1.5 py-0.5 text-[10px]">⌘↵</kbd>
            </Button>
          </div>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          {patient ? (
            <PatientSummaryRail patient={patient} />
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-card/60 p-6 text-center text-xs text-muted-foreground">
              Select a patient to preview allergies, chronic conditions and history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}export default AdmitPatient;
