import * as React from "react";

import { Plus, Pencil, Trash2, Upload, Download, Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAdmin } from "@/lib/admin-store";
import type { Modality, ServiceCategory, ServiceItem } from "@/lib/types";
import { money } from "@/lib/money";

  component: ServicesPage,
});

const CATEGORIES: ServiceCategory[] = ["consultation", "procedure", "radiology", "nursing", "bed", "misc"];
const MODALITIES: Modality[] = ["xray", "ct", "mri", "usg", "mammo", "dexa"];

function ServicesPage() {
  const { services, departments, saveService, removeService } = useAdmin();
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState<ServiceCategory | "all">("all");
  const [edit, setEdit] = React.useState<ServiceItem | null>(null);
  const [importOpen, setImportOpen] = React.useState(false);
  const [csvPreview, setCsvPreview] = React.useState<ServiceItem[]>([]);

  const filtered = services.filter((s) => {
    if (cat !== "all" && s.category !== cat) return false;
    const t = q.trim().toLowerCase();
    if (t && !`${s.code} ${s.name}`.toLowerCase().includes(t)) return false;
    return true;
  });

  const downloadTemplate = () => {
    const csv = "code,name,category,hsnSac,gstRate,defaultRate,isRadiology,modality,tatHours\nNEW-CODE,Sample service,procedure,999319,5,500,false,,\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "services-template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const onCsvUpload = async (file: File) => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const [header, ...rows] = lines;
    if (!header) return;
    const cols = header.split(",").map((c) => c.trim());
    const items: ServiceItem[] = rows.map((row, i) => {
      const v = row.split(",");
      const obj: Record<string, string> = {};
      cols.forEach((c, idx) => (obj[c] = v[idx] ?? ""));
      return {
        id: `sv_imp_${Date.now()}_${i}`,
        code: obj.code || `IMP-${i}`,
        name: obj.name || "(unnamed)",
        category: (CATEGORIES.includes(obj.category as ServiceCategory) ? obj.category : "misc") as ServiceCategory,
        hsnSac: obj.hsnSac || undefined,
        gstRate: ([0, 5, 12, 18].includes(Number(obj.gstRate)) ? Number(obj.gstRate) : 0) as ServiceItem["gstRate"],
        defaultRate: Number(obj.defaultRate) || 0,
        isRadiology: obj.isRadiology === "true",
        modality: (MODALITIES.includes(obj.modality as Modality) ? (obj.modality as Modality) : undefined),
        tatHours: obj.tatHours ? Number(obj.tatHours) : undefined,
        status: "active",
      };
    });
    setCsvPreview(items);
  };

  const confirmImport = () => {
    csvPreview.forEach((s) => saveService(s));
    setCsvPreview([]);
    setImportOpen(false);
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        eyebrow="Module 10 · Configuration"
        title="Service / charge master"
        description="Catalogue of every billable service. HSN/SAC, GST, default rate and radiology metadata."
        right={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setImportOpen(true)}><Upload className="mr-1.5 h-3.5 w-3.5" /> Bulk import</Button>
            <Button size="sm" onClick={() => setEdit({ id: `sv_${Date.now()}`, code: "", name: "", category: "procedure", gstRate: 0, defaultRate: 0, isRadiology: false, status: "active" })}><Plus className="mr-1.5 h-3.5 w-3.5" /> Add service</Button>
          </div>
        }
      />

      <div className="rounded-lg border bg-card p-3">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search code or name…" className="pl-8" />
          </div>
          <div className="flex flex-wrap gap-1">
            {(["all", ...CATEGORIES] as const).map((c) => (
              <Button key={c} size="sm" variant={cat === c ? "default" : "outline"} className="h-7 text-xs capitalize" onClick={() => setCat(c as ServiceCategory | "all")}>{c}</Button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground"><tr><th className="px-3 py-2 text-left">Code</th><th className="px-3 py-2 text-left">Name</th><th className="px-3 py-2 text-left">Category</th><th className="px-3 py-2 text-left">Dept.</th><th className="px-3 py-2 text-left">HSN/SAC</th><th className="px-3 py-2 text-right">GST</th><th className="px-3 py-2 text-right">Rate</th><th className="px-3 py-2 text-right">Actions</th></tr></thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-t hover:bg-muted/30">
                <td className="px-3 py-2 font-mono text-xs">{s.code}</td>
                <td className="px-3 py-2 font-medium">{s.name}{s.isRadiology && <span className="ml-2 text-[10px] uppercase text-status-info">{s.modality}</span>}</td>
                <td className="px-3 py-2 capitalize text-xs">{s.category}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{departments.find((d) => d.id === s.departmentId)?.name ?? "—"}</td>
                <td className="px-3 py-2 text-xs">{s.hsnSac ?? "—"}</td>
                <td className="px-3 py-2 text-right text-xs">{s.gstRate}%</td>
                <td className="px-3 py-2 text-right">{money(s.defaultRate)}</td>
                <td className="px-3 py-2 text-right">
                  <Button size="sm" variant="ghost" className="h-7" onClick={() => setEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="ghost" className="h-7 text-allergy" onClick={() => removeService(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={8} className="px-3 py-8 text-center text-sm text-muted-foreground">No services match.</td></tr>}
          </tbody>
        </table>
      </div>

      <Sheet open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader><SheetTitle>{edit?.code ? "Edit service" : "New service"}</SheetTitle></SheetHeader>
          {edit && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Code"><Input value={edit.code} onChange={(e) => setEdit({ ...edit, code: e.target.value })} /></Field>
                <Field label="Category">
                  <select className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value as ServiceCategory })}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Name"><Input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Department">
                  <select className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={edit.departmentId ?? ""} onChange={(e) => setEdit({ ...edit, departmentId: e.target.value || undefined })}>
                    <option value="">— None —</option>
                    {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </Field>
                <Field label="HSN/SAC"><Input value={edit.hsnSac ?? ""} onChange={(e) => setEdit({ ...edit, hsnSac: e.target.value })} /></Field>
                <Field label="GST rate">
                  <select className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={edit.gstRate} onChange={(e) => setEdit({ ...edit, gstRate: Number(e.target.value) as ServiceItem["gstRate"] })}>
                    <option value={0}>0%</option><option value={5}>5%</option><option value={12}>12%</option><option value={18}>18%</option>
                  </select>
                </Field>
                <Field label="Default rate"><Input type="number" value={edit.defaultRate} onChange={(e) => setEdit({ ...edit, defaultRate: Number(e.target.value) })} /></Field>
              </div>
              <div className="flex items-center justify-between rounded border px-3 py-2"><Label>Radiology service</Label><Switch checked={edit.isRadiology} onCheckedChange={(v) => setEdit({ ...edit, isRadiology: v })} /></div>
              {edit.isRadiology && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Modality">
                    <select className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={edit.modality ?? ""} onChange={(e) => setEdit({ ...edit, modality: e.target.value as Modality })}>
                      <option value="">—</option>
                      {MODALITIES.map((m) => <option key={m} value={m}>{m.toUpperCase()}</option>)}
                    </select>
                  </Field>
                  <Field label="TAT (hours)"><Input type="number" value={edit.tatHours ?? 0} onChange={(e) => setEdit({ ...edit, tatHours: Number(e.target.value) })} /></Field>
                </div>
              )}
              <div className="flex items-center justify-between rounded border px-3 py-2"><Label>Active</Label><Switch checked={edit.status === "active"} onCheckedChange={(v) => setEdit({ ...edit, status: v ? "active" : "inactive" })} /></div>
              <div className="flex justify-end gap-2 pt-2"><Button variant="outline" size="sm" onClick={() => setEdit(null)}>Cancel</Button><Button size="sm" onClick={() => { saveService(edit); setEdit(null); }}>Save</Button></div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={importOpen} onOpenChange={(o) => { if (!o) { setImportOpen(false); setCsvPreview([]); } }}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader><SheetTitle>Bulk import services</SheetTitle></SheetHeader>
          <div className="mt-4 space-y-4">
            <SectionCard title="1. Download template">
              <Button size="sm" variant="outline" onClick={downloadTemplate}><Download className="mr-1.5 h-3.5 w-3.5" /> services-template.csv</Button>
            </SectionCard>
            <SectionCard title="2. Upload filled CSV">
              <Input type="file" accept=".csv" onChange={(e) => e.target.files?.[0] && onCsvUpload(e.target.files[0])} />
            </SectionCard>
            {csvPreview.length > 0 && (
              <SectionCard title={`3. Preview (${csvPreview.length} rows)`}>
                <div className="max-h-64 overflow-auto rounded border">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/40"><tr><th className="px-2 py-1 text-left">Code</th><th className="px-2 py-1 text-left">Name</th><th className="px-2 py-1 text-left">Category</th><th className="px-2 py-1 text-right">Rate</th><th className="px-2 py-1 text-right">GST</th></tr></thead>
                    <tbody>{csvPreview.map((s) => (<tr key={s.id} className="border-t"><td className="px-2 py-1 font-mono">{s.code}</td><td className="px-2 py-1">{s.name}</td><td className="px-2 py-1">{s.category}</td><td className="px-2 py-1 text-right">{money(s.defaultRate)}</td><td className="px-2 py-1 text-right">{s.gstRate}%</td></tr>))}</tbody>
                  </table>
                </div>
                <div className="mt-3 flex justify-end gap-2"><Button variant="outline" size="sm" onClick={() => setCsvPreview([])}>Discard</Button><Button size="sm" onClick={confirmImport}>Confirm import</Button></div>
              </SectionCard>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</Label>{children}</div>;
}export default ServicesPage;
