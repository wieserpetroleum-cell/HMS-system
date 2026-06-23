import * as React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, FlaskConical, Clock, User, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { OrderStatusPill, PriorityBadge } from "@/components/radiology/StatusPill";
import { ModalityIcon, modalityLabel } from "@/components/radiology/ModalityIcon";
import { useRadiology } from "@/lib/radiology-store";

function RadiologyOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOrder, getStudyByOrderId, startAcquisition, completeAcquisition, cancelOrder } = useRadiology();

  const order = getOrder(id!);
  const study = getStudyByOrderId(id!);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <FlaskConical className="h-12 w-12 text-muted-foreground/30" />
        <h2 className="mt-4 text-lg font-semibold">Order not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">This radiology order does not exist.</p>
        <Button className="mt-4" variant="outline" onClick={() => navigate("/radiology")}>
          Back to Radiology
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <Link
          to="/radiology"
          className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Radiology
        </Link>
        <div className="flex gap-2">
          {order.status === "ordered" && (
            <Button size="sm" onClick={() => { startAcquisition(order.id); navigate("/radiology/worklist"); }}>
              Start Acquisition
            </Button>
          )}
          {study && (
            <Button size="sm" variant="outline" asChild>
              <Link to={`/radiology/studies/${study.id}`}>View Study</Link>
            </Button>
          )}
        </div>
      </div>

      <PageHeader
        eyebrow="Radiology · Order Detail"
        title={order.orderNo}
      />

      {/* Order Info Card */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Order Details</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Accession No.</span>
              <span className="font-mono text-sm font-semibold">{order.orderNo}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <OrderStatusPill status={order.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Priority</span>
              <PriorityBadge priority={order.priority} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Modality</span>
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <ModalityIcon modality={order.modality} className="h-4 w-4" />
                {modalityLabel(order.modality)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Study</span>
              <span className="text-sm font-medium">{order.studyName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Source</span>
              <span className="text-sm uppercase">{order.source ?? "—"}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Patient & Referral</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-semibold">{order.patientName}</div>
                <div className="font-mono text-xs text-muted-foreground">{order.patientUid}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-[11px] text-muted-foreground">Ordered By</div>
                <div className="text-sm font-medium">{order.orderedBy}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-[11px] text-muted-foreground">Ordered At</div>
                <div className="text-sm">{new Date(order.orderedAt).toLocaleString("en-IN")}</div>
              </div>
            </div>
            {order.scheduledAt && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-[11px] text-muted-foreground">Scheduled At</div>
                  <div className="text-sm">{new Date(order.scheduledAt).toLocaleString("en-IN")}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clinical Notes */}
      {order.clinicalNotes && (
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Clinical Notes</h3>
          <p className="text-sm leading-relaxed text-foreground">{order.clinicalNotes}</p>
        </div>
      )}

      {/* Study Result */}
      {study && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Study Available</h3>
            <Button size="sm" asChild>
              <Link to={`/radiology/studies/${study.id}`}>
                <FileText className="mr-1.5 h-3.5 w-3.5" /> Open Study & Report
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RadiologyOrderDetail;
