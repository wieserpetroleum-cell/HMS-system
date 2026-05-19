import * as React from "react";

import { Eye, Save } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAdmin } from "@/lib/admin-store";
import type { HospitalProfile } from "@/lib/types";
function HospitalProfilePage() {
  const { hospital, saveHospital } = useAdmin();
  const [form, setForm] = React.useState<HospitalProfile>(hospital);
  const [preview, setPreview] = React.useState<"letter" | "invoice" | null>(null);
  const [saved, setSaved] = React.useState(false);

  const u = <K extends keyof HospitalProfile>(k: K, v: HospitalProfile[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const uMod = (k: keyof HospitalProfile["modules"], v: boolean) =>
    setForm((f) => ({ ...f, modules: { ...f.modules, [k]: v } }));

  const onSave = () => {
    saveHospital(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        eyebrow="Module 10 · Configuration"
        title="Hospital profile"
        description="Identity, contact, statutory IDs, billing, branding and module toggles."
        right={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setPreview("letter")}>
              <Eye className="mr-1.5 h-3.5 w-3.5" /> Letterhead
            </Button>
            <Button size="sm" variant="outline" onClick={() => setPreview("invoice")}>
              <Eye className="mr-1.5 h-3.5 w-3.5" /> Invoice
            </Button>
            <Button size="sm" onClick={onSave}>
              <Save className="mr-1.5 h-3.5 w-3.5" /> {saved ? "Saved" : "Save"}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Identity">
          <div className="space-y-3">
            <Field label="Hospital name"><Input value={form.name} onChange={(e) => u("name", e.target.value)} /></Field>
            <Field label="Tagline"><Input value={form.tagline ?? ""} onChange={(e) => u("tagline", e.target.value)} /></Field>
            <Field label="Hospital type">
              <select className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={form.type} onChange={(e) => u("type", e.target.value as HospitalProfile["type"])}>
                <option value="single">Single Speciality</option>
                <option value="multi">Multi-Speciality</option>
                <option value="super">Super Speciality</option>
              </select>
            </Field>
            <Field label="Logo URL"><Input value={form.logoUrl ?? ""} onChange={(e) => u("logoUrl", e.target.value)} placeholder="https://…" /></Field>
          </div>
        </SectionCard>

        <SectionCard title="Contact">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Address line 1"><Input value={form.address1} onChange={(e) => u("address1", e.target.value)} /></Field>
              <Field label="Address line 2"><Input value={form.address2 ?? ""} onChange={(e) => u("address2", e.target.value)} /></Field>
              <Field label="City"><Input value={form.city} onChange={(e) => u("city", e.target.value)} /></Field>
              <Field label="State"><Input value={form.state} onChange={(e) => u("state", e.target.value)} /></Field>
              <Field label="Pincode"><Input value={form.pincode} onChange={(e) => u("pincode", e.target.value)} /></Field>
              <Field label="Website"><Input value={form.website ?? ""} onChange={(e) => u("website", e.target.value)} /></Field>
            </div>
            <Field label="Phone numbers (comma separated)">
              <Input value={form.phones.join(", ")} onChange={(e) => u("phones", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
            </Field>
            <Field label="Emails (comma separated)">
              <Input value={form.emails.join(", ")} onChange={(e) => u("emails", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Statutory IDs">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Clinical Establishment (CER)"><Input value={form.cerNumber ?? ""} onChange={(e) => u("cerNumber", e.target.value)} /></Field>
            <Field label="GSTIN"><Input value={form.gstin ?? ""} onChange={(e) => u("gstin", e.target.value)} /></Field>
            <Field label="PNDT registration"><Input value={form.pndtNumber ?? ""} onChange={(e) => u("pndtNumber", e.target.value)} /></Field>
            <Field label="AERB licence"><Input value={form.aerbNumber ?? ""} onChange={(e) => u("aerbNumber", e.target.value)} /></Field>
            <Field label="NABH accreditation"><Input value={form.nabhNumber ?? ""} onChange={(e) => u("nabhNumber", e.target.value)} /></Field>
            <Field label="NABH expiry"><Input type="date" value={form.nabhExpiry ?? ""} onChange={(e) => u("nabhExpiry", e.target.value)} /></Field>
            <Field label="NABL number"><Input value={form.nablNumber ?? ""} onChange={(e) => u("nablNumber", e.target.value)} /></Field>
            <Field label="NABL expiry"><Input type="date" value={form.nablExpiry ?? ""} onChange={(e) => u("nablExpiry", e.target.value)} /></Field>
          </div>
        </SectionCard>

        <SectionCard title="Billing">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Invoice prefix"><Input value={form.invoicePrefix} onChange={(e) => u("invoicePrefix", e.target.value)} /></Field>
            <Field label="Starting number"><Input type="number" value={form.invoiceStartingNumber} onChange={(e) => u("invoiceStartingNumber", Number(e.target.value))} /></Field>
            <Field label="FY start month (1-12)"><Input type="number" min={1} max={12} value={form.fyStartMonth} onChange={(e) => u("fyStartMonth", Number(e.target.value))} /></Field>
            <Field label="GST type">
              <select className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={form.gstType} onChange={(e) => u("gstType", e.target.value as HospitalProfile["gstType"])}>
                <option value="regular">Regular</option>
                <option value="composition">Composition</option>
              </select>
            </Field>
          </div>
          <div className="mt-3">
            <Field label="Invoice footer"><Textarea rows={2} value={form.invoiceFooter ?? ""} onChange={(e) => u("invoiceFooter", e.target.value)} /></Field>
          </div>
        </SectionCard>

        <SectionCard title="Branding">
          <div className="space-y-3">
            <Field label="Primary brand colour">
              <div className="flex items-center gap-2">
                <input type="color" value={form.primaryColor} onChange={(e) => u("primaryColor", e.target.value)} className="h-9 w-12 cursor-pointer rounded border" />
                <Input className="flex-1" value={form.primaryColor} onChange={(e) => u("primaryColor", e.target.value)} />
              </div>
            </Field>
            <Field label="Report header"><Input value={form.reportHeader ?? ""} onChange={(e) => u("reportHeader", e.target.value)} /></Field>
            <Field label="Report footer"><Input value={form.reportFooter ?? ""} onChange={(e) => u("reportFooter", e.target.value)} /></Field>
          </div>
        </SectionCard>

        <SectionCard title="Modules">
          <div className="space-y-2">
            {(["ipd", "radiology", "tpa", "whatsapp", "sms", "paymentLinks"] as const).map((m) => (
              <div key={m} className="flex items-center justify-between rounded border bg-muted/20 px-3 py-2">
                <Label className="text-sm capitalize">{m.replace(/([A-Z])/g, " $1")}</Label>
                <Switch checked={form.modules[m]} onCheckedChange={(v) => uMod(m, v)} />
              </div>
            ))}
            <div className="flex items-center justify-between rounded border bg-muted/10 px-3 py-2 text-muted-foreground">
              <Label className="text-sm">OPD (core, always on)</Label>
              <Switch checked disabled />
            </div>
          </div>
        </SectionCard>
      </div>

      <Sheet open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{preview === "letter" ? "Letterhead preview" : "Invoice preview"}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 rounded border bg-white p-6 text-slate-900 shadow-sm">
            <div className="border-b-4 pb-3" style={{ borderColor: form.primaryColor }}>
              <div className="text-xl font-bold" style={{ color: form.primaryColor }}>{form.name}</div>
              {form.tagline && <div className="text-xs text-slate-500">{form.tagline}</div>}
              <div className="mt-1 text-[11px] text-slate-600">
                {form.address1}, {form.city}, {form.state} — {form.pincode}
                <br />
                {form.phones.join(" · ")} · {form.emails[0]}
              </div>
            </div>
            {preview === "letter" ? (
              <div className="py-6 text-sm">
                <p className="mb-2 text-slate-500">Date: {new Date().toLocaleDateString()}</p>
                <p>To Whom It May Concern,</p>
                <p className="mt-3">This is a sample letterhead preview rendered with your saved brand colour and contact block.</p>
              </div>
            ) : (
              <div className="py-6 text-sm">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">TAX INVOICE</div>
                  <div className="text-xs text-slate-500">
                    {form.invoicePrefix}-{form.invoiceStartingNumber} · {form.gstType.toUpperCase()}
                  </div>
                </div>
                <table className="mt-3 w-full text-xs">
                  <thead className="bg-slate-100"><tr><th className="p-2 text-left">Item</th><th className="p-2 text-right">Qty</th><th className="p-2 text-right">Rate</th><th className="p-2 text-right">Amount</th></tr></thead>
                  <tbody>
                    <tr className="border-b"><td className="p-2">Consultation</td><td className="p-2 text-right">1</td><td className="p-2 text-right">600</td><td className="p-2 text-right">600</td></tr>
                    <tr className="border-b"><td className="p-2">ECG</td><td className="p-2 text-right">1</td><td className="p-2 text-right">450</td><td className="p-2 text-right">450</td></tr>
                  </tbody>
                </table>
                <div className="mt-3 text-right text-xs">
                  Total: <span className="font-semibold">₹1,050</span>
                </div>
                {form.invoiceFooter && <p className="mt-4 text-[10px] text-slate-500">{form.invoiceFooter}</p>}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}export default HospitalProfilePage;
