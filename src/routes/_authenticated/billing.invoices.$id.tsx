import * as React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, FileText, CreditCard, ShieldCheck, History, Printer, Trash2, Plus, Save, Pencil, X } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/forms/Combobox";
import { PatientSummaryRail } from "@/components/consultation/PatientSummaryRail";
import { LineItemRow } from "@/components/billing/LineItemRow";
import { TotalsPanel } from "@/components/billing/TotalsPanel";
import { InvoiceStatusPill, TpaStatusPill } from "@/components/billing/StatusPill";
import { PaymentDrawer } from "@/components/billing/PaymentDrawer";
import { AuditTimeline } from "@/components/billing/AuditTimeline";
import { useInvoices } from "@/lib/invoices-store";
import { usePatients } from "@/lib/patients-store";
import { catalogToOptions, findCatalog } from "@/lib/mock/charge-catalog";
import type { InvoiceItem, PaymentMode, TpaClaim, TpaClaimStatus } from "@/lib/types";
import { money, ageDays } from "@/lib/money";
import { tpaClaimSchema } from "@/lib/validation/invoice";

const TABS = ["charges", "payments", "tpa", "timeline", "print"] as const;
type Tab = typeof TABS[number];


function InvoiceWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById, replaceItems, updateInvoice, addPayment, updateTpaClaim, cancelInvoice } = useInvoices();
  const { patients } = usePatients();

  const invoice = getById(id);
  const patient = patients.find((p) => p.uid === invoice?.patientUid);

  const [tab, setTab] = React.useState<Tab>(initialTab ?? "charges");
  const [items, setItems] = React.useState<InvoiceItem[]>(invoice?.items ?? []);
  const [discount, setDiscount] = React.useState(invoice?.discount ?? 0);
  const [payOpen, setPayOpen] = React.useState(false);
  const [addCode, setAddCode] = React.useState("");

  // sync local state when invoice changes
  React.useEffect(() => {
    if (invoice) { setItems(invoice.items); setDiscount(invoice.discount); }
  }, [invoice?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // hotkeys
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const m = e.metaKey || e.ctrlKey;
      if (!m) return;
      if (e.key.toLowerCase() === "s") { e.preventDefault(); save(); }
      if (e.key.toLowerCase() === "p") { e.preventDefault(); window.print(); }
      if (e.key === "Enter") { e.preventDefault(); setPayOpen(true); }
      if (["1","2","3","4","5"].includes(e.key)) { e.preventDefault(); setTab(TABS[parseInt(e.key, 10) - 1]); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, discount, invoice?.id]);

  if (!invoice) {
    return (
      <div className="p-10">
        <p className="text-sm text-muted-foreground">Invoice not found.</p>
        <Link to="/billing/invoices" className="text-sm text-primary hover:underline">Back to invoices</Link>
      </div>
    );
  }

  const save = () => {
    replaceItems(invoice.id, items);
    if (discount !== invoice.discount) {
      updateInvoice(invoice.id, { discount }, { by: "Reception", action: "Discount updated", detail: money(discount) });
    } else {
      updateInvoice(invoice.id, {});
    }
    toast.success("Invoice saved");
  };

  const addFromCatalog = (code: string) => {
    const c = findCatalog(code);
    if (!c) return;
    setItems((prev) => [...prev, {
      id: `tmp-${Date.now()}`, category: c.category, code: c.code, description: c.description,
      qty: 1, unitPrice: c.unitPrice, amount: c.unitPrice, taxable: c.taxable,
    }]);
    setAddCode("");
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));
  const updateItem = (id: string, patch: Partial<InvoiceItem>) =>
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, ...patch } : i));

  // Recompute preview totals locally
  const previewSubtotal = items.reduce((s, it) => s + it.amount, 0);
  const previewTaxable = items.filter((i) => i.taxable).reduce((s, it) => s + it.amount, 0);
  const previewTax = Math.max(0, Math.round((previewTaxable - (discount * previewTaxable) / Math.max(previewSubtotal, 1)) * invoice.taxRate));
  const previewTotal = Math.max(0, previewSubtotal - discount + previewTax);
  const preview = { ...invoice, items, discount, subtotal: previewSubtotal, taxAmount: previewTax, total: previewTotal, balance: Math.max(0, previewTotal - invoice.paid) };

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="no-print flex flex-col gap-6 p-6 lg:flex-row">
        {/* Left rail */}
        <aside className="w-full shrink-0 space-y-4 lg:w-72">
          <Link to="/billing/invoices" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Invoices
          </Link>
          {patient && <PatientSummaryRail patient={patient} />}
          <div className="rounded-lg border border-border bg-card p-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono">{invoice.invoiceNo}</span>
              <InvoiceStatusPill status={invoice.status} />
            </div>
            <div className="mt-2 space-y-1 text-muted-foreground">
              <div>Source: <span className="uppercase">{invoice.sourceType}</span></div>
              <div>Created: {new Date(invoice.createdAt).toLocaleDateString()}</div>
              {invoice.dueAt && <div>Due: {new Date(invoice.dueAt).toLocaleDateString()}</div>}
              <div>Age: {ageDays(invoice.createdAt)}d</div>
            </div>
          </div>
        </aside>

        {/* Center */}
        <main className="flex-1 space-y-4">
          <PageHeader
            eyebrow={`Billing · ${invoice.invoiceNo}`}
            title={invoice.patientName}
            description={`${invoice.items.length} line items · ${invoice.payments.length} payments`}
            right={
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={save}><Save className="mr-1.5 h-4 w-4" /> Save</Button>
                <Button variant="outline" onClick={() => window.print()}><Printer className="mr-1.5 h-4 w-4" /> Print</Button>
                <Button onClick={() => setPayOpen(true)} disabled={invoice.balance <= 0 || invoice.status === "cancelled"}>
                  <CreditCard className="mr-1.5 h-4 w-4" /> Collect {money(invoice.balance)}
                </Button>
              </div>
            }
          />

          <div className="flex gap-1 border-b border-border">
            {TABS.map((t, idx) => (
              <button
                key={t} type="button" onClick={() => setTab(t)}
                className={[
                  "border-b-2 px-3 py-2 text-sm capitalize transition-colors",
                  tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {tabIcon(t)}<span className="ml-1.5">{t === "tpa" ? "TPA" : t}</span>
                <kbd className="ml-1.5 hidden rounded bg-muted px-1 text-[9px] text-muted-foreground md:inline">⌘{idx + 1}</kbd>
              </button>
            ))}
          </div>

          {tab === "charges" && (
            <div className="rounded-lg border border-border bg-card">
              <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
                <div className="min-w-[280px] flex-1">
                  <Combobox options={catalogToOptions()} value={addCode} onChange={addFromCatalog} placeholder="Add from charge catalog…" />
                </div>
                <Button variant="outline" size="sm" onClick={() => addFromCatalog("MISC-REG")}>
                  <Plus className="mr-1 h-4 w-4" /> Misc line
                </Button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <th className="w-32 px-3 py-2 text-left">Category</th>
                    <th className="px-3 py-2 text-left">Description</th>
                    <th className="w-16 px-3 py-2 text-right">Qty</th>
                    <th className="w-24 px-3 py-2 text-right">Unit ₹</th>
                    <th className="w-24 px-3 py-2 text-right">Amount</th>
                    <th className="w-10 px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 && (
                    <tr><td colSpan={6} className="px-3 py-8 text-center text-sm text-muted-foreground">No line items. Add from catalog above.</td></tr>
                  )}
                  {items.map((it) => (
                    <LineItemRow key={it.id} item={it}
                      readOnly={invoice.status === "cancelled"}
                      onChange={(patch) => updateItem(it.id, patch)}
                      onRemove={() => removeItem(it.id)} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "payments" && (
            <div className="rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border p-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Payment history</div>
                <Button size="sm" onClick={() => setPayOpen(true)} disabled={invoice.balance <= 0}>
                  <Plus className="mr-1 h-4 w-4" /> Collect
                </Button>
              </div>
              {invoice.payments.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-muted-foreground">No payments yet.</div>
              ) : (
                <ul className="divide-y divide-border">
                  {invoice.payments.map((p) => (
                    <li key={p.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <div className="text-sm font-medium uppercase">{p.mode}</div>
                        <div className="text-xs text-muted-foreground">{new Date(p.at).toLocaleString()} · by {p.collectedBy}{p.reference ? ` · ref ${p.reference}` : ""}</div>
                      </div>
                      <div className="text-sm font-semibold tabular-nums text-status-ok">{money(p.amount)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === "tpa" && (
            <TpaTab invoice={invoice} onSave={(c) => { updateTpaClaim(invoice.id, c); toast.success("TPA updated"); }} />
          )}

          {tab === "timeline" && (
            <div className="rounded-lg border border-border bg-card p-5">
              <AuditTimeline events={invoice.auditLog} />
            </div>
          )}

          {tab === "print" && (
            <div className="rounded-lg border border-border bg-card p-5">
              <p className="mb-3 text-sm text-muted-foreground">Preview of the printable invoice. Use Print to send to printer.</p>
              <PrintInvoice invoice={invoice} />
            </div>
          )}
        </main>

        {/* Right rail */}
        <aside className="w-full shrink-0 space-y-4 lg:w-72">
          <TotalsPanel invoice={preview} onDiscountChange={setDiscount} readOnly={invoice.status === "cancelled"} />
          {invoice.status !== "cancelled" && (
            <Button variant="outline" className="w-full text-allergy hover:bg-allergy/10 hover:text-allergy"
              onClick={() => {
                const reason = window.prompt("Reason for cancellation?");
                if (reason) { cancelInvoice(invoice.id, reason, "Reception"); toast("Invoice cancelled"); }
              }}>
              <Trash2 className="mr-1.5 h-4 w-4" /> Cancel invoice
            </Button>
          )}
        </aside>
      </div>

      <PaymentDrawer
        open={payOpen} onOpenChange={setPayOpen} balance={invoice.balance}
        onCollect={(p) => {
          addPayment(invoice.id, { ...p, at: new Date().toISOString(), collectedBy: "Reception" });
          toast.success(`Collected ${money(p.amount)}`);
        }}
      />

      <div className="print-area hidden">
        <PrintInvoice invoice={invoice} />
      </div>
    </div>
  );
}

function tabIcon(t: Tab) {
  switch (t) {
    case "charges": return <FileText className="inline h-3.5 w-3.5" />;
    case "payments": return <CreditCard className="inline h-3.5 w-3.5" />;
    case "tpa": return <ShieldCheck className="inline h-3.5 w-3.5" />;
    case "timeline": return <History className="inline h-3.5 w-3.5" />;
    case "print": return <Printer className="inline h-3.5 w-3.5" />;
  }
}

function TpaTab({ invoice, onSave }: { invoice: ReturnType<typeof useInvoices>["invoices"][number]; onSave: (c: TpaClaim) => void }) {
  const initial: TpaClaim = invoice.tpaClaim ?? {
    provider: "", tpaName: "", policyNumber: "",
    claimedAmount: invoice.total, status: "draft",
    lastUpdateAt: new Date().toISOString(),
  };
  const [c, setC] = React.useState<TpaClaim>(undefined);
  const set = <K extends keyof TpaClaim>(k: K, v: TpaClaim[K]) => setC((p) => ({ ...p, [k]: v }));

  const submit = () => {
    const parsed = tpaClaimSchema.safeParse(c);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      toast.error(first.message);
      return;
    }
    onSave(c);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-semibold">TPA Claim</div>
          {invoice.tpaClaim && <TpaStatusPill status={invoice.tpaClaim.status} />}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Insurance Provider">
            <Input value={c.provider} onChange={(e) => set("provider", e.target.value)} placeholder="Star Health, HDFC Ergo…" />
          </Field>
          <Field label="TPA Name">
            <Input value={c.tpaName} onChange={(e) => set("tpaName", e.target.value)} placeholder="MediAssist, Paramount…" />
          </Field>
          <Field label="Policy Number">
            <Input value={c.policyNumber} onChange={(e) => set("policyNumber", e.target.value)} />
          </Field>
          <Field label="Pre-Auth Number">
            <Input value={c.preAuthNo ?? ""} onChange={(e) => set("preAuthNo", e.target.value)} placeholder="Required before Submitted" />
          </Field>
          <Field label="Claimed Amount">
            <Input type="number" value={c.claimedAmount} onChange={(e) => set("claimedAmount", Number(e.target.value || 0))} className="tabular-nums" />
          </Field>
          <Field label="Approved Amount">
            <Input type="number" value={c.approvedAmount ?? ""} onChange={(e) => set("approvedAmount", e.target.value === "" ? undefined : Number(e.target.value))} className="tabular-nums" />
          </Field>
          <Field label="Status">
            <select
              value={c.status}
              onChange={(e) => set("status", e.target.value as TpaClaimStatus)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm capitalize shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {(["draft","pre-auth","submitted","query","approved","settled","rejected"] as TpaClaimStatus[]).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Claim Number">
            <Input value={c.claimNo ?? ""} onChange={(e) => set("claimNo", e.target.value)} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Notes">
              <Textarea value={c.notes ?? ""} onChange={(e) => set("notes", e.target.value)} rows={3} placeholder="Insurer queries, internal notes…" />
            </Field>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={submit}><ShieldCheck className="mr-1.5 h-4 w-4" /> Save TPA</Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function PrintInvoice({ invoice }: { invoice: ReturnType<typeof useInvoices>["invoices"][number] }) {
  return (
    <div className="mx-auto max-w-3xl bg-white p-8 text-sm text-slate-900">
      <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
        <div>
          <div className="text-2xl font-bold tracking-tight">MEDICORE.OS</div>
          <div className="text-xs text-slate-600">Medicore Hospital · 123 Care Avenue · Mumbai 400001</div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-widest text-slate-500">Tax Invoice</div>
          <div className="mt-1 font-mono text-sm">{invoice.invoiceNo}</div>
          <div className="text-xs text-slate-600">Date: {new Date(invoice.createdAt).toLocaleDateString()}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-6 text-xs">
        <div>
          <div className="font-semibold uppercase text-slate-500">Billed to</div>
          <div className="mt-1 text-sm font-medium">{invoice.patientName}</div>
          <div className="font-mono">{invoice.patientUid}</div>
        </div>
        <div className="text-right">
          <div className="font-semibold uppercase text-slate-500">Status</div>
          <div className="mt-1 uppercase">{invoice.status}</div>
          {invoice.tpaClaim && <div className="mt-1 text-xs text-slate-600">TPA: {invoice.tpaClaim.tpaName} ({invoice.tpaClaim.status})</div>}
        </div>
      </div>

      <table className="mt-6 w-full text-xs">
        <thead>
          <tr className="border-b border-slate-300 text-left uppercase text-slate-500">
            <th className="py-2">#</th>
            <th>Description</th>
            <th className="text-right">Qty</th>
            <th className="text-right">Unit ₹</th>
            <th className="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((it, i) => (
            <tr key={it.id} className="border-b border-slate-100">
              <td className="py-2">{i + 1}</td>
              <td>{it.description} {it.code && <span className="text-slate-400">({it.code})</span>}</td>
              <td className="text-right tabular-nums">{it.qty}</td>
              <td className="text-right tabular-nums">{it.unitPrice.toLocaleString()}</td>
              <td className="text-right tabular-nums">{it.amount.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-end">
        <table className="w-72 text-sm">
          <tbody>
            <tr><td className="py-1 text-slate-600">Subtotal</td><td className="text-right tabular-nums">{money(invoice.subtotal)}</td></tr>
            <tr><td className="py-1 text-slate-600">Discount</td><td className="text-right tabular-nums">- {money(invoice.discount)}</td></tr>
            <tr><td className="py-1 text-slate-600">Tax ({Math.round(invoice.taxRate * 100)}%)</td><td className="text-right tabular-nums">{money(invoice.taxAmount)}</td></tr>
            <tr className="border-t border-slate-300"><td className="py-1 font-semibold">Total</td><td className="text-right font-semibold tabular-nums">{money(invoice.total)}</td></tr>
            <tr><td className="py-1 text-slate-600">Paid</td><td className="text-right tabular-nums">{money(invoice.paid)}</td></tr>
            <tr><td className="py-1 font-semibold">Balance Due</td><td className="text-right font-bold tabular-nums">{money(invoice.balance)}</td></tr>
          </tbody>
        </table>
      </div>

      <div className="mt-10 text-center text-[10px] text-slate-500">
        This is a computer-generated invoice. For queries, contact billing@medicore.os.
      </div>
    </div>
  );
}
export default InvoiceWorkspace;
