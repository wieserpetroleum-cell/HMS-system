import * as React from "react";

import { Plus, Settings2, Percent, Copy } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAdmin } from "@/lib/admin-store";
import type { PayerType, RatePlan } from "@/lib/types";
import { money } from "@/lib/money";

  component: RatesPage,
});

function RatesPage() {
  const { plans, services, savePlan, removePlan, updateRate, bulkAdjustPlan, copyRatesFrom } = useAdmin();
  const [activeId, setActiveId] = React.useState<string>(plans[0]?.id ?? "");
  const [editPlan, setEditPlan] = React.useState<RatePlan | null>(null);
  const [bulkOpen, setBulkOpen] = React.useState(false);
  const [pct, setPct] = React.useState(-5);
  const [bulkCat, setBulkCat] = React.useState<string>("all");
  const [copyFrom, setCopyFrom] = React.useState("");

  const active = plans.find((p) => p.id === activeId);
  const defaultRateFor = (sid: string) => services.find((s) => s.id === sid)?.defaultRate ?? 0;

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        eyebrow="Module 10 · Configuration"
        title="Rate plan management"
        description="Per-payer rate negotiations. Edit cells inline, bulk-adjust or copy from another plan."
        right={
          <Button size="sm" onClick={() => setEditPlan({ id: `rp_${Date.now()}`, name: "", payerType: "corporate", active: true, rates: {} })}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> New plan
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <SectionCard title="Plans">
          <ul className="space-y-1">
            {plans.map((p) => (
              <li key={p.id}>
                <button onClick={() => setActiveId(p.id)} className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${activeId === p.id ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"}`}>
                  <div className="font-medium">{p.name}</div>
                  <div className={`text-[10px] capitalize ${activeId === p.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{p.payerType} · {p.active ? "active" : "inactive"}</div>
                </button>
              </li>
            ))}
          </ul>
        </SectionCard>

        {active ? (
          <SectionCard
            title={active.name}
            description={active.description ?? "Inline-edit cells to negotiate rates per service."}
            right={
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setBulkOpen(true)}><Percent className="mr-1.5 h-3.5 w-3.5" /> Bulk adjust</Button>
                <Button size="sm" variant="outline" onClick={() => setEditPlan(active)}><Settings2 className="mr-1.5 h-3.5 w-3.5" /> Settings</Button>
                <select className="h-8 rounded-md border bg-background px-2 text-xs" value={copyFrom} onChange={(e) => setCopyFrom(e.target.value)}>
                  <option value="">Copy rates from…</option>
                  {plans.filter((p) => p.id !== active.id).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <Button size="sm" variant="outline" disabled={!copyFrom} onClick={() => { copyRatesFrom(active.id, copyFrom); setCopyFrom(""); }}><Copy className="mr-1.5 h-3.5 w-3.5" /> Apply</Button>
              </div>
            }
          >
            <div className="overflow-hidden rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground"><tr><th className="px-3 py-2 text-left">Service</th><th className="px-3 py-2 text-left">Category</th><th className="px-3 py-2 text-right">GST</th><th className="px-3 py-2 text-right">Default</th><th className="px-3 py-2 text-right">Plan rate</th><th className="px-3 py-2 text-right">Diff</th></tr></thead>
                <tbody>
                  {services.map((s) => {
                    const planRate = active.rates[s.id] ?? s.defaultRate;
                    const diff = s.defaultRate ? ((planRate - s.defaultRate) / s.defaultRate) * 100 : 0;
                    return (
                      <tr key={s.id} className="border-t">
                        <td className="px-3 py-2"><div className="font-medium">{s.name}</div><div className="font-mono text-[10px] text-muted-foreground">{s.code}</div></td>
                        <td className="px-3 py-2 text-xs capitalize">{s.category}</td>
                        <td className="px-3 py-2 text-right text-xs">{s.gstRate}%</td>
                        <td className="px-3 py-2 text-right text-xs text-muted-foreground">{money(defaultRateFor(s.id))}</td>
                        <td className="px-3 py-2 text-right">
                          <Input type="number" value={planRate} onChange={(e) => updateRate(active.id, s.id, Number(e.target.value))} className="h-7 w-24 ml-auto text-right text-xs" />
                        </td>
                        <td className={`px-3 py-2 text-right text-xs ${diff < 0 ? "text-status-ok" : diff > 0 ? "text-allergy" : "text-muted-foreground"}`}>
                          {diff === 0 ? "—" : `${diff > 0 ? "+" : ""}${diff.toFixed(1)}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        ) : (
          <SectionCard><p className="text-sm text-muted-foreground">Select a plan to edit rates.</p></SectionCard>
        )}
      </div>

      {/* Plan settings */}
      <Sheet open={!!editPlan} onOpenChange={(o) => !o && setEditPlan(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader><SheetTitle>{editPlan?.name ? "Plan settings" : "New plan"}</SheetTitle></SheetHeader>
          {editPlan && (
            <div className="mt-4 space-y-3">
              <Field label="Name"><Input value={editPlan.name} onChange={(e) => setEditPlan({ ...editPlan, name: e.target.value })} /></Field>
              <Field label="Payer type">
                <select className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={editPlan.payerType} onChange={(e) => setEditPlan({ ...editPlan, payerType: e.target.value as PayerType })}>
                  <option value="self">Self</option><option value="corporate">Corporate</option><option value="insurance">Insurance</option><option value="govt">Government</option><option value="camp">Camp</option>
                </select>
              </Field>
              <Field label="Description"><Input value={editPlan.description ?? ""} onChange={(e) => setEditPlan({ ...editPlan, description: e.target.value })} /></Field>
              <div className="flex items-center justify-between rounded border px-3 py-2"><Label>Active</Label><Switch checked={editPlan.active} onCheckedChange={(v) => setEditPlan({ ...editPlan, active: v })} /></div>
              <div className="flex justify-between gap-2 pt-2">
                {!editPlan.id.startsWith("rp_self") && plans.some((p) => p.id === editPlan.id) && (
                  <Button variant="ghost" size="sm" className="text-allergy" onClick={() => { removePlan(editPlan.id); if (activeId === editPlan.id) setActiveId(plans[0]?.id ?? ""); setEditPlan(null); }}>Delete</Button>
                )}
                <div className="ml-auto flex gap-2"><Button variant="outline" size="sm" onClick={() => setEditPlan(null)}>Cancel</Button><Button size="sm" onClick={() => { savePlan({ ...editPlan, rates: editPlan.rates ?? {} }); setActiveId(editPlan.id); setEditPlan(null); }}>Save</Button></div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Bulk adjust */}
      <Sheet open={bulkOpen} onOpenChange={setBulkOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader><SheetTitle>Bulk adjust rates</SheetTitle></SheetHeader>
          {active && (
            <div className="mt-4 space-y-3">
              <Field label="Adjustment %">
                <Input type="number" value={pct} onChange={(e) => setPct(Number(e.target.value))} />
              </Field>
              <Field label="Apply to">
                <select className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={bulkCat} onChange={(e) => setBulkCat(e.target.value)}>
                  <option value="all">All categories</option>
                  {["consultation", "procedure", "radiology", "nursing", "bed", "misc"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <p className="text-xs text-muted-foreground">Negative values reduce rates (discount). Positive values increase.</p>
              <div className="flex justify-end gap-2 pt-2"><Button variant="outline" size="sm" onClick={() => setBulkOpen(false)}>Cancel</Button><Button size="sm" onClick={() => { bulkAdjustPlan(active.id, pct, bulkCat === "all" ? undefined : bulkCat); setBulkOpen(false); }}>Apply</Button></div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</Label>{children}</div>;
}export default RatesPage;
