import { useParams } from "react-router-dom";
import * as React from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Activity, Stethoscope, ClipboardList, FileSearch, Pill, ListChecks,
  ArrowLeft, Save, CheckCircle2, Plus, Sparkles, FlaskConical, X, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/forms/Field";
import { ChipInput } from "@/components/forms/ChipInput";
import { Combobox } from "@/components/forms/Combobox";
import { RxRowEditor } from "@/components/consultation/RxRowEditor";
import { PatientSummaryRail } from "@/components/consultation/PatientSummaryRail";
import { useAppointments } from "@/lib/appointments-store";
import { useConsultations } from "@/lib/consultations-store";
import { usePatients } from "@/lib/patients-store";
import { mockDiagnoses } from "@/lib/mock/diagnoses";
import { studyCatalog } from "@/lib/mock/radiology-catalog";
import { calcBmi, flagBp, flagSpo2, flagPulse, flagTemp, type VitalFlag } from "@/lib/vitals";
import type { DiagnosisEntry, RxItem, Vitals, AdvisedInvestigation } from "@/lib/types";
import { cn } from "@/lib/utils";
const SECTIONS = [
  { key: "vitals",          label: "Vitals",          icon: Activity },
  { key: "complaints",      label: "Complaints",      icon: ClipboardList },
  { key: "exam",            label: "Examination",     icon: Stethoscope },
  { key: "diagnosis",       label: "Diagnosis",       icon: FileSearch },
  { key: "rx",              label: "Prescription",    icon: Pill },
  { key: "investigations",  label: "Investigations",  icon: FlaskConical },
  { key: "plan",            label: "Plan",            icon: ListChecks },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

const FOLLOW_UP_PRESETS = [3, 7, 14, 30];

const diagnosisOptions = mockDiagnoses.map((d) => ({
  value: d.code,
  label: d.text,
  hint: d.code,
}));

function ConsultationWorkspace() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { getById, updateStatus } = useAppointments();
  const { addConsultation } = useConsultations();
  const { patients } = usePatients();

  const appt = getById(appointmentId);
  const patient = appt ? patients.find((p) => p.uid === appt.patientUid) : undefined;

  const [active, setActive] = React.useState<SectionKey>("vitals");
  const [vitals, setVitals] = React.useState<Vitals>({});
  const [complaints, setComplaints] = React.useState<string[]>(appt?.complaint ? [appt.complaint] : []);
  const [hpi, setHpi] = React.useState("");
  const [duration, setDuration] = React.useState("");
  const [exam, setExam] = React.useState({ general: "", cvs: "", rs: "", abdomen: "", cns: "" });
  const [diagnoses, setDiagnoses] = React.useState<DiagnosisEntry[]>([]);
  const [diagPick, setDiagPick] = React.useState<string | undefined>();
  const [rx, setRx] = React.useState<RxItem[]>([]);
  const [advice, setAdvice] = React.useState("");
  const [followUp, setFollowUp] = React.useState<number | undefined>();
  const [labOrders, setLabOrders] = React.useState("");
  const [investigations, setInvestigations] = React.useState<AdvisedInvestigation[]>([]);
  const [invSearch, setInvSearch] = React.useState("");

  const addInvestigation = (studyCode: string) => {
    const study = studyCatalog.find((s) => s.code === studyCode);
    if (!study) return;
    if (investigations.find((i) => i.studyCode === studyCode)) return; // no duplicates
    setInvestigations((prev) => [...prev, {
      id: `inv-${Date.now()}`,
      studyCode: study.code,
      studyName: study.name,
      modality: study.modality,
      tariff: study.tariff,
      urgent: false,
      status: "advised",
    }]);
    setInvSearch("");
  };

  const removeInvestigation = (id: string) => setInvestigations((prev) => prev.filter((i) => i.id !== id));
  const toggleUrgent = (id: string) => setInvestigations((prev) => prev.map((i) => i.id === id ? { ...i, urgent: !i.urgent } : i));

  const filteredStudies = studyCatalog.filter((s) =>
    s.name.toLowerCase().includes(invSearch.toLowerCase()) ||
    s.code.toLowerCase().includes(invSearch.toLowerCase()) ||
    s.modality.toLowerCase().includes(invSearch.toLowerCase())
  ).slice(0, 8);

  // Auto BMI
  React.useEffect(() => {
    setVitals((v) => ({ ...v, bmi: calcBmi(v.weight, v.height) }));
  }, [vitals.weight, vitals.height]);

  // Hotkeys
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.key === "Enter") { e.preventDefault(); complete(); return; }
      const n = Number(e.key);
      if (n >= 1 && n <= SECTIONS.length) {
        e.preventDefault();
        setActive(SECTIONS[n - 1].key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  if (!appt) {
    return (
      <div className="p-12">
        <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-8 text-center">
          <h2 className="text-lg font-bold">Appointment not found</h2>
          <p className="mt-2 text-sm text-muted-foreground">This appointment ID does not exist.</p>
          <Button asChild className="mt-4">
            <Link to="/appointments">Back to Queue</Link>
          </Button>
        </div>
      </div>
    );
  }

  const completion: Record<SectionKey, boolean> = {
    vitals: !!(vitals.bp || vitals.pulse || vitals.temp),
    complaints: complaints.length > 0,
    exam: !!(exam.general || exam.cvs || exam.rs || exam.abdomen || exam.cns),
    diagnosis: diagnoses.length > 0,
    rx: rx.length > 0,
    plan: !!(advice || followUp != null),
  };

  const currentIndex = SECTIONS.findIndex((s) => s.key === active);

  const goNext = () => {
    if (currentIndex < SECTIONS.length - 1) setActive(SECTIONS[currentIndex + 1].key);
  };
  const goPrev = () => {
    if (currentIndex > 0) setActive(SECTIONS[currentIndex - 1].key);
  };

  const allergyHits = (drugName?: string) => {
    if (!drugName || !patient) return false;
    return patient.allergies.some((a) => drugName.toLowerCase().includes(a.toLowerCase().split(" ")[0]));
  };

  const addDiagnosis = (code: string) => {
    const d = mockDiagnoses.find((x) => x.code === code);
    if (!d) return;
    if (diagnoses.find((x) => x.code === code)) return;
    setDiagnoses((prev) => [
      ...prev,
      { code: d.code, text: d.text, primary: prev.length === 0 },
    ]);
    setDiagPick(undefined);
  };

  const removeDiagnosis = (code: string) => {
    setDiagnoses((prev) => {
      const next = prev.filter((d) => d.code !== code);
      if (next.length && !next.some((d) => d.primary)) next[0].primary = true;
      return next;
    });
  };

  const setPrimary = (code: string) => {
    setDiagnoses((prev) => prev.map((d) => ({ ...d, primary: d.code === code })));
  };

  const addRx = () => {
    setRx((prev) => [...prev, { id: `rx${Date.now()}-${prev.length}`, drug: "", route: "PO" }]);
    setActive("rx");
  };

  const complete = () => {
    if (diagnoses.length === 0) {
      toast.error("Add at least one diagnosis");
      setActive("diagnosis");
      return;
    }
    if (complaints.length === 0) {
      toast.error("Add chief complaint");
      setActive("complaints");
      return;
    }
    addConsultation({
      appointmentId: appt.id,
      patientUid: appt.patientUid ?? "",
      patientName: appt.patientName,
      doctor: appt.doctor,
      vitals,
      chiefComplaints: complaints,
      hpi,
      duration,
      examGeneral: exam.general,
      examCvs: exam.cvs,
      examRs: exam.rs,
      examAbdomen: exam.abdomen,
      examCns: exam.cns,
      diagnoses,
      rx: rx.filter((r) => r.drug),
      advice,
      followUpDays: followUp,
      labOrders,
      advisedInvestigations: investigations,
    });
    updateStatus(appt.id, "completed");
    toast.success("Visit completed", { description: "Prescription generated." });
    navigate(`/consultations/${appt.id}/prescription`);
  };

  const flag = (f: VitalFlag) =>
    f.level === "alert" ? "border-allergy/50 bg-allergy/5" :
    f.level === "watch" ? "border-condition/50 bg-condition/5" : "";

  const bpFlag = flagBp(vitals.bp);
  const pulseFlag = flagPulse(vitals.pulse);
  const spoFlag = flagSpo2(vitals.spo2);
  const tempFlag = flagTemp(vitals.temp);

  return (
    <div className="pb-28">
      <div className="border-b border-border bg-card px-8 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Consultation Workspace
            </p>
            <h1 className="mt-1 text-xl font-bold">{appt.patientName}</h1>
            <div className="mt-1 text-xs text-muted-foreground">
              {appt.doctor} · {appt.department} · {appt.room} · {appt.date} · {appt.time}
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link to="/appointments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Queue
            </Link>
          </Button>
        </div>
        {/* Progress Bar */}
        <div className="mt-4 flex items-center gap-1">
          {SECTIONS.map((s, i) => {
            const done = completion[s.key];
            const isActive = active === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setActive(s.key)}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <div className={cn(
                  "h-1.5 w-full rounded-full transition-all",
                  done ? "bg-status-ok" : isActive ? "bg-primary" : "bg-border"
                )} />
                <span className={cn(
                  "text-[10px] font-medium",
                  isActive ? "text-primary" : done ? "text-status-ok" : "text-muted-foreground"
                )}>
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 p-8 xl:grid-cols-[200px_minmax(0,1fr)_300px]">
        {/* Section nav */}
        <nav className="space-y-1">
          {SECTIONS.map((s, i) => {
            const Icon = s.icon;
            const done = completion[s.key];
            const isActive = active === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setActive(s.key)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                  isActive
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border hover:bg-accent/30",
                )}
              >
                <span className={cn(
                  "grid size-7 shrink-0 place-items-center rounded border text-[10px] font-bold tabular-nums",
                  done ? "border-status-ok/40 bg-status-ok/10 text-status-ok" : "border-border bg-secondary text-muted-foreground",
                )}>
                  {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : `0${i + 1}`}
                </span>
                <Icon className="h-3.5 w-3.5" />
                <span className="flex-1">{s.label}</span>
                <kbd className="rounded border border-border bg-background px-1 text-[9px] text-muted-foreground">
                  {i + 1}
                </kbd>
              </button>
            );
          })}
          <div className="mt-4 rounded-md border border-border bg-card p-3 text-[10px] text-muted-foreground">
            <div className="font-bold uppercase tracking-widest">Hotkeys</div>
            <div className="mt-1.5 space-y-0.5">
              <div><kbd className="rounded bg-secondary px-1">⌘1–6</kbd> jump section</div>
              <div><kbd className="rounded bg-secondary px-1">⌘↵</kbd> complete visit</div>
            </div>
          </div>
        </nav>

        {/* Active section */}
        <div className="space-y-4">
          {active === "vitals" && (
            <Section title="01 · Vitals" hint="Abnormal values are flagged.">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Field label="BP (mmHg)" hint={bpFlag.note}>
                  <Input
                    placeholder="120/80"
                    value={vitals.bp ?? ""}
                    onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                    className={flag(bpFlag)}
                  />
                </Field>
                <Field label="Pulse (bpm)" hint={pulseFlag.note}>
                  <Input
                    type="number" min={20} max={220}
                    value={vitals.pulse ?? ""}
                    onChange={(e) => setVitals({ ...vitals, pulse: e.target.value ? Number(e.target.value) : undefined })}
                    className={flag(pulseFlag)}
                  />
                </Field>
                <Field label="Temp (°F)" hint={tempFlag.note}>
                  <Input
                    type="number" step="0.1" min={90} max={110}
                    placeholder="98.6"
                    value={vitals.temp ?? ""}
                    onChange={(e) => setVitals({ ...vitals, temp: e.target.value ? Number(e.target.value) : undefined })}
                    className={flag(tempFlag)}
                  />
                </Field>
                <Field label="SpO₂ (%)" hint={spoFlag.note}>
                  <Input
                    type="number" min={50} max={100}
                    value={vitals.spo2 ?? ""}
                    onChange={(e) => setVitals({ ...vitals, spo2: e.target.value ? Number(e.target.value) : undefined })}
                    className={flag(spoFlag)}
                  />
                </Field>
                <Field label="Resp (per min)">
                  <Input
                    type="number" min={5} max={60}
                    value={vitals.respRate ?? ""}
                    onChange={(e) => setVitals({ ...vitals, respRate: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </Field>
                <Field label="Weight (kg)">
                  <Input
                    type="number" step="0.1" min={1}
                    value={vitals.weight ?? ""}
                    onChange={(e) => setVitals({ ...vitals, weight: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </Field>
                <Field label="Height (cm)">
                  <Input
                    type="number" min={30} max={250}
                    value={vitals.height ?? ""}
                    onChange={(e) => setVitals({ ...vitals, height: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </Field>
                <Field label="BMI" hint="Auto-calculated">
                  <Input value={vitals.bmi ?? ""} readOnly className="bg-secondary/40 font-mono" />
                </Field>
              </div>
            </Section>
          )}

          {active === "complaints" && (
            <Section title="02 · Chief complaints & HPI">
              <Field label="Chief complaints" required>
                <ChipInput
                  value={complaints}
                  onChange={setComplaints}
                  placeholder="Type complaint and press Enter"
                />
              </Field>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <Field label="Duration" className="md:col-span-1">
                  <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 3 days" />
                </Field>
                <Field label="History of presenting illness" className="md:col-span-2">
                  <Textarea value={hpi} onChange={(e) => setHpi(e.target.value)} rows={4} placeholder="Onset, character, aggravating/relieving factors…" />
                </Field>
              </div>
            </Section>
          )}

          {active === "exam" && (
            <Section title="03 · Examination" hint="Quick-fill 'NAD' for unremarkable systems.">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {([
                  ["general", "General"],
                  ["cvs", "CVS"],
                  ["rs", "Respiratory"],
                  ["abdomen", "Abdomen"],
                  ["cns", "CNS"],
                ] as const).map(([key, label]) => (
                  <Field key={key} label={label}>
                    <div className="space-y-1">
                      <Textarea
                        value={exam[key]}
                        onChange={(e) => setExam({ ...exam, [key]: e.target.value })}
                        rows={2}
                      />
                      <button
                        type="button"
                        onClick={() => setExam({ ...exam, [key]: "NAD" })}
                        className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary"
                      >
                        Quick fill: NAD
                      </button>
                    </div>
                  </Field>
                ))}
              </div>
            </Section>
          )}

          {active === "diagnosis" && (
            <Section title="04 · Diagnosis" hint="Add ICD-coded diagnoses; first added is the primary.">
              <Field label="Add diagnosis" required={diagnoses.length === 0}>
                <Combobox
                  options={diagnosisOptions}
                  value={diagPick}
                  onChange={(v) => addDiagnosis(v)}
                  placeholder="Search ICD-10…"
                  emptyText="No matching diagnosis"
                />
              </Field>
              <div className="mt-4 space-y-2">
                {diagnoses.length === 0 ? (
                  <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    No diagnoses added yet.
                  </div>
                ) : diagnoses.map((d) => (
                  <div key={d.code} className="flex items-center gap-3 rounded-md border border-border bg-background p-3">
                    <span className="font-mono text-[11px] font-bold text-primary">{d.code}</span>
                    <span className="flex-1 text-sm">{d.text}</span>
                    <button
                      onClick={() => setPrimary(d.code)}
                      className={cn(
                        "rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors",
                        d.primary
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary",
                      )}
                    >
                      {d.primary ? "Primary" : "Set primary"}
                    </button>
                    <button
                      onClick={() => removeDiagnosis(d.code)}
                      className="text-xs text-muted-foreground hover:text-allergy"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {active === "rx" && (
            <Section
              title="05 · Prescription"
              hint="Allergy conflicts highlight in red."
              actions={
                <Button size="sm" variant="outline" onClick={addRx}>
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add Drug
                </Button>
              }
            >
              <div className="space-y-3">
                {rx.length === 0 ? (
                  <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    No drugs prescribed yet. <button onClick={addRx} className="font-semibold text-primary">Add the first one</button>.
                  </div>
                ) : rx.map((item, i) => (
                  <RxRowEditor
                    key={item.id}
                    index={i}
                    item={item}
                    onChange={(next) => setRx((prev) => prev.map((p) => (p.id === item.id ? next : p)))}
                    onRemove={() => setRx((prev) => prev.filter((p) => p.id !== item.id))}
                    allergyHit={allergyHits(item.drug)}
                  />
                ))}
              </div>
            </Section>
          )}

          {active === "investigations" && (
            <Section title="06 · Advised Investigations"
              hint="Add radiology studies, scans, or labs to advise. Patient takes this to the billing counter to pay, then to radiology.">
              <div className="space-y-4">
                {/* Search and add */}
                <div className="relative">
                  <FlaskConical className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={invSearch}
                    onChange={(e) => setInvSearch(e.target.value)}
                    placeholder="Search study... e.g. CT Head, MRI Knee, USG Abdomen"
                    className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm outline-none focus:border-primary"
                  />
                  {invSearch && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-card shadow-lg">
                      {filteredStudies.length === 0 && (
                        <div className="px-4 py-3 text-sm text-muted-foreground">No studies found</div>
                      )}
                      {filteredStudies.map((s) => (
                        <button key={s.code} onClick={() => addInvestigation(s.code)}
                          className="flex w-full items-center justify-between px-4 py-2.5 text-sm hover:bg-accent/50 transition-colors">
                          <div className="text-left">
                            <div className="font-medium">{s.name}</div>
                            <div className="text-[11px] uppercase text-muted-foreground">{s.modality} · {s.bodyPart}</div>
                          </div>
                          <span className="text-[10px] uppercase font-semibold text-muted-foreground">{s.modality}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Added investigations */}
                {investigations.length === 0 && (
                  <div className="rounded-lg border-2 border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                    No investigations advised yet. Search above to add.
                  </div>
                )}
                {investigations.map((inv) => (
                  <div key={inv.id} className={cn(
                    "flex items-center gap-3 rounded-lg border p-3",
                    inv.urgent ? "border-allergy/40 bg-allergy/5" : "border-border bg-card"
                  )}>
                    <FlaskConical className={cn("h-4 w-4 shrink-0", inv.urgent ? "text-allergy" : "text-muted-foreground")} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{inv.studyName}</div>
                      <div className="text-[11px] uppercase text-muted-foreground">{inv.modality} · {inv.studyCode}</div>
                    </div>

                    <button onClick={() => toggleUrgent(inv.id)}
                      className={cn("rounded px-2 py-1 text-[10px] font-bold border transition-colors",
                        inv.urgent ? "border-allergy/40 bg-allergy/10 text-allergy" : "border-border text-muted-foreground hover:border-allergy hover:text-allergy"
                      )}>
                      {inv.urgent ? "URGENT" : "Routine"}
                    </button>
                    <button onClick={() => removeInvestigation(inv.id)}
                      className="rounded p-1 text-muted-foreground hover:text-allergy transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}


              </div>
            </Section>
          )}

          {active === "plan" && (
            <Section title="07 · Plan & Follow-up">
              <div className="space-y-4">
                <Field label="Advice / lifestyle">
                  <Textarea
                    value={advice}
                    onChange={(e) => setAdvice(e.target.value)}
                    rows={3}
                    placeholder="Hydration, diet, activity, red flags…"
                  />
                </Field>
                <Field label="Follow-up in (days)">
                  <div className="flex items-center gap-1.5">
                    {FOLLOW_UP_PRESETS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setFollowUp(d)}
                        className={cn(
                          "rounded border px-3 py-1.5 text-xs font-semibold transition-colors",
                          followUp === d
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-primary",
                        )}
                      >
                        {d}d
                      </button>
                    ))}
                    <Input
                      type="number"
                      placeholder="Custom"
                      value={followUp != null && !FOLLOW_UP_PRESETS.includes(followUp) ? followUp : ""}
                      onChange={(e) => setFollowUp(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-24"
                    />
                    {followUp != null && (
                      <button onClick={() => setFollowUp(undefined)} className="text-[11px] text-muted-foreground hover:text-allergy">
                        Clear
                      </button>
                    )}
                  </div>
                </Field>
                <Field label="Order labs / imaging" hint="Free text; queued for next module.">
                  <Textarea
                    value={labOrders}
                    onChange={(e) => setLabOrders(e.target.value)}
                    rows={2}
                    placeholder="e.g. CBC, HbA1c, Chest X-ray PA"
                  />
                </Field>
              </div>
            </Section>
          )}
        </div>

        {/* Right rail */}
        <div className="space-y-4 xl:sticky xl:top-6 xl:h-max">
          {patient && <PatientSummaryRail patient={patient} />}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <Sparkles className="h-3 w-3" /> Visit Summary
            </div>
            <dl className="mt-3 space-y-3 text-xs">
              <div>
                <dt className="text-[10px] uppercase text-muted-foreground">Diagnoses</dt>
                <dd className="mt-1 flex flex-wrap gap-1">
                  {diagnoses.length === 0 ? <span className="text-muted-foreground">—</span> :
                    diagnoses.map((d) => (
                      <span key={d.code} className={cn(
                        "rounded border px-1.5 py-0.5 font-mono text-[10px]",
                        d.primary ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary",
                      )}>
                        {d.code}
                      </span>
                    ))
                  }
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[10px] uppercase text-muted-foreground">Rx items</dt>
                <dd className="font-mono font-bold tabular-nums">{rx.filter((r) => r.drug).length}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[10px] uppercase text-muted-foreground">Follow-up</dt>
                <dd className="font-mono font-bold tabular-nums">{followUp ? `${followUp}d` : "—"}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur">
        <div className="flex items-center justify-between gap-2 px-8 py-3">
          <div className="text-[11px] text-muted-foreground">
            Patient: <span className="font-semibold text-foreground">{appt.patientName}</span>
            <span className="ml-3 font-mono">{appt.patientUid}</span>
          </div>
          <div className="flex gap-2">
            {currentIndex > 0 && (
              <Button variant="outline" onClick={goPrev}>
                ← {SECTIONS[currentIndex - 1].label}
              </Button>
            )}
            {currentIndex < SECTIONS.length - 1 ? (
              <Button onClick={goNext}>
                Next: {SECTIONS[currentIndex + 1].label} →
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => toast.info("Draft saved", { description: "Drafts are session-only." })}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Draft
                </Button>
                <Button onClick={complete} className="bg-status-ok hover:bg-status-ok/90">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Complete Visit ✓
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title, hint, actions, children,
}: { title: string; hint?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest">{title}</h2>
          {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
        </div>
        {actions}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}
export default ConsultationWorkspace;
