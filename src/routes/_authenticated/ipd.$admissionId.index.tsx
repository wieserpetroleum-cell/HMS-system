import { useParams } from "react-router-dom";
import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Activity, ClipboardList, Stethoscope, Pill, Droplet, FileText,
  ArrowRightLeft, FilePlus2, FlaskConical, LogOut, Plus, BedDouble, Sparkles,
  AlertCircle, X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PatientSummaryRail } from "@/components/consultation/PatientSummaryRail";
import { StatusPill } from "@/components/ipd/StatusPill";
import { MarRow } from "@/components/ipd/MarRow";
import { SectionTimeline } from "@/components/ipd/SectionTimeline";
import { VitalsSparkline } from "@/components/ipd/VitalsSparkline";
import { useAdmissions } from "@/lib/admissions-store";
import { usePatients } from "@/lib/patients-store";
import { useAuth } from "@/lib/auth-context";
import { useInvoices } from "@/lib/invoices-store";
import type { NursingNoteCategory } from "@/lib/types";
import { cn } from "@/lib/utils";
function dayOfStay(admittedAt: string) {
  const ms = Date.now() - new Date(admittedAt).getTime();
  return Math.max(1, Math.floor(ms / 86400000) + 1);
}

function WardChart() {
  const { admissionId } = useParams();
  const { getById, vitals, notes, rounds, mar, io, addVital, addNote, addRound, markMar, addIo } = useAdmissions();
  const { getPatient } = usePatients();
  const { user } = useAuth();
  const { invoices } = useInvoices();
  const navigate = useNavigate();
  const adm = getById(admissionId);
  const [tab, setTab] = React.useState("overview");
  const [showBillingAlert, setShowBillingAlert] = React.useState(false);

  // Calculate pending bills for this patient
  const pendingBills = React.useMemo(() => {
    if (!adm) return [];
    return invoices.filter(
      (inv) => inv.patientUid === adm.patientUid &&
      (inv.status === "pending" || inv.status === "partial" || inv.status === "draft" || inv.status === "overdue") &&
      inv.balance > 0
    );
  }, [invoices, adm]);

  const totalPending = pendingBills.reduce((sum, inv) => sum + inv.balance, 0);
  const hasPendingBills = pendingBills.length > 0;

  const handleDischargeClick = (e: React.MouseEvent) => {
    if (hasPendingBills) {
      e.preventDefault();
      setShowBillingAlert(true);
    }
  };

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const map: Record<string, string> = { "1": "overview", "2": "vitals", "3": "notes", "4": "rounds", "5": "mar", "6": "io" };
      if (map[e.key]) {
        e.preventDefault();
        setTab(map[e.key]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!adm) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
        <p className="text-sm text-muted-foreground">Admission {admissionId} not found.</p>
        <Button variant="outline" onClick={() => navigate("/ipd")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to floor view
        </Button>
      </div>
    );
  }

  const patient = getPatient(adm.patientUid);
  const admVitals = vitals.filter((v) => v.admissionId === adm.id);
  const admNotes = notes.filter((n) => n.admissionId === adm.id);
  const admRounds = rounds.filter((r) => r.admissionId === adm.id);
  const admMar = mar.filter((m) => m.admissionId === adm.id);
  const admIo = io.filter((i) => i.admissionId === adm.id);

  const latestVital = admVitals[0];
  const userName = user?.name ?? "Clinician";

  const intakeMl = admIo.filter((i) => i.type === "intake").reduce((s, i) => s + i.volumeMl, 0);
  const outputMl = admIo.filter((i) => i.type === "output").reduce((s, i) => s + i.volumeMl, 0);
  const balance = intakeMl - outputMl;

  return (
    <div className="space-y-4 p-6">
      {/* Pending Bills Alert Banner */}
      {hasPendingBills && showBillingAlert && (
        <div className="flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Pending Payment Required Before Discharge</p>
              <p className="text-xs text-amber-700">
                {pendingBills.length} unpaid bill(s) totalling ₹{totalPending.toLocaleString('en-IN')}. Please settle all bills before discharging the patient.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowBillingAlert(false)}
            className="ml-4 rounded p-1 text-amber-600 hover:bg-amber-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Link
          to="/ipd"
          className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Floor View
        </Link>
        <div className="flex items-center gap-2">
          {/* Pending Payment Tag */}
          {hasPendingBills && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
              <AlertCircle className="h-3 w-3" />
              ₹{totalPending.toLocaleString('en-IN')} Pending
            </span>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link to={`/ipd/${admissionId}/transfer`}>
              <ArrowRightLeft className="mr-1.5 h-3.5 w-3.5" /> Transfer
            </Link>
          </Button>
          <Button
            size="sm"
            variant={hasPendingBills ? "outline" : "default"}
            className={hasPendingBills ? "border-amber-300 text-amber-700 hover:bg-amber-50" : ""}
            asChild={!hasPendingBills}
            onClick={handleDischargeClick}
          >
            {hasPendingBills ? (
              <span className="flex items-center">
                <LogOut className="mr-1.5 h-3.5 w-3.5" /> Discharge
              </span>
            ) : (
              <Link to={`/ipd/${admissionId}/discharge`}>
                <LogOut className="mr-1.5 h-3.5 w-3.5" /> Discharge
              </Link>
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-5">
        <div className="grid size-14 place-items-center rounded-md bg-primary/10 text-primary">
          <BedDouble className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            {adm.admissionNo}
          </p>
          <h1 className="text-xl font-bold tracking-tight">
            {adm.patientName}
            <span className="ml-2 font-mono text-sm font-normal text-muted-foreground">{adm.patientUid}</span>
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono font-semibold text-foreground">{adm.bedNumber}</span>
            <span>· {adm.ward}</span>
            <span>· Day {dayOfStay(adm.admittedAt)}</span>
            <span>· {adm.primaryDoctor} ({adm.department})</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <StatusPill tone="info">Diet · {adm.diet}</StatusPill>
          {adm.isolation && <StatusPill tone="danger">Isolation</StatusPill>}
          <StatusPill tone="ok">Active</StatusPill>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          {patient && <PatientSummaryRail patient={patient} />}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Quick Actions</div>
            <div className="space-y-1.5">
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setTab("vitals")}>
                <Activity className="mr-2 h-4 w-4" /> Record Vitals
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setTab("rounds")}>
                <Stethoscope className="mr-2 h-4 w-4" /> New Round
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => toast("Lab orders ship in Module 7")}>
                <FlaskConical className="mr-2 h-4 w-4" /> Order Investigation
              </Button>
            </div>
          </div>
        </div>

        <div>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="flex w-full justify-start">
              <TabsTrigger value="overview"><Sparkles className="mr-1.5 h-3.5 w-3.5" />Overview</TabsTrigger>
              <TabsTrigger value="vitals"><Activity className="mr-1.5 h-3.5 w-3.5" />Vitals</TabsTrigger>
              <TabsTrigger value="notes"><ClipboardList className="mr-1.5 h-3.5 w-3.5" />Nursing</TabsTrigger>
              <TabsTrigger value="rounds"><Stethoscope className="mr-1.5 h-3.5 w-3.5" />Rounds</TabsTrigger>
              <TabsTrigger value="mar"><Pill className="mr-1.5 h-3.5 w-3.5" />MAR</TabsTrigger>
              <TabsTrigger value="io"><Droplet className="mr-1.5 h-3.5 w-3.5" />I/O</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  { label: "BP", value: latestVital?.bp ?? "—" },
                  { label: "Pulse", value: latestVital?.pulse ? `${latestVital.pulse} bpm` : "—" },
                  { label: "Temp", value: latestVital?.temp ? `${latestVital.temp}°C` : "—" },
                  { label: "SpO₂", value: latestVital?.spo2 ? `${latestVital.spo2}%` : "—" },
                ].map((v) => (
                  <div key={v.label} className="rounded-md border border-border bg-card p-3">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{v.label}</div>
                    <div className="mt-1 text-lg font-semibold tabular-nums">{v.value}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card title="Admission">
                  <Row k="Reason" v={adm.reason} />
                  <Row k="Provisional Dx" v={adm.provisionalDiagnosis ? `${adm.provisionalDiagnosis.code} · ${adm.provisionalDiagnosis.text}` : "—"} />
                  <Row k="Admitted" v={new Date(adm.admittedAt).toLocaleString()} />
                </Card>
                <Card title="Today">
                  <Row k="MAR doses given" v={admMar.flatMap((m) => m.schedule).filter((s) => s.status === "given").length.toString()} />
                  <Row k="Rounds" v={admRounds.length.toString()} />
                  <Row k="Vital readings" v={admVitals.length.toString()} />
                  <Row k="I/O balance" v={`${balance >= 0 ? "+" : ""}${balance} mL`} />
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="vitals" className="mt-4 space-y-4">
              <VitalAdder onAdd={(v) => addVital(adm.id, { ...v, recordedAt: new Date().toISOString(), recordedBy: userName })} />
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                {(["bp", "pulse", "temp", "spo2", "respRate"] as const).map((k) => {
                  const series = admVitals
                    .slice(0, 8)
                    .reverse()
                    .map((v) => (k === "bp" ? Number(v.bp?.split("/")[0] ?? 0) : (v[k] as number | undefined) ?? 0))
                    .filter((n) => n > 0);
                  const latest = latestVital
                    ? k === "bp"
                      ? latestVital.bp ?? "—"
                      : ((latestVital[k] as number | undefined)?.toString() ?? "—")
                    : "—";
                  return (
                    <div key={k} className="rounded-md border border-border bg-card p-3">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{k}</div>
                      <div className="mt-1 text-lg font-semibold tabular-nums">{latest}</div>
                      <div className="mt-1 text-primary"><VitalsSparkline values={series} /></div>
                    </div>
                  );
                })}
              </div>
              <div className="rounded-lg border border-border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>BP</TableHead>
                      <TableHead>Pulse</TableHead>
                      <TableHead>Temp</TableHead>
                      <TableHead>SpO₂</TableHead>
                      <TableHead>RR</TableHead>
                      <TableHead>By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admVitals.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="font-mono text-xs">{new Date(v.recordedAt).toLocaleString([], { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}</TableCell>
                        <TableCell className="text-xs tabular-nums">{v.bp ?? "—"}</TableCell>
                        <TableCell className="text-xs tabular-nums">{v.pulse ?? "—"}</TableCell>
                        <TableCell className="text-xs tabular-nums">{v.temp ?? "—"}</TableCell>
                        <TableCell className="text-xs tabular-nums">{v.spo2 ?? "—"}</TableCell>
                        <TableCell className="text-xs tabular-nums">{v.respRate ?? "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{v.recordedBy}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-4 space-y-4">
              <NoteComposer onAdd={(category, text) => addNote(adm.id, { at: new Date().toISOString(), by: userName, category, text })} />
              <SectionTimeline
                items={admNotes.map((n) => ({
                  id: n.id, at: n.at, by: n.by, label: n.category, tone: noteTone(n.category), body: n.text,
                }))}
              />
            </TabsContent>

            <TabsContent value="rounds" className="mt-4 space-y-4">
              <RoundComposer
                doctor={adm.primaryDoctor}
                onAdd={(r) => addRound(adm.id, { at: new Date().toISOString(), doctor: adm.primaryDoctor, ...r })}
              />
              <SectionTimeline
                items={admRounds.map((r) => ({
                  id: r.id, at: r.at, by: r.doctor, label: "SOAP", tone: "primary",
                  body: (
                    <div className="grid grid-cols-1 gap-1 text-sm md:grid-cols-2">
                      <div><b className="text-xs text-muted-foreground">S:</b> {r.subjective}</div>
                      <div><b className="text-xs text-muted-foreground">O:</b> {r.objective}</div>
                      <div><b className="text-xs text-muted-foreground">A:</b> {r.assessment}</div>
                      <div><b className="text-xs text-muted-foreground">P:</b> {r.plan}</div>
                    </div>
                  ),
                }))}
              />
            </TabsContent>

            <TabsContent value="mar" className="mt-4 space-y-3">
              {admMar.length === 0 ? (
                <p className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">No medications charted.</p>
              ) : (
                admMar.map((m) => (
                  <MarRow key={m.id} entry={m} onMark={(idx, status) => { markMar(m.id, idx, status, userName); toast.success(`Marked ${status}`); }} />
                ))
              )}
            </TabsContent>

            <TabsContent value="io" className="mt-4 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Intake", value: `${intakeMl} mL`, tone: "info" as const },
                  { label: "Output", value: `${outputMl} mL`, tone: "warn" as const },
                  { label: "Balance", value: `${balance >= 0 ? "+" : ""}${balance} mL`, tone: balance >= 0 ? "ok" as const : "danger" as const },
                ].map((s) => (
                  <div key={s.label} className="rounded-md border border-border bg-card p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{s.label}</div>
                      <StatusPill tone={s.tone}>24h</StatusPill>
                    </div>
                    <div className="mt-1 text-lg font-semibold tabular-nums">{s.value}</div>
                  </div>
                ))}
              </div>
              <IoAdder onAdd={(entry) => addIo(adm.id, { at: new Date().toISOString(), by: userName, ...entry })} />
              <div className="rounded-lg border border-border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right">Volume</TableHead>
                      <TableHead>By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admIo.map((i) => (
                      <TableRow key={i.id}>
                        <TableCell className="font-mono text-xs">{new Date(i.at).toLocaleString([], { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}</TableCell>
                        <TableCell><StatusPill tone={i.type === "intake" ? "info" : "warn"}>{i.type}</StatusPill></TableCell>
                        <TableCell className="text-xs">{i.source}</TableCell>
                        <TableCell className="text-right text-xs tabular-nums">{i.volumeMl} mL</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{i.by}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</div>
      <dl className="space-y-1.5 text-sm">{children}</dl>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-2">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd className="text-sm">{v}</dd>
    </div>
  );
}

function noteTone(cat: NursingNoteCategory) {
  switch (cat) {
    case "medication": return "primary" as const;
    case "procedure": return "condition" as const;
    case "handover": return "muted" as const;
    default: return "status-ok" as const;
  }
}

function VitalAdder({ onAdd }: { onAdd: (v: { bp?: string; pulse?: number; temp?: number; spo2?: number; respRate?: number }) => void }) {
  const [bp, setBp] = React.useState(""); const [pulse, setPulse] = React.useState("");
  const [temp, setTemp] = React.useState(""); const [spo2, setSpo2] = React.useState("");
  const [rr, setRr] = React.useState("");
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Add reading</div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
        <Input placeholder="BP 120/80" value={bp} onChange={(e) => setBp(e.target.value)} />
        <Input placeholder="Pulse" value={pulse} onChange={(e) => setPulse(e.target.value)} />
        <Input placeholder="Temp" value={temp} onChange={(e) => setTemp(e.target.value)} />
        <Input placeholder="SpO₂" value={spo2} onChange={(e) => setSpo2(e.target.value)} />
        <Input placeholder="RR" value={rr} onChange={(e) => setRr(e.target.value)} />
        <Button
          onClick={() => {
            onAdd({
              bp: bp || undefined,
              pulse: pulse ? Number(pulse) : undefined,
              temp: temp ? Number(temp) : undefined,
              spo2: spo2 ? Number(spo2) : undefined,
              respRate: rr ? Number(rr) : undefined,
            });
            setBp(""); setPulse(""); setTemp(""); setSpo2(""); setRr("");
            toast.success("Vitals recorded");
          }}
        >
          <Plus className="mr-1 h-4 w-4" /> Save
        </Button>
      </div>
    </div>
  );
}

function NoteComposer({ onAdd }: { onAdd: (category: NursingNoteCategory, text: string) => void }) {
  const [category, setCategory] = React.useState<NursingNoteCategory>("observation");
  const [text, setText] = React.useState("");
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as NursingNoteCategory)}
          className="h-8 rounded border border-input bg-transparent px-2 text-xs"
        >
          {(["observation", "medication", "procedure", "handover"] as const).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="text-[11px] text-muted-foreground">Add nursing note</span>
      </div>
      <Textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Document what you observed, did, or handed over…" />
      <div className="mt-2 flex justify-end">
        <Button
          size="sm"
          disabled={!text.trim()}
          onClick={() => { onAdd(category, text.trim()); setText(""); toast.success("Note added"); }}
        >
          <FilePlus2 className="mr-1.5 h-4 w-4" /> Post
        </Button>
      </div>
    </div>
  );
}

function RoundComposer({ doctor, onAdd }: { doctor: string; onAdd: (r: { subjective: string; objective: string; assessment: string; plan: string }) => void }) {
  const [s, setS] = React.useState(""); const [o, setO] = React.useState("");
  const [a, setA] = React.useState(""); const [p, setP] = React.useState("");
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">SOAP round · {doctor}</div>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <Textarea rows={2} value={s} onChange={(e) => setS(e.target.value)} placeholder="Subjective" />
        <Textarea rows={2} value={o} onChange={(e) => setO(e.target.value)} placeholder="Objective" />
        <Textarea rows={2} value={a} onChange={(e) => setA(e.target.value)} placeholder="Assessment" />
        <Textarea rows={2} value={p} onChange={(e) => setP(e.target.value)} placeholder="Plan" />
      </div>
      <div className="mt-2 flex justify-end">
        <Button
          size="sm"
          disabled={!s.trim() || !p.trim()}
          onClick={() => { onAdd({ subjective: s, objective: o, assessment: a, plan: p }); setS(""); setO(""); setA(""); setP(""); toast.success("Round saved"); }}
        >
          <Stethoscope className="mr-1.5 h-4 w-4" /> Save round
        </Button>
      </div>
    </div>
  );
}

function IoAdder({ onAdd }: { onAdd: (i: { type: "intake" | "output"; source: "Oral" | "IV" | "Tube feed" | "Urine" | "Drain" | "Vomit" | "Stool"; volumeMl: number }) => void }) {
  const [type, setType] = React.useState<"intake" | "output">("intake");
  const [source, setSource] = React.useState<"Oral" | "IV" | "Tube feed" | "Urine" | "Drain" | "Vomit" | "Stool">("Oral");
  const [ml, setMl] = React.useState("");
  const intakeSources = ["Oral", "IV", "Tube feed"] as const;
  const outputSources = ["Urine", "Drain", "Vomit", "Stool"] as const;
  const sources = type === "intake" ? intakeSources : outputSources;
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
      <select value={type} onChange={(e) => { const t = e.target.value as "intake" | "output"; setType(t); setSource(t === "intake" ? "Oral" : "Urine"); }} className="h-9 rounded border border-input bg-transparent px-2 text-sm">
        <option value="intake">Intake</option>
        <option value="output">Output</option>
      </select>
      <select value={source} onChange={(e) => setSource(e.target.value as typeof source)} className="h-9 rounded border border-input bg-transparent px-2 text-sm">
        {sources.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <Input className="w-28" type="number" placeholder="mL" value={ml} onChange={(e) => setMl(e.target.value)} />
      <Button
        size="sm"
        disabled={!ml || Number(ml) <= 0}
        onClick={() => { onAdd({ type, source, volumeMl: Number(ml) }); setMl(""); toast.success("Entry added"); }}
      >
        <Plus className="mr-1 h-4 w-4" /> Add
      </Button>
    </div>
  );
}export default WardChart;
