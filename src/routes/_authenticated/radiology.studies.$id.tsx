import * as React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, FileText, ArrowLeft } from "lucide-react";
import { PatientSummaryRail } from "@/components/consultation/PatientSummaryRail";
import { OrderStatusPill, PriorityBadge } from "@/components/radiology/StatusPill";
import { ModalityIcon, modalityLabel } from "@/components/radiology/ModalityIcon";
import { SeriesStage, SeriesThumbnail } from "@/components/radiology/SeriesThumbnail";
import { PriorStudiesStrip } from "@/components/radiology/PriorStudiesStrip";
import { ReportEditor } from "@/components/radiology/ReportEditor";
import { TatGauge } from "@/components/radiology/TatGauge";
import { Button } from "@/components/ui/button";
import { useRadiology } from "@/lib/radiology-store";
import { usePatients } from "@/lib/patients-store";
import { useAuth } from "@/lib/auth-context";
import { findStudy } from "@/lib/mock/radiology-catalog";
import { templatesFor, getTemplate } from "@/lib/mock/radiology-templates";
import { verifySchema } from "@/lib/validation/radiology";
import { toast } from "sonner";
import type { ReportSection } from "@/lib/types";
function StudyWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getOrder, getStudyByOrderId, getReportByStudyId, saveReportDraft, verifyReport, startAcquisition, completeAcquisition, orders } = useRadiology();
  const { patients } = usePatients();

  const order = getOrder(id);
  return order
    ? <Workspace order={order} {...{ navigate, user, getStudyByOrderId, getReportByStudyId, saveReportDraft, verifyReport, startAcquisition, completeAcquisition, orders, patients }} />
    : (
      <div className="p-8">
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <div className="text-sm text-muted-foreground">Order not found.</div>
          <Button variant="outline" className="mt-3" onClick={() => navigate("/radiology/worklist")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to worklist
          </Button>
        </div>
      </div>
    );
}

type WorkspaceProps = {
  order: NonNullable<ReturnType<ReturnType<typeof useRadiology>["getOrder"]>>;
  navigate: ReturnType<typeof useNavigate>;
  user: ReturnType<typeof useAuth>["user"];
  getStudyByOrderId: ReturnType<typeof useRadiology>["getStudyByOrderId"];
  getReportByStudyId: ReturnType<typeof useRadiology>["getReportByStudyId"];
  saveReportDraft: ReturnType<typeof useRadiology>["saveReportDraft"];
  verifyReport: ReturnType<typeof useRadiology>["verifyReport"];
  startAcquisition: ReturnType<typeof useRadiology>["startAcquisition"];
  completeAcquisition: ReturnType<typeof useRadiology>["completeAcquisition"];
  orders: ReturnType<typeof useRadiology>["orders"];
  patients: ReturnType<typeof usePatients>["patients"];
};

