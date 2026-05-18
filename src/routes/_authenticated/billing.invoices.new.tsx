import * as React from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { ArrowLeft, FilePlus2, FileX2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Combobox } from "@/components/forms/Combobox";
import { Button } from "@/components/ui/button";
import { usePatients } from "@/lib/patients-store";
import { useConsultations } from "@/lib/consultations-store";
import { useAdmissions } from "@/lib/admissions-store";
import { useInvoices } from "@/lib/invoices-store";
import { findCatalog } from "@/lib/mock/charge-catalog";
import type { InvoiceItem } from "@/lib/types";
import { money } from "@/lib/money";


    id: `tmp-${code}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    category: c.category, code: c.code, description: c.description,
    qty, unitPrice: c.unitPrice, amount: qty * c.unitPrice, taxable: c.taxable,
    ...override,
  };
}

function NewInvoice() {
  const navigate = useNavigate();
    const { patients } = usePatients();
  const { consultations } = useConsultations();
  const { admissions } = useAdmissions();
  const { addInvoice } = useInvoices();

  const [patientUid, setPatientUid] = React.useState(preUid ?? "");
  const patient = patients.find((p) => p.uid === patientUid);
  const opd = consultations.filter((c) => c.patientUid === patientUid);
  const ipd = admissions.filter((a) => a.patientUid === patientUid);

  const patientOptions = patients.map((p) => ({ value: p.uid, label: p.name, hint: p.uid }));

  const create = (
    sourceType: "opd" | "ipd" | "walkin",
    sourceId: string | undefined,
    items: InvoiceItem[],
  ) => {
    if (!patient) return toast.error("Select a patient first");
    if (items.length === 0) return toast.error("No charges to invoice");
    const inv = addInvoice({
      patientUid: patient.uid,
      patientName: patient.name,
      sourceType, sourceId,
      items,
      discount: 0,
      taxRate: 0.05,
      status: "draft",
      createdAt: new Date().toISOString(),
      dueAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    });
    toast.success(`Invoice ${inv.invoiceNo} created`);
    navigate(`/billing/invoices/${inv.id}`);
  };

  React.useEffect(() => {
    // Auto-create from deep link
    if (preUid && preSource && preSourceId && patient) {
      if (preSource === "opd") {
        const c = consultations.find((x) => x.appointmentId === preSourceId || x.id === preSourceId);
        if (c) {
          const items: InvoiceItem[] = [
            lineFromCatalog("CON-GEN", 1, { description: `Consultation — ${c.doctor}` }),
            ...c.rx.slice(0, 3).map((rx, i) => lineFromCatalog("PH-PCM", 1, {
              id: `rx-${i}`, description: `${rx.drug}${rx.strength ? " " + rx.strength : ""}`, taxable: true, unitPrice: 80,
            } as Partial<InvoiceItem>)),
          ];
          create("opd", c.id, items);
        }
      } else if (preSource === "ipd") {
        const a = admissions.find((x) => x.id === preSourceId);
        if (a) {
          const days = Math.max(1, Math.ceil((Date.now() - new Date(a.admittedAt).getTime()) / 86400000));
          const items: InvoiceItem[] = [
            lineFromCatalog("RM-GEN", days),
            lineFromCatalog("PH-IVF", days * 2),
            lineFromCatalog("LAB-CBC", 1),
          ];
          create("ipd", a.id, items);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/billing/invoices" className="inline-flex items-center hover:text-foreground">
          <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to invoices
        </Link>
      </div>

      <PageHeader eyebrow="Billing" title="New invoice" description="Pick a patient, then choose an encounter to pre-populate charges — or start blank." />

      <div className="rounded-lg border border-border bg-card p-5">
        <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Patient</label>
        <Combobox options={patientOptions} value={patientUid} onChange={setPatientUid} placeholder="Search by name or UID…" />
        {patient && (
          <div className="mt-2 text-xs text-muted-foreground">
            {patient.sex} · {patient.age}
            {patient.allergies.length > 0 && <span className="ml-2 text-allergy">Allergies: {patient.allergies.join(", ")}</span>}
          </div>
        )}
      </div>

      {patient && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-5 md:col-span-2 space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Choose source encounter</div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">OPD Consultations</div>
              {opd.length === 0 && <div className="text-sm text-muted-foreground">No recent consultations.</div>}
              {opd.map((c) => (
                <button
                  key={c.id} type="button"
                  onClick={() => create("opd", c.id, [
                    lineFromCatalog("CON-GEN", 1, { description: `Consultation — ${c.doctor}` }),
                    ...c.rx.slice(0, 4).map((rx, i) => lineFromCatalog("PH-PCM", 1, {
                      id: `rx-${i}`, description: `${rx.drug}${rx.strength ? " " + rx.strength : ""}`, taxable: true, unitPrice: 80,
                    } as Partial<InvoiceItem>)),
                  ])}
                  className="flex w-full items-center justify-between rounded border border-border bg-background p-3 text-left hover:border-primary hover:bg-accent/30"
                >
                  <div>
                    <div className="text-sm font-medium">{c.doctor} · {new Date(c.date).toLocaleDateString()}</div>
                    <div className="text-xs text-muted-foreground">{c.diagnoses[0]?.text ?? "—"} · {c.rx.length} medication(s)</div>
                  </div>
                  <span className="rounded bg-primary px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">Use this</span>
                </button>
              ))}
              <div className="mt-3 text-xs font-semibold text-muted-foreground">IPD Admissions</div>
              {ipd.length === 0 && <div className="text-sm text-muted-foreground">No admissions.</div>}
              {ipd.map((a) => {
                const days = Math.max(1, Math.ceil((Date.now() - new Date(a.admittedAt).getTime()) / 86400000));
                const estimate = days * 2500 + days * 220 + 350;
                return (
                  <button
                    key={a.id} type="button"
                    onClick={() => create("ipd", a.id, [
                      lineFromCatalog("RM-GEN", days),
                      lineFromCatalog("PH-IVF", days * 2),
                      lineFromCatalog("LAB-CBC", 1),
                    ])}
                    className="flex w-full items-center justify-between rounded border border-border bg-background p-3 text-left hover:border-primary hover:bg-accent/30"
                  >
                    <div>
                      <div className="text-sm font-medium">{a.admissionNo} · {a.ward} {a.bedNumber}</div>
                      <div className="text-xs text-muted-foreground">{a.reason} · {days} day(s)</div>
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground">~{money(estimate)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Or start blank</div>
              <p className="mt-1.5 text-sm text-muted-foreground">Create an empty draft and add charges manually.</p>
              <Button
                variant="outline" className="mt-3 w-full"
                onClick={() => create("walkin", undefined, [lineFromCatalog("MISC-REG")])}
              >
                <FilePlus2 className="mr-2 h-4 w-4" /> Blank invoice
              </Button>
            </div>
            <div className="rounded-lg border border-border bg-card p-5 text-xs text-muted-foreground">
              <FileX2 className="mb-2 h-4 w-4" />
              Tip: All invoices start as <span className="font-medium text-foreground">Draft</span>. Add or remove charges, then collect payment from the workspace.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default NewInvoice;
