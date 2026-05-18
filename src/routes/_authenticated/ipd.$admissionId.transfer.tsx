import { useParams } from "react-router-dom";
import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BedPickerGrid } from "@/components/ipd/BedPickerGrid";
import { StatusPill } from "@/components/ipd/StatusPill";
import { useAdmissions } from "@/lib/admissions-store";
import { useAuth } from "@/lib/auth-context";
import type { WardBed } from "@/lib/types";
function TransferBed() {
  const { admissionId } = useParams();
  const { getById, transferBed } = useAdmissions();
  const { user } = useAuth();
  const navigate = useNavigate();
  const adm = getById(admissionId);

  const [target, setTarget] = React.useState<WardBed | undefined>();
  const [reason, setReason] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

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

  const submit = () => {
    setError(null);
    if (!target) return setError("Pick a target bed");
    if (target.id === adm.bedId) return setError("Target must differ from current bed");
    if (!reason.trim() || reason.trim().length < 4) return setError("Reason required");
    transferBed(adm.id, target.id, reason.trim(), user?.name ?? "Clinician");
    toast.success(`Transferred to ${target.bedNumber}`);
    navigate(`/ipd/${adm.id}`);
  };

  return (
    <div className="space-y-6 p-8">
      <Link
        to={`{result}`}
        className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Back to chart
      </Link>

      <PageHeader eyebrow="IPD · Transfer" title={`Move ${adm.patientName}`} description="Pick a new bed and document the reason. Old bed will be sent to cleaning." />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[280px_1fr]">
        <div className="space-y-3 rounded-lg border border-border bg-card p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Current bed</div>
          <div className="text-lg font-bold font-mono">{adm.bedNumber}</div>
          <div className="text-xs text-muted-foreground">{adm.ward}</div>
          <StatusPill tone="info">Day {Math.max(1, Math.floor((Date.now() - new Date(adm.admittedAt).getTime()) / 86400000) + 1)}</StatusPill>

          {target && (
            <div className="mt-4 rounded-md border border-primary/30 bg-primary/5 p-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-primary">Target</div>
              <div className="mt-1 text-lg font-bold font-mono">{target.bedNumber}</div>
              <div className="text-xs text-muted-foreground">{target.ward}</div>
            </div>
          )}

          <div className="mt-4 space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reason for transfer</label>
            <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Step-down from ICU, bed swap for isolation, family request…" />
          </div>

          {error && <div className="rounded-md border border-allergy/40 bg-allergy/10 px-3 py-2 text-xs text-allergy">{error}</div>}

          <Button className="w-full" onClick={submit}>
            <ArrowRightLeft className="mr-1.5 h-4 w-4" /> Confirm transfer
          </Button>
        </div>

        <div>
          <BedPickerGrid selectedBedId={target?.id} onSelect={(b) => setTarget(b)} />
        </div>
      </div>
    </div>
  );
}export default TransferBed;
