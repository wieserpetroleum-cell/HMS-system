import * as React from "react";

import { Plus, Pencil, Trash2, Layers } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAdmin } from "@/lib/admin-store";
import type { BedCategory, ConfiguredBed, Ward } from "@/lib/types";
import { money } from "@/lib/money";
function BedsPage() {
  const { wards, beds, bedCategories, saveWard, removeWard, saveBedCategory, removeBedCategory, saveBed, removeBed, bulkAddBeds } = useAdmin();
  const [expanded, setExpanded] = React.useState<string | null>(wards[0]?.id ?? null);
  const [editWard, setEditWard] = React.useState<Ward | null>(null);
  const [editCat, setEditCat] = React.useState<BedCategory | null>(null);
  const [editBed, setEditBed] = React.useState<ConfiguredBed | null>(null);
  const [bulk, setBulk] = React.useState<{ wardId: string; categoryId: string; prefix: string; start: number; count: number; dailyRate: number } | null>(null);

  const bedsByWard = (id: string) => beds.filter((b) => b.wardId === id);

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        eyebrow="Administration"
        title="Beds & wards"
        description="Wards, bed categories, and configured beds with daily rates."
        right={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setBulk({ wardId: wards[0]?.id ?? "", categoryId: bedCategories[0]?.id ?? "", prefix: "BED", start: 1, count: 5, dailyRate: bedCategories[0]?.defaultDailyRate ?? 2500 })}>
              <Layers className="mr-1.5 h-3.5 w-3.5" /> Bulk add
            </Button>
            <Button size="sm" onClick={() => setEditWard({ id: `w_${Date.now()}`, name: "", floor: 1, gender: "mixed", status: "active" })}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add ward
            </Button>
          </div>
        }
      />

      <SectionCard title="Wards" description="Click a ward to expand and view its beds.">
        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
              <tr><th className="px-3 py-2 text-left">Ward</th><th className="px-3 py-2 text-left">Floor</th><th className="px-3 py-2 text-left">Gender</th><th className="px-3 py-2 text-right">Beds</th><th className="px-3 py-2 text-left">Status</th><th className="px-3 py-2 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {wards.map((w) => (
                <React.Fragment key={w.id}>
                  <tr className="border-t cursor-pointer hover:bg-muted/30" onClick={() => setExpanded(expanded === w.id ? null : w.id)}>
                    <td className="px-3 py-2 font-medium">{w.name}</td>
                    <td className="px-3 py-2 text-xs">{w.floor}</td>
                    <td className="px-3 py-2 text-xs capitalize">{w.gender}</td>
                    <td className="px-3 py-2 text-right text-xs">{bedsByWard(w.id).length}</td>
                    <td className="px-3 py-2 text-xs capitalize">{w.status}</td>
                    <td className="px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="ghost" className="h-7" onClick={() => setEditBed({ id: `cb_${Date.now()}`, wardId: w.id, bedNumber: "", categoryId: bedCategories[0]?.id ?? "", dailyRate: bedCategories[0]?.defaultDailyRate ?? 0, equipment: [], active: true })}><Plus className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7" onClick={() => setEditWard(w)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 text-allergy" onClick={() => removeWard(w.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </td>
                  </tr>
                  {expanded === w.id && (
                    <tr className="bg-muted/10"><td colSpan={6} className="p-3">
                      {bedsByWard(w.id).length ? (
                        <table className="w-full text-xs">
                          <thead className="text-[10px] uppercase tracking-wide text-muted-foreground"><tr><th className="px-2 py-1 text-left">Bed #</th><th className="px-2 py-1 text-left">Category</th><th className="px-2 py-1 text-right">Daily rate</th><th className="px-2 py-1 text-left">Equipment</th><th className="px-2 py-1 text-left">Active</th><th className="px-2 py-1 text-right">Actions</th></tr></thead>
                          <tbody>
                            {bedsByWard(w.id).map((b) => (
                              <tr key={b.id} className="border-t">
                                <td className="px-2 py-1 font-medium">{b.bedNumber}</td>
                                <td className="px-2 py-1">{bedCategories.find((c) => c.id === b.categoryId)?.name ?? "—"}</td>
                                <td className="px-2 py-1 text-right">{money(b.dailyRate)}</td>
                                <td className="px-2 py-1 text-muted-foreground">{b.equipment.join(", ") || "—"}</td>
                                <td className="px-2 py-1">{b.active ? "✓" : "—"}</td>
                                <td className="px-2 py-1 text-right">
                                  <Button size="sm" variant="ghost" className="h-6" onClick={() => setEditBed(b)}><Pencil className="h-3 w-3" /></Button>
                                  <Button size="sm" variant="ghost" className="h-6 text-allergy" onClick={() => removeBed(b.id)}><Trash2 className="h-3 w-3" /></Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-xs text-muted-foreground">No beds configured. Use + to add one.</div>
                      )}
                    </td></tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Bed categories" right={<Button size="sm" variant="outline" onClick={() => setEditCat({ id: `bc_${Date.now()}`, name: "", defaultDailyRate: 0 })}><Plus className="mr-1.5 h-3.5 w-3.5" /> Add category</Button>}>
        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground"><tr><th className="px-3 py-2 text-left">Name</th><th className="px-3 py-2 text-right">Default daily rate</th><th className="px-3 py-2 text-right">Actions</th></tr></thead>
            <tbody>
              {bedCategories.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{c.name}</td>
                  <td className="px-3 py-2 text-right">{money(c.defaultDailyRate)}</td>
                  <td className="px-3 py-2 text-right">
                    <Button size="sm" variant="ghost" className="h-7" onClick={() => setEditCat(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="h-7 text-allergy" onClick={() => removeBedCategory(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Ward drawer */}
      <Sheet open={!!editWard} onOpenChange={(o) => !o && setEditWard(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader><SheetTitle>{editWard?.name ? "Edit ward" : "New ward"}</SheetTitle></SheetHeader>
          {editWard && (
            <div className="mt-4 space-y-3">
              <Field label="Name"><Input value={editWard.name} onChange={(e) => setEditWard({ ...editWard, name: e.target.value })} /></Field>
              <Field label="Floor"><Input type="number" value={editWard.floor} onChange={(e) => setEditWard({ ...editWard, floor: Number(e.target.value) })} /></Field>
              <Field label="Gender">
                <select className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={editWard.gender} onChange={(e) => setEditWard({ ...editWard, gender: e.target.value as Ward["gender"] })}>
                  <option value="mixed">Mixed</option><option value="male">Male</option><option value="female">Female</option>
                </select>
              </Field>
              <div className="flex items-center justify-between rounded border px-3 py-2"><Label>Active</Label><Switch checked={editWard.status === "active"} onCheckedChange={(v) => setEditWard({ ...editWard, status: v ? "active" : "inactive" })} /></div>
              <div className="flex justify-end gap-2 pt-2"><Button variant="outline" size="sm" onClick={() => setEditWard(null)}>Cancel</Button><Button size="sm" onClick={() => { saveWard(editWard); setEditWard(null); }}>Save</Button></div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Category drawer */}
      <Sheet open={!!editCat} onOpenChange={(o) => !o && setEditCat(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader><SheetTitle>{editCat?.name ? "Edit category" : "New category"}</SheetTitle></SheetHeader>
          {editCat && (
            <div className="mt-4 space-y-3">
              <Field label="Name"><Input value={editCat.name} onChange={(e) => setEditCat({ ...editCat, name: e.target.value })} /></Field>
              <Field label="Default daily rate"><Input type="number" value={editCat.defaultDailyRate} onChange={(e) => setEditCat({ ...editCat, defaultDailyRate: Number(e.target.value) })} /></Field>
              <div className="flex justify-end gap-2 pt-2"><Button variant="outline" size="sm" onClick={() => setEditCat(null)}>Cancel</Button><Button size="sm" onClick={() => { saveBedCategory(editCat); setEditCat(null); }}>Save</Button></div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Bed drawer */}
      <Sheet open={!!editBed} onOpenChange={(o) => !o && setEditBed(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader><SheetTitle>{editBed?.bedNumber ? "Edit bed" : "New bed"}</SheetTitle></SheetHeader>
          {editBed && (
            <div className="mt-4 space-y-3">
              <Field label="Ward">
                <select className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={editBed.wardId} onChange={(e) => setEditBed({ ...editBed, wardId: e.target.value })}>
                  {wards.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </Field>
              <Field label="Bed number"><Input value={editBed.bedNumber} onChange={(e) => setEditBed({ ...editBed, bedNumber: e.target.value })} /></Field>
              <Field label="Category">
                <select className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={editBed.categoryId} onChange={(e) => { const cat = bedCategories.find((c) => c.id === e.target.value); setEditBed({ ...editBed, categoryId: e.target.value, dailyRate: cat?.defaultDailyRate ?? editBed.dailyRate }); }}>
                  {bedCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Daily rate"><Input type="number" value={editBed.dailyRate} onChange={(e) => setEditBed({ ...editBed, dailyRate: Number(e.target.value) })} /></Field>
              <Field label="Equipment (comma separated)"><Input value={editBed.equipment.join(", ")} onChange={(e) => setEditBed({ ...editBed, equipment: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></Field>
              <div className="flex items-center justify-between rounded border px-3 py-2"><Label>Active</Label><Switch checked={editBed.active} onCheckedChange={(v) => setEditBed({ ...editBed, active: v })} /></div>
              <div className="flex justify-end gap-2 pt-2"><Button variant="outline" size="sm" onClick={() => setEditBed(null)}>Cancel</Button><Button size="sm" onClick={() => { saveBed(editBed); setEditBed(null); }}>Save</Button></div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Bulk add */}
      <Sheet open={!!bulk} onOpenChange={(o) => !o && setBulk(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader><SheetTitle>Bulk add beds</SheetTitle></SheetHeader>
          {bulk && (
            <div className="mt-4 space-y-3">
              <Field label="Ward">
                <select className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={bulk.wardId} onChange={(e) => setBulk({ ...bulk, wardId: e.target.value })}>
                  {wards.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </Field>
              <Field label="Category">
                <select className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={bulk.categoryId} onChange={(e) => { const cat = bedCategories.find((c) => c.id === e.target.value); setBulk({ ...bulk, categoryId: e.target.value, dailyRate: cat?.defaultDailyRate ?? bulk.dailyRate }); }}>
                  {bedCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-3 gap-2">
                <Field label="Prefix"><Input value={bulk.prefix} onChange={(e) => setBulk({ ...bulk, prefix: e.target.value })} /></Field>
                <Field label="Start #"><Input type="number" value={bulk.start} onChange={(e) => setBulk({ ...bulk, start: Number(e.target.value) })} /></Field>
                <Field label="Count"><Input type="number" value={bulk.count} onChange={(e) => setBulk({ ...bulk, count: Number(e.target.value) })} /></Field>
              </div>
              <Field label="Daily rate"><Input type="number" value={bulk.dailyRate} onChange={(e) => setBulk({ ...bulk, dailyRate: Number(e.target.value) })} /></Field>
              <div className="rounded border bg-muted/20 p-3 text-xs text-muted-foreground">
                Will create {bulk.count} beds: {Array.from({ length: Math.min(bulk.count, 4) }).map((_, i) => `${bulk.prefix}-${String(bulk.start + i).padStart(2, "0")}`).join(", ")}{bulk.count > 4 ? `, …` : ""}
              </div>
              <div className="flex justify-end gap-2 pt-2"><Button variant="outline" size="sm" onClick={() => setBulk(null)}>Cancel</Button><Button size="sm" onClick={() => { bulkAddBeds(bulk); setBulk(null); }}>Create</Button></div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</Label>{children}</div>;
}export default BedsPage;
