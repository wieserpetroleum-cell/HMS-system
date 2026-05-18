import { Link, useParams } from "react-router-dom";
import { Printer, ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRadiology } from "@/lib/radiology-store";
import { usePatients } from "@/lib/patients-store";
import { modalityLabel } from "@/components/radiology/ModalityIcon";
function ReportViewer() {
  const { id } = useParams({ from: `/_authenticated/radiology/studies/${id}/report` });
  const { getOrder, getStudyByOrderId, getReportByStudyId } = useRadiology();
  const { patients } = usePatients();

  const order = getOrder(id);
  const study = order ? getStudyByOrderId(order.id) : undefined;
  const report = study ? getReportByStudyId(study.id) : undefined;
  const patient = order ? patients.find((p) => p.uid === order.patientUid) : undefined;

  if (!order || !report?.verifiedAt) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No verified report available.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Button variant="ghost" size="sm" asChild>
          <Link to=`{result}`>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to workspace
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      <div className="print-area mx-auto max-w-3xl rounded-lg border border-border bg-card p-10 shadow-sm">
        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <div>
            <div className="text-lg font-bold tracking-tight">MEDICORE.OS HOSPITAL</div>
            <div className="text-xs text-muted-foreground">Department of Radiology</div>
          </div>
          <div className="text-right text-xs">
            <div className="font-mono">{order.orderNo}</div>
            <div className="font-mono text-muted-foreground">Acc: {study?.accessionNo}</div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Patient</div>
            <div className="font-semibold">{order.patientName}</div>
            <div className="font-mono">{order.patientUid}</div>
            {patient && <div className="text-muted-foreground">{patient.sex} · {patient.age}</div>}
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Study</div>
            <div className="font-semibold">{order.studyName}</div>
            <div className="text-muted-foreground">{modalityLabel(order.modality)} · {order.bodyPart}</div>
            <div className="text-muted-foreground">Ordered by {order.orderedBy}</div>
          </div>
        </div>

        <div className="mb-4 border-y border-border bg-muted/40 px-3 py-2 text-xs">
          <span className="font-semibold">Clinical indication: </span>{order.clinicalIndication}
        </div>

        {report.criticalFinding && (
          <div className="mb-4 flex items-center gap-2 rounded border border-allergy/40 bg-allergy/10 px-3 py-2 text-xs text-allergy">
            <AlertTriangle className="h-4 w-4" /> Critical finding — referring physician notified.
          </div>
        )}

        <div className="space-y-4">
          {report.sections.map((s) => (
            <div key={s.heading}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{s.heading}</div>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{s.text || <span className="text-muted-foreground italic">—</span>}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-4 text-xs">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Verified by</div>
              <div className="font-semibold">{report.verifiedBy}</div>
              <div className="text-muted-foreground">{new Date(report.verifiedAt).toLocaleString()}</div>
            </div>
            <div className="text-[10px] text-muted-foreground">Version {report.version}{report.amendmentReason ? ` · Amended: ${report.amendmentReason}` : ""}</div>
          </div>
        </div>
      </div>
    </div>
  );
}export default ReportViewer;