function Workspace({ order, navigate, user, getStudyByOrderId, getReportByStudyId, saveReportDraft, verifyReport, startAcquisition, completeAcquisition, orders, patients }: WorkspaceProps) {

  const patient = patients.find((p) => p.uid === order.patientUid);
  const study = getStudyByOrderId(order.id);
  const existingReport = study ? getReportByStudyId(study.id) : undefined;
  const cat = findStudy(order.studyCode);
  const templates = templatesFor(order.modality);
  const verified = !!existingReport?.verifiedAt;

  const defaultSections: ReportSection[] = existingReport?.sections ?? [
    { heading: "Technique", text: "" },
    { heading: "Findings", text: "" },
    { heading: "Impression", text: "" },
    { heading: "Recommendations", text: "" },
  ];

  const [sections, setSections] = React.useState<ReportSection[] | undefined>(undefined);
  const [templateId, setTemplateId] = React.useState<string | undefined>(existingReport?.templateId);
  const [critical, setCritical] = React.useState<boolean>(existingReport?.criticalFinding ?? false);
  const [saveState, setSaveState] = React.useState<"idle" | "saving" | "saved" | "dirty">("idle");
  const [activeSeries, setActiveSeries] = React.useState(study?.series[0]?.id);

  React.useEffect(() => {
    if (study && !activeSeries) setActiveSeries(study.series[0]?.id);
  }, [study, activeSeries]);

  // Autosave (debounced 600ms)
  const saveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => {
    if (!study || verified) return;
    setSaveState("dirty");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setSaveState("saving");
      saveReportDraft(study.id, sections, user?.name ?? "Radiologist", critical, templateId);
      setTimeout(() => setSaveState("saved"), 250);
    }, 600);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections, critical, templateId]);

  function applyTemplate(id: string) {
    const tpl = getTemplate(id);
    if (!tpl) return;
    setTemplateId(id);
    setSections(tpl.sections.map((s) => ({ heading: s.heading, text: s.defaultText })));
    toast.success(`Template applied: ${tpl.name}`);
  }

  function handleVerify() {
    if (!study) return;
    const parsed = verifySchema.safeParse({ sections });
    if (!parsed.success) {
      toast.error("Findings and Impression are required");
      return;
    }
    saveReportDraft(study.id, sections, user?.name ?? "Radiologist", critical, templateId);
    verifyReport(study.id, user?.name ?? "Radiologist");
    toast.success("Report verified");
    navigate(`/radiology/studies/${order.id}/report`);
  }

  function handleStartAcquisition() {
    startAcquisition(order.id);
    toast.success("Acquisition started");
  }
  function handleCompleteAcquisition() {
    completeAcquisition(order.id, {
      series: [{ description: "Default series", imageCount: 24 }],
      technologist: user?.name ?? "Technologist",
    });
    toast.success("Acquisition complete");
  }

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleVerify();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (study) {
          saveReportDraft(study.id, sections, user?.name ?? "Radiologist", critical, templateId);
          setSaveState("saved");
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const priors = orders
    .filter((o) => o.patientUid === order.patientUid && o.id !== order.id && (o.status === "verified" || o.status === "delivered"))
    .slice(0, 6);

  const activeSeriesObj = study?.series.find((s) => s.id === activeSeries);

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">
      {/* Header strip */}
      <div className="flex items-center justify-between gap-4 border-b border-border bg-card px-5 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/radiology/worklist"><ArrowLeft className="mr-1 h-4 w-4" /> Worklist</Link>
          </Button>
          <div className="h-6 w-px bg-border" />
          <ModalityIcon modality={order.modality} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">{order.orderNo}</span>
              <span className="text-sm font-semibold">{order.studyName}</span>
              <PriorityBadge priority={order.priority} />
              <OrderStatusPill status={order.status} />
            </div>
            <div className="text-[11px] text-muted-foreground">{order.patientName} · {order.patientUid} · {modalityLabel(order.modality)}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {cat && <TatGauge orderedAt={order.orderedAt} verifiedAt={existingReport?.verifiedAt} targetMin={cat.targetTatMin} />}
          {(order.status === "scheduled" || order.status === "ordered") && (
            <Button size="sm" onClick={handleStartAcquisition}>Start acquisition</Button>
          )}
          {order.status === "in-acquisition" && (
            <Button size="sm" onClick={handleCompleteAcquisition}>Complete acquisition</Button>
          )}
          {verified ? (
            <Button size="sm" variant="outline" asChild>
              <Link to="/radiology">
                <FileText className="mr-2 h-4 w-4" /> View report
              </Link>
            </Button>
          ) : (
            study && (
              <Button size="sm" onClick={handleVerify}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Verify & sign
              </Button>
            )
          )}
        </div>
      </div>

      {/* Main 3-pane */}
      <div className="grid flex-1 grid-cols-[280px_1fr_420px] overflow-hidden">
        {/* Left rail */}
        <div className="space-y-3 overflow-y-auto border-r border-border bg-background p-3">
          {patient && <PatientSummaryRail patient={patient} />}
          <div className="rounded-lg border border-border bg-card p-3 text-xs">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Indication</div>
            <div>{order.clinicalIndication}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Ordered by {order.orderedBy}</div>
            {order.contrast && <div className="mt-1 inline-block rounded border border-condition/40 bg-condition/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-condition-foreground">+Contrast</div>}
          </div>
          <PriorStudiesStrip studies={priors} />
        </div>

        {/* Center — image stage */}
        <div className="flex flex-col overflow-hidden bg-background">
          <div className="flex items-center justify-between border-b border-border px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <span>Viewer</span>
            <div className="flex gap-1">
              {["Window", "Zoom", "Pan", "Invert", "Measure", "Reset"].map((t) => (
                <button key={t} type="button" disabled className="rounded border border-border bg-card px-2 py-0.5 text-[10px] font-medium text-muted-foreground opacity-60" title="Preview only">
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 p-3">
            {study ? (
              <SeriesStage series={activeSeriesObj} />
            ) : (
              <div className="grid h-full place-items-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
                Awaiting acquisition.
              </div>
            )}
          </div>
          {study && (
            <div className="border-t border-border p-3">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Series ({study.series.length})</div>
              <div className="grid grid-cols-5 gap-2">
                {study.series.map((s) => (
                  <SeriesThumbnail key={s.id} series={s} active={s.id === activeSeries} onClick={() => setActiveSeries(s.id)} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — report */}
        <div className="overflow-hidden border-l border-border bg-card">
          <ReportEditor
            sections={sections}
            onChange={setSections}
            templates={templates}
            templateId={templateId}
            onTemplate={applyTemplate}
            criticalFinding={critical}
            onCriticalChange={setCritical}
            saveState={saveState}
            readOnly={verified}
          />
          {verified && (
            <div className="border-t border-border bg-status-ok/10 p-3 text-[11px] text-status-ok">
              Verified by {existingReport?.verifiedBy} on {existingReport?.verifiedAt ? new Date(existingReport.verifiedAt).toLocaleString() : ""}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}export default StudyWorkspace;
