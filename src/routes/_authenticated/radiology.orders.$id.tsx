import * as React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, FlaskConical, Clock, User, Calendar, FileText, CreditCard, X, Printer, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { OrderStatusPill, PriorityBadge } from "@/components/radiology/StatusPill";
import { ModalityIcon, modalityLabel } from "@/components/radiology/ModalityIcon";
import { useRadiology } from "@/lib/radiology-store";
import { useInvoices } from "@/lib/invoices-store";
import { findStudy } from "@/lib/mock/radiology-catalog";
import { cn } from "@/lib/utils";

// ── Payment Modal ─────────────────────────────────────────────────
function PaymentModal({ orderId, patientUid, patientName, studyName, studyCode, onClose, onCollect }: {
  orderId: string; patientUid: string; patientName: string; studyName: string; studyCode?: string;
  onClose: () => void; onCollect: (mode: string, amount: number, tpa: boolean, tpaProvider: string) => void;
}) {
  // Auto-fill price from catalog
  const catalogEntry = studyCode ? findStudy(studyCode) : undefined;
  const catalogPrice = catalogEntry?.tariff ?? 1500;

  const [mode, setMode] = React.useState("cash");
  const [amount, setAmount] = React.useState(String(catalogPrice));
  const [isTpa, setIsTpa] = React.useState(false);
  const [tpaProvider, setTpaProvider] = React.useState("");

  // Quick amounts based on catalog price
  const QUICK = catalogPrice
    ? [catalogPrice, Math.round(catalogPrice * 0.8), Math.round(catalogPrice * 1.2)]
    : [500, 1000, 1500, 2500, 5000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Collect Radiology Payment</h3>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>

        <div className="mb-4 rounded-lg bg-secondary/50 p-3">
          <div className="font-semibold text-sm">{patientName}</div>
          <div className="text-xs text-muted-foreground">{patientUid} · {studyName}</div>
          {catalogEntry && (
            <div className="mt-1 text-xs font-semibold text-primary">
              Standard Tariff: ₹{catalogEntry.tariff.toLocaleString('en-IN')}
            </div>
          )}
        </div>

        {/* TPA Toggle */}
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-border p-3">
          <input type="checkbox" id="tpa" checked={isTpa} onChange={(e) => setIsTpa(e.target.checked)} className="h-4 w-4 rounded" />
          <label htmlFor="tpa" className="text-sm font-medium cursor-pointer">Insurance / TPA Claim</label>
        </div>

        {isTpa ? (
          <div className="mb-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">TPA / Insurance Provider</label>
            <Input value={tpaProvider} onChange={(e) => setTpaProvider(e.target.value)}
              placeholder="e.g. Star Health, Medi-Assist, CGHS" className="mt-1" />
            <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 p-2 text-xs text-amber-700">
              Claimed Amount: ₹{catalogPrice.toLocaleString('en-IN')} (catalog tariff)
            </div>
          </div>
        ) : (
          <>
            <div className="mb-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount (₹)</label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 text-lg font-bold" />
              <div className="mt-1.5 flex gap-1.5">
                {QUICK.map((q) => (
                  <button key={q} onClick={() => setAmount(String(q))}
                    className={cn("flex-1 rounded border py-1 text-xs font-semibold transition-colors",
                      amount === String(q) ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"
                    )}>₹{q.toLocaleString('en-IN')}</button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment Mode</label>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                {[["cash","💵 Cash"],["upi","📱 UPI"],["card","💳 Card"],["bank","🏦 Bank Transfer"]].map(([v,l]) => (
                  <button key={v} onClick={() => setMode(v)}
                    className={cn("rounded border py-2 text-sm font-medium transition-colors",
                      mode === v ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary"
                    )}>{l}</button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 bg-status-ok hover:bg-status-ok/90"
            onClick={() => { onCollect(isTpa ? "tpa" : mode, isTpa ? catalogPrice : Number(amount), isTpa, tpaProvider); onClose(); }}>
            <Printer className="mr-1.5 h-4 w-4" />
            {isTpa ? "Submit TPA Claim" : `Collect & Print ₹${Number(amount).toLocaleString('en-IN')}`}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
function RadiologyOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOrder, startAcquisition, cancelOrder } = useRadiology();
  const { addInvoice, invoices } = useInvoices();
  const [showPayment, setShowPayment] = React.useState(false);

  const order = getOrder(id!);

  // Check if payment already collected
  const isPaid = React.useMemo(() =>
    invoices.some((inv) => inv.sourceId === id && inv.sourceType === "walkin" && inv.status !== "cancelled"),
    [invoices, id]
  );

  const onCollectPayment = (mode: string, amount: number, isTpa: boolean, tpaProvider: string) => {
    if (!order) return;
    try {
      const inv = addInvoice({
        patientUid: order.patientUid,
        patientName: order.patientName,
        sourceType: "walkin",
        sourceId: order.id,
        items: [{
          id: `rad-${Date.now()}`,
          category: "radiology",
          code: order.studyCode ?? "RAD",
          description: `${order.studyName} (${modalityLabel(order.modality)})`,
          qty: 1,
          unitPrice: amount,
          amount,
          taxable: true,
        }],
        discount: 0,
        taxRate: 0.05,
        status: isTpa ? "tpa-pending" : "paid",
        createdAt: new Date().toISOString(),
        dueAt: new Date().toISOString(),
        payments: isTpa ? [] : [{
          id: `pay-${Date.now()}`,
          at: new Date().toISOString(),
          mode: mode as "cash" | "card" | "upi" | "bank" | "tpa",
          amount,
          collectedBy: "Reception",
        }],
        ...(isTpa ? {
          tpaClaim: {
            provider: tpaProvider || "TPA",
            tpaName: tpaProvider || "TPA",
            policyNumber: "",
            claimedAmount: amount,
            status: "pre-auth" as const,
            lastUpdateAt: new Date().toISOString(),
          }
        } : {})
      });
      toast.success(isTpa ? `TPA claim submitted — ${inv.invoiceNo}` : `✅ ₹${amount} collected — ${inv.invoiceNo}`);
      navigate(`/billing/invoices/${inv.id}`);
    } catch {
      toast.error("Failed to create invoice. Please try again.");
    }
  };

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <FlaskConical className="h-12 w-12 text-muted-foreground/30" />
        <h2 className="mt-4 text-lg font-semibold">Order not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">This radiology order does not exist.</p>
        <Button className="mt-4" variant="outline" onClick={() => navigate("/radiology")}>Back to Radiology</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      {showPayment && (
        <PaymentModal
          orderId={order.id}
          patientUid={order.patientUid}
          patientName={order.patientName}
          studyName={order.studyName}
          studyCode={order.studyCode}
          onClose={() => setShowPayment(false)}
          onCollect={onCollectPayment}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/radiology" className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Radiology
        </Link>
        <div className="flex items-center gap-2">
          {/* Payment button */}
          {isPaid ? (
            <div className="flex items-center gap-1.5 rounded-lg border border-status-ok/40 bg-status-ok/10 px-3 py-1.5 text-xs font-semibold text-status-ok">
              <CheckCircle2 className="h-3.5 w-3.5" /> Payment Collected
            </div>
          ) : (
            <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50"
              onClick={() => setShowPayment(true)}>
              <CreditCard className="mr-1.5 h-3.5 w-3.5" /> Collect Payment / TPA
            </Button>
          )}
          {order.status === "ordered" && (
            <Button size="sm" onClick={() => { startAcquisition(order.id); navigate("/radiology/worklist"); }}>
              Start Acquisition
            </Button>
          )}
          {(order.status === "acquired" || order.status === "reporting") && (
            <Button size="sm" asChild>
              <Link to={`/radiology/studies/${order.id}`}>Write Report →</Link>
            </Button>
          )}
          {order.status === "verified" && (
            <Button size="sm" variant="outline" asChild>
              <Link to={`/radiology/studies/${order.id}/report`}>View Report</Link>
            </Button>
          )}
          {order.status !== "cancelled" && order.status !== "verified" && (
            <Button size="sm" variant="outline" onClick={() => { cancelOrder(order.id, "Cancelled by reception"); toast.error("Order cancelled"); navigate("/radiology"); }}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      <PageHeader eyebrow="Radiology · Order Detail" title={order.orderNo} />

      {/* Payment pending warning */}
      {!isPaid && order.status !== "cancelled" && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Payment not collected</p>
            <p className="text-xs text-amber-700">Collect payment or submit TPA claim before or after the study.</p>
          </div>
          <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setShowPayment(true)}>
            Collect Now
          </Button>
        </div>
      )}

      {/* Order Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Order Details</h3>
          {[
            ["Accession No.", <span className="font-mono font-semibold">{order.orderNo}</span>],
            ["Status", <OrderStatusPill status={order.status} />],
            ["Priority", <PriorityBadge priority={order.priority} />],
            ["Modality", <span className="flex items-center gap-1.5"><ModalityIcon modality={order.modality} className="h-4 w-4" />{modalityLabel(order.modality)}</span>],
            ["Study", order.studyName],
            ["Source", <span className="uppercase">{order.source ?? "OPD"}</span>],
          ].map(([label, value], i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="text-sm font-medium">{value}</span>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Patient & Referral</h3>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-semibold">{order.patientName}</div>
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

      {order.clinicalNotes && (
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Clinical Notes</h3>
          <p className="text-sm leading-relaxed">{order.clinicalNotes}</p>
        </div>
      )}

      {/* Payment status card */}
      {isPaid && (
        <div className="rounded-lg border border-status-ok/30 bg-status-ok/5 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-status-ok" />
              <span className="text-sm font-semibold text-status-ok">Payment Collected</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => {
              const inv = invoices.find((i) => i.sourceId === id);
              if (inv) navigate(`/billing/invoices/${inv.id}`);
            }}>
              <FileText className="mr-1.5 h-3.5 w-3.5" /> View Receipt
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RadiologyOrderDetail;
