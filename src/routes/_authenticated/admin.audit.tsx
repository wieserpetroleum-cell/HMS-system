import * as React from "react";

import { Search, Printer, Download, X } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAudit } from "@/lib/audit-store";
import type { AuditAction, AuditRecord, PermissionModule } from "@/lib/types";
import { PERMISSION_MODULES } from "@/lib/mock/admin";

type Search = { userId?: string };
const ACTIONS: AuditAction[] = ["login", "logout", "created", "edited", "deleted", "viewed", "approved", "rejected", "exported", "other"];

function AuditPage() {
  const { records } = useAudit();
  const [days, setDays] = React.useState(7);
  const [q, setQ] = React.useState("");
  const [action, setAction] = React.useState<AuditAction | "all">("all");
  const [module, setModule] = React.useState<PermissionModule | "all">("all");
  const [userQ, setUserQ] = React.useState("");
  const [active, setActive] = React.useState<AuditRecord | null>(null);

  const cutoff = React.useMemo(() => Date.now() - days * 86400000, [days]);

  const filtered = records.filter((r) => {
    if (new Date(r.at).getTime() < cutoff) return false;
    if (action !== "all" && r.action !== action) return false;
    if (module !== "all" && r.module !== module) return false;
    const t = q.trim().toLowerCase();
    if (t && !`${r.recordId} ${r.patientName ?? ""} ${r.recordType}`.toLowerCase().includes(t)) return false;
    const uq = userQ.trim().toLowerCase();
    if (uq && !`${r.userName} ${r.userId} ${r.role}`.toLowerCase().includes(uq)) return false;
    return true;
  });

  const today = filtered.filter((r) => new Date(r.at).toDateString() === new Date().toDateString()).length;
  const moduleCounts: Record<string, number> = {};
  for (const r of filtered) moduleCounts[r.module] = (moduleCounts[r.module] ?? 0) + 1;
  const topUsers = Object.entries(filtered.reduce<Record<string, number>>((acc, r) => { acc[r.userName] = (acc[r.userName] ?? 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const exportCsv = () => {
    const header = "at,user,role,action,module,recordType,recordId,patient,ip\n";
    const rows = filtered.map((r) => [r.at, r.userName, r.role, r.action, r.module, r.recordType, r.recordId, r.patientName ?? "", r.ip].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        eyebrow="Module 10 · Configuration"
        title="Audit log"
        description="Immutable trail of every privileged action. Filter, inspect before/after diffs and export."
        right={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => window.print()}><Printer className="mr-1.5 h-3.5 w-3.5" /> Print</Button>
            <Button size="sm" variant="outline" onClick={exportCsv}><Download className="mr-1.5 h-3.5 w-3.5" /> Export CSV</Button>
          </div>
        }
      />

      <div className="rounded-lg border bg-card p-3">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Record ID, UID, patient…" className="pl-8" />
          </div>
          <Input value={userQ} onChange={(e) => setUserQ(e.target.value)} placeholder="User name / role…" />
          <select className="h-9 rounded-md border bg-background px-2 text-xs" value={action} onChange={(e) => setAction(e.target.value as AuditAction | "all")}>
            <option value="all">All actions</option>
            {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <select className="h-9 rounded-md border bg-background px-2 text-xs" value={module} onChange={(e) => setModule(e.target.value as PermissionModule | "all")}>
            <option value="all">All modules</option>
            {PERMISSION_MODULES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select className="h-9 rounded-md border bg-background px-2 text-xs" value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={1}>Last 24h</option><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="overflow-hidden rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground"><tr><th className="px-3 py-2 text-left">When</th><th className="px-3 py-2 text-left">User</th><th className="px-3 py-2 text-left">Action</th><th className="px-3 py-2 text-left">Module</th><th className="px-3 py-2 text-left">Record</th><th className="px-3 py-2 text-left">IP</th></tr></thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => setActive(r)}>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(r.at).toLocaleString()}</td>
                  <td className="px-3 py-2"><div className="text-sm font-medium">{r.userName}</div><div className="text-[10px] text-muted-foreground">{r.role}</div></td>
                  <td className="px-3 py-2 text-xs capitalize">{r.action}</td>
                  <td className="px-3 py-2 text-xs capitalize">{r.module}</td>
                  <td className="px-3 py-2 text-xs"><div className="font-medium">{r.recordType}</div><div className="font-mono text-[10px] text-muted-foreground">{r.recordId}</div></td>
                  <td className="px-3 py-2 text-xs font-mono text-muted-foreground">{r.ip}</td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={6} className="px-3 py-8 text-center text-sm text-muted-foreground">No audit records match.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          <SectionCard title="Today">
            <div className="text-3xl font-bold">{today}</div>
            <div className="text-xs text-muted-foreground">privileged actions</div>
          </SectionCard>
          <SectionCard title="By module">
            <ul className="space-y-1.5">
              {Object.entries(moduleCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([m, n]) => (
                <li key={m} className="text-xs">
                  <div className="flex justify-between"><span className="capitalize">{m}</span><span className="text-muted-foreground">{n}</span></div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (n / Math.max(...Object.values(moduleCounts))) * 100)}%` }} /></div>
                </li>
              ))}
              {!Object.keys(moduleCounts).length && <li className="text-xs text-muted-foreground">No data.</li>}
            </ul>
          </SectionCard>
          <SectionCard title="Top users">
            <ul className="space-y-1 text-xs">
              {topUsers.map(([n, c]) => (<li key={n} className="flex justify-between"><span>{n}</span><span className="text-muted-foreground">{c}</span></li>))}
              {!topUsers.length && <li className="text-muted-foreground">No data.</li>}
            </ul>
          </SectionCard>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground">Audit records are retained for 7 years per HMS policy. This view is read-only.</p>

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader><SheetTitle>Audit detail</SheetTitle></SheetHeader>
          {active && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><div className="text-muted-foreground uppercase">When</div><div>{new Date(active.at).toLocaleString()}</div></div>
                <div><div className="text-muted-foreground uppercase">User</div><div>{active.userName} · {active.role}</div></div>
                <div><div className="text-muted-foreground uppercase">Action</div><div className="capitalize">{active.action} · {active.module}</div></div>
                <div><div className="text-muted-foreground uppercase">Record</div><div>{active.recordType} · <span className="font-mono">{active.recordId}</span></div></div>
                <div><div className="text-muted-foreground uppercase">IP / UA</div><div className="font-mono">{active.ip}</div><div className="text-muted-foreground">{active.userAgent}</div></div>
                {active.endpoint && <div><div className="text-muted-foreground uppercase">Endpoint</div><div className="font-mono">{active.method} {active.endpoint}</div></div>}
              </div>
              {(active.beforeJson != null || active.afterJson != null) && (
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">Before</div>
                    <pre className="max-h-64 overflow-auto rounded border bg-muted/30 p-3 text-[11px]">{JSON.stringify(active.beforeJson ?? null, null, 2)}</pre>
                  </div>
                  <div>
                    <div className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">After</div>
                    <pre className="max-h-64 overflow-auto rounded border bg-status-ok/10 p-3 text-[11px]">{JSON.stringify(active.afterJson ?? null, null, 2)}</pre>
                  </div>
                </div>
              )}
              <div className="flex justify-end"><Button size="sm" variant="ghost" onClick={() => setActive(null)}><X className="h-3.5 w-3.5" /></Button></div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}export default AuditPage;
