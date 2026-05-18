import * as React from "react";

import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAdmin } from "@/lib/admin-store";
import type { Department, DoctorProfile } from "@/lib/types";
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function DeptDoctorsPage() {
  const { departments, doctors, saveDepartment, removeDepartment, saveDoctor, removeDoctor } = useAdmin();
  const [tab, setTab] = React.useState<"dept" | "doc">("dept");
  const [editDept, setEditDept] = React.useState<Department | null>(null);
  const [editDoc, setEditDoc] = React.useState<DoctorProfile | null>(null);

  const blankDept = (): Department => ({
    id: `d_${Date.now()}`, name: "", opdActive: true, ipdActive: false, status: "active",
  });

  const blankDoc = (): DoctorProfile => ({
    id: `doc_${Date.now()}`, firstName: "", lastName: "", speciality: "",
    departmentId: departments[0]?.id ?? "", type: "full-time",
    mciNumber: "", qualification: "", revenueShareModel: "pct-opd",
    revenueSharePct: 30, isRadiologist: false, isPathologist: false,
    status: "active",
    schedule: { daysActive: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "17:00", slotMinutes: 15, opdLocation: "OPD Block A", maxPatients: 30, bufferMinutes: 5, lunchStart: "13:00", lunchEnd: "13:45" },
    leaves: [],
  });

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        eyebrow="Module 10 · Configuration"
        title="Departments & doctors"
        description="Manage clinical departments, doctor profiles, schedules and leaves."
        right={
          <Button size="sm" onClick={() => tab === "dept" ? setEditDept(blankDept()) : setEditDoc(blankDoc())}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> {tab === "dept" ? "Add department" : "Add doctor"}
          </Button>
        }
      />

      <div className="flex gap-1 border-b">
        {(["dept", "doc"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm border-b-2 -mb-px ${tab === t ? "border-primary font-medium text-primary" : "border-transparent text-muted-foreground"}`}>
            {t === "dept" ? `Departments (${departments.length})` : `Doctors (${doctors.length})`}
          </button>
        ))}
      </div>

      {tab === "dept" ? (
        <div className="overflow-hidden rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
              <tr><th className="px-3 py-2 text-left">Name</th><th className="px-3 py-2 text-left">Head</th><th className="px-3 py-2 text-center">OPD</th><th className="px-3 py-2 text-center">IPD</th><th className="px-3 py-2 text-left">Status</th><th className="px-3 py-2 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d.id} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium">{d.name}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{doctors.find((doc) => doc.id === d.headDoctorId)?.firstName ? `Dr. ${doctors.find((doc) => doc.id === d.headDoctorId)!.firstName} ${doctors.find((doc) => doc.id === d.headDoctorId)!.lastName}` : "—"}</td>
                  <td className="px-3 py-2 text-center">{d.opdActive ? "✓" : "—"}</td>
                  <td className="px-3 py-2 text-center">{d.ipdActive ? "✓" : "—"}</td>
                  <td className="px-3 py-2 capitalize text-xs">{d.status}</td>
                  <td className="px-3 py-2 text-right">
                    <Button size="sm" variant="ghost" className="h-7" onClick={() => setEditDept(d)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="h-7 text-allergy" onClick={() => removeDepartment(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
              <tr><th className="px-3 py-2 text-left">Name</th><th className="px-3 py-2 text-left">Speciality</th><th className="px-3 py-2 text-left">Dept.</th><th className="px-3 py-2 text-left">Type</th><th className="px-3 py-2 text-left">MCI</th><th className="px-3 py-2 text-left">Status</th><th className="px-3 py-2 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {doctors.map((d) => (
                <tr key={d.id} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium">Dr. {d.firstName} {d.lastName}</td>
                  <td className="px-3 py-2 text-xs">{d.speciality}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{departments.find((x) => x.id === d.departmentId)?.name ?? "—"}</td>
                  <td className="px-3 py-2 text-xs capitalize">{d.type}</td>
                  <td className="px-3 py-2 text-xs">{d.mciNumber}</td>
                  <td className="px-3 py-2 text-xs capitalize">{d.status}</td>
                  <td className="px-3 py-2 text-right">
                    <Button size="sm" variant="ghost" className="h-7" onClick={() => setEditDoc(d)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="h-7 text-allergy" onClick={() => removeDoctor(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Sheet open={!!editDept} onOpenChange={(o) => !o && setEditDept(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader><SheetTitle>{editDept?.name ? "Edit department" : "New department"}</SheetTitle></SheetHeader>
          {editDept && (
            <div className="mt-4 space-y-3">
              <Field label="Name"><Input value={editDept.name} onChange={(e) => setEditDept({ ...editDept, name: e.target.value })} /></Field>
              <Field label="Head doctor">
                <select className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={editDept.headDoctorId ?? ""} onChange={(e) => setEditDept({ ...editDept, headDoctorId: e.target.value || undefined })}>
                  <option value="">— None —</option>
                  {doctors.map((d) => <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>)}
                </select>
              </Field>
              <div className="flex items-center justify-between rounded border px-3 py-2"><Label>OPD active</Label><Switch checked={editDept.opdActive} onCheckedChange={(v) => setEditDept({ ...editDept, opdActive: v })} /></div>
              <div className="flex items-center justify-between rounded border px-3 py-2"><Label>IPD active</Label><Switch checked={editDept.ipdActive} onCheckedChange={(v) => setEditDept({ ...editDept, ipdActive: v })} /></div>
              <div className="flex items-center justify-between rounded border px-3 py-2"><Label>Active</Label><Switch checked={editDept.status === "active"} onCheckedChange={(v) => setEditDept({ ...editDept, status: v ? "active" : "inactive" })} /></div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setEditDept(null)}>Cancel</Button>
                <Button size="sm" onClick={() => { saveDepartment(editDept); setEditDept(null); }}>Save</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={!!editDoc} onOpenChange={(o) => !o && setEditDoc(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader><SheetTitle>{editDoc?.firstName ? "Edit doctor" : "New doctor"}</SheetTitle></SheetHeader>
          {editDoc && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="First name"><Input value={editDoc.firstName} onChange={(e) => setEditDoc({ ...editDoc, firstName: e.target.value })} /></Field>
                <Field label="Last name"><Input value={editDoc.lastName} onChange={(e) => setEditDoc({ ...editDoc, lastName: e.target.value })} /></Field>
                <Field label="Speciality"><Input value={editDoc.speciality} onChange={(e) => setEditDoc({ ...editDoc, speciality: e.target.value })} /></Field>
                <Field label="Qualification"><Input value={editDoc.qualification} onChange={(e) => setEditDoc({ ...editDoc, qualification: e.target.value })} /></Field>
                <Field label="MCI Number"><Input value={editDoc.mciNumber} onChange={(e) => setEditDoc({ ...editDoc, mciNumber: e.target.value })} /></Field>
                <Field label="MCI Expiry"><Input type="date" value={editDoc.mciExpiry ?? ""} onChange={(e) => setEditDoc({ ...editDoc, mciExpiry: e.target.value })} /></Field>
                <Field label="Mobile"><Input value={editDoc.mobile ?? ""} onChange={(e) => setEditDoc({ ...editDoc, mobile: e.target.value })} /></Field>
                <Field label="Email"><Input type="email" value={editDoc.email ?? ""} onChange={(e) => setEditDoc({ ...editDoc, email: e.target.value })} /></Field>
                <Field label="Department">
                  <select className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={editDoc.departmentId} onChange={(e) => setEditDoc({ ...editDoc, departmentId: e.target.value })}>
                    {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </Field>
                <Field label="Type">
                  <select className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={editDoc.type} onChange={(e) => setEditDoc({ ...editDoc, type: e.target.value as DoctorProfile["type"] })}>
                    <option value="full-time">Full-time</option>
                    <option value="visiting">Visiting</option>
                    <option value="consultant">Consultant</option>
                  </select>
                </Field>
                <Field label="Revenue share model">
                  <select className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={editDoc.revenueShareModel} onChange={(e) => setEditDoc({ ...editDoc, revenueShareModel: e.target.value as DoctorProfile["revenueShareModel"] })}>
                    <option value="pct-opd">% of OPD</option>
                    <option value="pct-ipd">% of IPD</option>
                    <option value="fixed-per-consult">Fixed per consult</option>
                  </select>
                </Field>
                <Field label="Revenue share %"><Input type="number" value={editDoc.revenueSharePct} onChange={(e) => setEditDoc({ ...editDoc, revenueSharePct: Number(e.target.value) })} /></Field>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editDoc.isRadiologist} onChange={(e) => setEditDoc({ ...editDoc, isRadiologist: e.target.checked })} /> Radiologist</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editDoc.isPathologist} onChange={(e) => setEditDoc({ ...editDoc, isPathologist: e.target.checked })} /> Pathologist</label>
              </div>

              <div className="rounded border bg-muted/20 p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Schedule</div>
                <div className="mb-3 flex flex-wrap gap-1">
                  {DAYS.map((d, i) => {
                    const active = editDoc.schedule.daysActive.includes(i);
                    return (
                      <button key={d} onClick={() => setEditDoc({ ...editDoc, schedule: { ...editDoc.schedule, daysActive: active ? editDoc.schedule.daysActive.filter((x) => x !== i) : [...editDoc.schedule.daysActive, i] } })} className={`rounded px-2 py-1 text-xs ${active ? "bg-primary text-primary-foreground" : "bg-background border"}`}>
                        {d}
                      </button>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Start"><Input type="time" value={editDoc.schedule.startTime} onChange={(e) => setEditDoc({ ...editDoc, schedule: { ...editDoc.schedule, startTime: e.target.value } })} /></Field>
                  <Field label="End"><Input type="time" value={editDoc.schedule.endTime} onChange={(e) => setEditDoc({ ...editDoc, schedule: { ...editDoc.schedule, endTime: e.target.value } })} /></Field>
                  <Field label="Slot minutes">
                    <select className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={editDoc.schedule.slotMinutes} onChange={(e) => setEditDoc({ ...editDoc, schedule: { ...editDoc.schedule, slotMinutes: Number(e.target.value) as 10 | 15 | 20 | 30 } })}>
                      <option value={10}>10</option><option value={15}>15</option><option value={20}>20</option><option value={30}>30</option>
                    </select>
                  </Field>
                  <Field label="Max patients"><Input type="number" value={editDoc.schedule.maxPatients} onChange={(e) => setEditDoc({ ...editDoc, schedule: { ...editDoc.schedule, maxPatients: Number(e.target.value) } })} /></Field>
                  <Field label="OPD location"><Input value={editDoc.schedule.opdLocation} onChange={(e) => setEditDoc({ ...editDoc, schedule: { ...editDoc.schedule, opdLocation: e.target.value } })} /></Field>
                  <Field label="Buffer (min)"><Input type="number" value={editDoc.schedule.bufferMinutes} onChange={(e) => setEditDoc({ ...editDoc, schedule: { ...editDoc.schedule, bufferMinutes: Number(e.target.value) } })} /></Field>
                  <Field label="Lunch start"><Input type="time" value={editDoc.schedule.lunchStart ?? ""} onChange={(e) => setEditDoc({ ...editDoc, schedule: { ...editDoc.schedule, lunchStart: e.target.value } })} /></Field>
                  <Field label="Lunch end"><Input type="time" value={editDoc.schedule.lunchEnd ?? ""} onChange={(e) => setEditDoc({ ...editDoc, schedule: { ...editDoc.schedule, lunchEnd: e.target.value } })} /></Field>
                </div>
              </div>

              <div className="rounded border bg-muted/20 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Leaves ({editDoc.leaves.length})</div>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditDoc({ ...editDoc, leaves: [...editDoc.leaves, { id: `lv_${Date.now()}`, startDate: new Date().toISOString().slice(0, 10), endDate: new Date().toISOString().slice(0, 10), type: "personal" }] })}>
                    <Plus className="mr-1 h-3 w-3" /> Add leave
                  </Button>
                </div>
                <div className="space-y-2">
                  {editDoc.leaves.map((lv, idx) => (
                    <div key={lv.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 text-xs">
                      <Input type="date" value={lv.startDate} onChange={(e) => { const next = editDoc.leaves.slice(); next[idx] = { ...lv, startDate: e.target.value }; setEditDoc({ ...editDoc, leaves: next }); }} />
                      <Input type="date" value={lv.endDate} onChange={(e) => { const next = editDoc.leaves.slice(); next[idx] = { ...lv, endDate: e.target.value }; setEditDoc({ ...editDoc, leaves: next }); }} />
                      <select className="h-9 rounded-md border bg-background px-2 text-xs" value={lv.type} onChange={(e) => { const next = editDoc.leaves.slice(); next[idx] = { ...lv, type: e.target.value as typeof lv.type }; setEditDoc({ ...editDoc, leaves: next }); }}>
                        <option value="personal">Personal</option><option value="conference">Conference</option><option value="holiday">Holiday</option><option value="training">Training</option>
                      </select>
                      <Button size="sm" variant="ghost" className="h-9 text-allergy" onClick={() => setEditDoc({ ...editDoc, leaves: editDoc.leaves.filter((x) => x.id !== lv.id) })}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  ))}
                  {!editDoc.leaves.length && <div className="text-xs text-muted-foreground">No leaves recorded.</div>}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setEditDoc(null)}>Cancel</Button>
                <Button size="sm" onClick={() => { saveDoctor(editDoc); setEditDoc(null); }}>Save</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</Label>{children}</div>;
}export default DeptDoctorsPage;
