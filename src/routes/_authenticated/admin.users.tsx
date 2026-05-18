import * as React from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, KeyRound, History, Shield } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAdmin } from "@/lib/admin-store";
import { PermissionMatrix } from "@/components/admin/PermissionMatrix";
import type { AppUser, RoleDef } from "@/lib/types";
function randomPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#";
  let p = "";
  for (let i = 0; i < 10; i++) p += chars[Math.floor(Math.random() * chars.length)];
  return p;
}

function UsersPage() {
  const { users, roles, departments, saveUser, removeUser, toggleUserStatus, saveRole, removeRole } = useAdmin();
  const [tab, setTab] = React.useState<"users" | "roles">("users");
  const [editUser, setEditUser] = React.useState<AppUser | null>(null);
  const [editRole, setEditRole] = React.useState<RoleDef | null>(null);
  const [tempPwd, setTempPwd] = React.useState<string | null>(null);

  const blankUser = (): AppUser => ({
    id: `u_${Date.now()}`, firstName: "", lastName: "", email: "", role: roles[0]?.id ?? "",
    status: "active", createdAt: new Date().toISOString(),
  });

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        eyebrow="Module 10 · Configuration"
        title="Users & roles"
        description="App users, system roles and a full permission matrix."
        right={
          <Button size="sm" onClick={() => tab === "users" ? (setEditUser(blankUser()), setTempPwd(randomPassword())) : setEditRole({ id: `r_${Date.now()}`, name: "", systemRole: false, permissions: roles[0]?.permissions ?? {} as RoleDef["permissions"] })}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> {tab === "users" ? "Add user" : "Add role"}
          </Button>
        }
      />

      <div className="flex gap-1 border-b">
        {(["users", "roles"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm border-b-2 -mb-px ${tab === t ? "border-primary font-medium text-primary" : "border-transparent text-muted-foreground"}`}>
            {t === "users" ? `Users (${users.length})` : `Roles (${roles.length})`}
          </button>
        ))}
      </div>

      {tab === "users" ? (
        <div className="overflow-hidden rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground"><tr><th className="px-3 py-2 text-left">Name</th><th className="px-3 py-2 text-left">Email</th><th className="px-3 py-2 text-left">Role</th><th className="px-3 py-2 text-left">Dept.</th><th className="px-3 py-2 text-left">Last login</th><th className="px-3 py-2 text-left">Status</th><th className="px-3 py-2 text-right">Actions</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium">{u.firstName} {u.lastName}<div className="text-[10px] text-muted-foreground">{u.employeeId ?? "—"}</div></td>
                  <td className="px-3 py-2 text-xs">{u.email}</td>
                  <td className="px-3 py-2 text-xs">{roles.find((r) => r.id === u.role)?.name ?? u.role}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{departments.find((d) => d.id === u.departmentId)?.name ?? "—"}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "Never"}</td>
                  <td className="px-3 py-2 text-xs">
                    <button onClick={() => toggleUserStatus(u.id)} className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] uppercase ${u.status === "active" ? "bg-status-ok/15 text-status-ok" : "bg-muted text-muted-foreground"}`}>
                      {u.status}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Link to="/admin/audit" search={{ userId: u.id } as never}>
                      <Button size="sm" variant="ghost" className="h-7" title="Audit history"><History className="h-3.5 w-3.5" /></Button>
                    </Link>
                    <Button size="sm" variant="ghost" className="h-7" title="Reset password" onClick={() => setTempPwd(randomPassword())}><KeyRound className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="h-7" onClick={() => setEditUser(u)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="h-7 text-allergy" onClick={() => removeUser(u.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground"><tr><th className="px-3 py-2 text-left">Name</th><th className="px-3 py-2 text-left">Type</th><th className="px-3 py-2 text-left">Users</th><th className="px-3 py-2 text-right">Actions</th></tr></thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.id} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium">{r.name}</td>
                  <td className="px-3 py-2 text-xs">{r.systemRole ? <span className="inline-flex items-center gap-1 rounded bg-status-info/15 px-1.5 py-0.5 text-[10px] text-status-info"><Shield className="h-3 w-3" /> SYSTEM</span> : "Custom"}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{users.filter((u) => u.role === r.id).length}</td>
                  <td className="px-3 py-2 text-right">
                    <Button size="sm" variant="ghost" className="h-7" onClick={() => setEditRole(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                    {!r.systemRole && <Button size="sm" variant="ghost" className="h-7 text-allergy" onClick={() => removeRole(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User drawer */}
      <Sheet open={!!editUser} onOpenChange={(o) => { if (!o) { setEditUser(null); setTempPwd(null); } }}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader><SheetTitle>{editUser?.email ? "Edit user" : "New user"}</SheetTitle></SheetHeader>
          {editUser && (
            <div className="mt-4 space-y-3">
              {tempPwd && !editUser.email && (
                <div className="rounded border border-status-info/30 bg-status-info/10 p-3 text-xs">
                  <div className="mb-1 font-semibold text-status-info">Temporary password (shown once)</div>
                  <code className="font-mono text-sm">{tempPwd}</code>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Field label="First name"><Input value={editUser.firstName} onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })} /></Field>
                <Field label="Last name"><Input value={editUser.lastName} onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })} /></Field>
              </div>
              <Field label="Email"><Input type="email" value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} /></Field>
              <Field label="Phone"><Input value={editUser.phone ?? ""} onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Employee ID"><Input value={editUser.employeeId ?? ""} onChange={(e) => setEditUser({ ...editUser, employeeId: e.target.value })} /></Field>
                <Field label="Department">
                  <select className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={editUser.departmentId ?? ""} onChange={(e) => setEditUser({ ...editUser, departmentId: e.target.value || undefined })}>
                    <option value="">— None —</option>
                    {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Role">
                <select className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}>
                  {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </Field>
              <div className="flex items-center justify-between rounded border px-3 py-2"><Label>Active</Label><Switch checked={editUser.status === "active"} onCheckedChange={(v) => setEditUser({ ...editUser, status: v ? "active" : "inactive" })} /></div>
              <div className="flex justify-end gap-2 pt-2"><Button variant="outline" size="sm" onClick={() => { setEditUser(null); setTempPwd(null); }}>Cancel</Button><Button size="sm" onClick={() => { saveUser(editUser); setEditUser(null); setTempPwd(null); }}>Save</Button></div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Role drawer */}
      <Sheet open={!!editRole} onOpenChange={(o) => !o && setEditRole(null)}>
        <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
          <SheetHeader><SheetTitle>{editRole?.name || "New role"}</SheetTitle></SheetHeader>
          {editRole && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
                <Field label="Role name"><Input value={editRole.name} onChange={(e) => setEditRole({ ...editRole, name: e.target.value })} disabled={editRole.systemRole} /></Field>
                <div className="text-xs text-muted-foreground">{editRole.systemRole ? "System role" : "Custom role"}</div>
              </div>
              <PermissionMatrix role={editRole} onChange={setEditRole} readOnly={editRole.systemRole} />
              <div className="flex justify-end gap-2 pt-2"><Button variant="outline" size="sm" onClick={() => setEditRole(null)}>Close</Button>{!editRole.systemRole && <Button size="sm" onClick={() => { saveRole(editRole); setEditRole(null); }}>Save</Button>}</div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</Label>{children}</div>;
}export default UsersPage;
