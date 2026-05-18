import * as React from "react";
import { useNavigate, useSearch } from "react-router-dom";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/forms/Field";
import { Combobox } from "@/components/forms/Combobox";
import { usePatients } from "@/lib/patients-store";
import { useRadiology } from "@/lib/radiology-store";
import { useAuth } from "@/lib/auth-context";
import { studyCatalog, modalityLabels } from "@/lib/mock/radiology-catalog";
import type { Modality, RadiologyPriority } from "@/lib/types";
import { newOrderSchema, pregnancyRule } from "@/lib/validation/radiology";
import { toast } from "sonner";
import { Save, ArrowRight, AlertTriangle } from "lucide-react";
    patientUid: typeof s.patientUid === "string" ? s.patientUid : undefined,
    source: (s.source === "opd" || s.source === "ipd" || s.source === "walkin" ? s.source : undefined) as
      | "opd" | "ipd" | "walkin" | undefined,
    sourceId: typeof s.sourceId === "string" ? s.sourceId : undefined,
  }),
function NewRadiologyOrder() {
  const search = useSearch({ from: "/_authenticated/radiology/orders/new" });
  const navigate = useNavigate();
  const { patients } = usePatients();
  const { addOrder } = useRadiology();
  const { user } = useAuth();

  const [patientUid, setPatientUid] = React.useState<string | undefined>(search.patientUid);
  const [modality, setModality] = React.useState<Modality>("xray");
  const [studyCode, setStudyCode] = React.useState<string | undefined>(undefined);
  const [indication, setIndication] = React.useState("");
  const [priority, setPriority] = React.useState<RadiologyPriority>("routine");
  const [contrast, setContrast] = React.useState(false);
  const [pregnancy, setPregnancy] = React.useState(false);
  const [scheduledAt, setScheduledAt] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const patient = patients.find((p) => p.uid === patientUid);
  const studyOptions = studyCatalog.filter((s) => s.modality === modality);
  const study = studyCatalog.find((s) => s.code === studyCode);

  const ageYears = patient?.dob ? Math.floor((Date.now() - new Date(patient.dob).getTime()) / (365.25 * 86400_000)) : undefined;
  const needsPregnancy = pregnancyRule({ sex: patient?.sex, ageYears, contrast });

  React.useEffect(() => { setStudyCode(undefined); }, [modality]);

  function submit(addAnother = false) {
    const errs: Record<string, string> = {};
    if (!patient) errs.patient = "Select a patient";
    if (!study) errs.study = "Pick a study";
    if (indication.trim().length < 8) errs.indication = "At least 8 characters";
    if (needsPregnancy && !pregnancy) errs.pregnancy = "Confirm pregnancy status before contrast";

    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error("Please fix the highlighted fields");
      return;
    }
    if (!patient || !study) return;

    const parsed = newOrderSchema.safeParse({
      patientUid: patient.uid,
      patientName: patient.name,
      modality: study.modality,
      studyCode: study.code,
      studyName: study.name,
      bodyPart: study.bodyPart,
      clinicalIndication: indication,
      priority,
      contrast,
      pregnancy: needsPregnancy ? pregnancy : undefined,
      orderedBy: user?.name ?? "Doctor",
      scheduledAt: scheduledAt || undefined,
      sourceType: search.source ?? "opd",
      sourceId: search.sourceId,
    });
    if (!parsed.success) {
      toast.error("Validation failed");
      return;
    }

    const order = addOrder(parsed.data);
    toast.success(`Order ${order.orderNo} created`);

    if (addAnother) {
      setStudyCode(undefined);
      setIndication("");
      setPriority("routine");
      setContrast(false);
      setPregnancy(false);
      setScheduledAt("");
      setErrors({});
    } else {
      navigate("/radiology/worklist");
    }
  }

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        submit(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="space-y-6 p-8">
      <PageHeader eyebrow="Radiology" title="New imaging order" description="Order an imaging study for a patient." />

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4 rounded-lg border border-border bg-card p-5">
          <Field label="Patient" required error={errors.patient}>
            <Combobox
              options={patients.map((p) => ({ value: p.uid, label: p.name, hint: p.uid }))}
              value={patientUid}
              onChange={(v) => setPatientUid(v)}
              placeholder="Search patient by name or UID…"
              emptyText="No patients found"
            />
          </Field>
          {patient && (
            <div className="rounded-md border border-border bg-background p-3 text-xs">
              <div className="font-medium">{patient.name} · <span className="font-mono text-[11px] text-muted-foreground">{patient.uid}</span></div>
              <div className="text-muted-foreground">{patient.sex} · {patient.age}{patient.bloodGroup ? ` · ${patient.bloodGroup}` : ""}</div>
              {patient.allergies.length > 0 && (
                <div className="mt-1 flex items-center gap-1 text-allergy">
                  <AlertTriangle className="h-3 w-3" /> Allergies: {patient.allergies.join(", ")}
                </div>
              )}
            </div>
          )}

          <Field label="Clinical indication" required error={errors.indication} hint="What are you ruling in/out? Include duration and key symptoms.">
            <textarea
              value={indication}
              onChange={(e) => setIndication(e.target.value)}
              rows={4}
              className="rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="e.g. Chronic cough x 3 weeks, smoker, R/o LRTI / mass."
            />
          </Field>

          {search.source && (
            <div className="rounded border border-status-info/30 bg-status-info/10 px-3 py-2 text-[11px] text-status-info">
              Linked to {search.source.toUpperCase()} encounter {search.sourceId ?? ""}
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-lg border border-border bg-card p-5">
          <Field label="Modality" required>
            <select
              value={modality}
              onChange={(e) => setModality(e.target.value as Modality)}
              className="h-9 rounded-md border border-input bg-transparent px-2 text-sm shadow-sm"
            >
              {(Object.keys(modalityLabels) as Modality[]).map((m) => (
                <option key={m} value={m}>{modalityLabels[m]}</option>
              ))}
            </select>
          </Field>

          <Field label="Study" required error={errors.study}>
            <Combobox
              options={studyOptions.map((s) => ({ value: s.code, label: s.name, hint: `₹${s.tariff}` }))}
              value={studyCode}
              onChange={(v) => setStudyCode(v)}
              placeholder="Pick a study"
              emptyText="No studies for this modality"
            />
          </Field>

          {study && (
            <div className="rounded-md border border-border bg-background p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium">{study.bodyPart}</span>
                <span className="font-mono text-[11px] text-muted-foreground">Target TAT {study.targetTatMin}m</span>
              </div>
            </div>
          )}

          <Field label="Priority" required>
            <div className="flex gap-2">
              {(["routine", "urgent", "stat"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 rounded-md border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${priority === p ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-accent/40"}`}
                >
                  {p === "stat" ? "STAT" : p}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Contrast study" hint="Switch on if IV contrast is required.">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={contrast} onChange={(e) => setContrast(e.target.checked)} className="h-4 w-4 accent-primary" />
              <span>Administer IV contrast</span>
            </label>
          </Field>

          {needsPregnancy && (
            <Field label="Pregnancy status" required error={errors.pregnancy}>
              <div className="rounded-md border border-condition/40 bg-condition/10 p-3 text-xs text-condition-foreground">
                <div className="mb-2 flex items-center gap-1 font-semibold"><AlertTriangle className="h-3.5 w-3.5" /> Female of reproductive age + contrast</div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={pregnancy} onChange={(e) => setPregnancy(e.target.checked)} className="h-4 w-4 accent-allergy" />
                  <span>Pregnancy ruled out / patient consent obtained</span>
                </label>
              </div>
            </Field>
          )}

          <Field label="Schedule (optional)" hint="Leave blank to leave as 'ordered'.">
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
            />
          </Field>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => submit(true)}>
          <Save className="mr-2 h-4 w-4" /> Save & add another
        </Button>
        <Button onClick={() => submit(false)}>
          Create order <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}export default NewRadiologyOrder;
