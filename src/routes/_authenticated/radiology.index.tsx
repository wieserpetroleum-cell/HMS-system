import { Link } from "react-router-dom";
import { AlertTriangle, FilePlus2, ListChecks } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Button } from "@/components/ui/button";
import { useRadiology } from "@/lib/radiology-store";
import { OrderStatusPill, PriorityBadge } from "@/components/radiology/StatusPill";
import { ModalityIcon, modalityLabel } from "@/components/radiology/ModalityIcon";
import { findStudy, modalityLabels } from "@/lib/mock/radiology-catalog";
import { TatGauge } from "@/components/radiology/TatGauge";
import type { Modality } from "@/lib/types";
function RadiologyDashboard() {
  const { orders, reports } = useRadiology();
  const today = new Date();
  const isToday = (iso: string) => new Date(iso).toDateString() === today.toDateString();

  const ordersToday = orders.filter((o) => isToday(o.orderedAt));
  const awaitingAcq = orders.filter((o) => ["ordered", "scheduled"].includes(o.status));
  const awaitingReport = orders.filter((o) => o.status === "acquired");
  const awaitingVerify = orders.filter((o) => o.status === "reporting");
  const verifiedToday = orders.filter((o) => o.status === "verified" || o.status === "delivered");

  // median TAT for verified studies (using rep verifiedAt)
  const tatMins = verifiedToday
    .map((o) => {
      const r = reports.find((rep) => rep.studyId === `st-${o.id}` && rep.verifiedAt);
      if (!r?.verifiedAt) return null;
      return Math.round((new Date(r.verifiedAt).getTime() - new Date(o.orderedAt).getTime()) / 60_000);
    })
    .filter((v): v is number => v !== null)
    .sort((a, b) => a - b);
  const medianTat = tatMins.length ? tatMins[Math.floor(tatMins.length / 2)] : 0;

  const critical = reports.filter((r) => r.criticalFinding && r.verifiedAt).slice(0, 6);

  const modalityCounts: Record<Modality, number> = { xray: 0, ct: 0, mri: 0, usg: 0, mammo: 0, dexa: 0 };
  ordersToday.forEach((o) => { modalityCounts[o.modality]++; });
  const maxMod = Math.max(1, ...Object.values(modalityCounts));

  const snapshot = [...orders]
    .filter((o) => !["delivered", "cancelled"].includes(o.status))
    .sort((a, b) => {
      const pr = { stat: 0, urgent: 1, routine: 2 };
      if (pr[a.priority] !== pr[b.priority]) return pr[a.priority] - pr[b.priority];
      return new Date(a.orderedAt).getTime() - new Date(b.orderedAt).getTime();
    })
    .slice(0, 8);

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        eyebrow="Radiology"
        title="Imaging operations today"
        description="Orders, acquisition, reporting, verification and critical findings."
        right={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/radiology/worklist"><ListChecks className="mr-2 h-4 w-4" /> Worklist</Link>
            </Button>
            <Button asChild>
              <Link to="/radiology/orders/new"><FilePlus2 className="mr-2 h-4 w-4" /> New Order</Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
        <KpiCard label="Orders Today" value={ordersToday.length} tone="info" />
        <KpiCard label="Awaiting Acquisition" value={awaitingAcq.length} tone="warn" />
        <KpiCard label="Awaiting Report" value={awaitingReport.length} />
        <KpiCard label="Awaiting Verification" value={awaitingVerify.length} tone="warn" />
        <KpiCard label="Median TAT" value={`${medianTat}m`} tone="ok" />
        <KpiCard label="Critical Findings" value={critical.length} tone="danger" />
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Modality utilisation today</div>
            <div className="text-sm text-muted-foreground">Orders received per modality</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          {(Object.keys(modalityCounts) as Modality[]).map((m) => (
            <div key={m} className="rounded border border-border bg-background p-3">
              <div className="flex items-center justify-between">
                <ModalityIcon modality={m} />
                <span className="font-mono text-xs tabular-nums">{modalityCounts[m]}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary" style={{ width: `${(modalityCounts[m] / maxMod) * 100}%` }} />
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{modalityLabels[m]}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Today's worklist</div>
            <Link to="/radiology/worklist" className="text-[11px] text-primary hover:underline">Open worklist</Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-5 py-2 text-left">Accession</th>
                <th className="px-5 py-2 text-left">Patient / Study</th>
                <th className="px-5 py-2 text-left">Priority</th>
                <th className="px-5 py-2 text-left">Status</th>
                <th className="px-5 py-2 text-left">TAT</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.map((o) => {
                const cat = findStudy(o.studyCode);
                return (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                    <td className="px-5 py-2.5">
                      <Link to={`{result}`} className="font-mono text-[11px] text-primary hover:underline">
                        {o.orderNo}
                      </Link>
                    </td>
                    <td className="px-5 py-2.5">
                      <div className="font-medium">{o.patientName}</div>
                      <div className="text-[11px] text-muted-foreground">{modalityLabel(o.modality)} · {o.studyName}</div>
                    </td>
                    <td className="px-5 py-2.5"><PriorityBadge priority={o.priority} /></td>
                    <td className="px-5 py-2.5"><OrderStatusPill status={o.status} /></td>
                    <td className="px-5 py-2.5">{cat && <TatGauge orderedAt={o.orderedAt} targetMin={cat.targetTatMin} />}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-5 py-3">
            <AlertTriangle className="h-3.5 w-3.5 text-allergy" />
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Critical findings</div>
          </div>
          <ul className="divide-y divide-border">
            {critical.length === 0 && <li className="px-5 py-6 text-center text-sm text-muted-foreground">No critical findings.</li>}
            {critical.map((r) => {
              const order = orders.find((o) => `st-${o.id}` === r.studyId);
              if (!order) return null;
              const impression = r.sections.find((s) => s.heading === "Impression");
              return (
                <li key={r.id} className="px-5 py-3">
                  <Link to={`{result}`} className="block">
                    <div className="flex items-baseline justify-between">
                      <div className="text-sm font-semibold">{order.patientName}</div>
                      <span className="font-mono text-[10px] text-muted-foreground">{order.orderNo}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">{order.studyName}</div>
                    {impression && <div className="mt-1 line-clamp-2 text-xs text-allergy">{impression.text}</div>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}export default RadiologyDashboard;
