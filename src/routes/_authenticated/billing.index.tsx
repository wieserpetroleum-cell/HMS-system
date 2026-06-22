import { Link, useNavigate } from "react-router-dom";
import { FilePlus2, ShieldCheck, ListChecks } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { useInvoices } from "@/lib/invoices-store";
import { invoicesSummary, ageingBucketsFromInvoices } from "@/lib/mock/invoices";
import { AgeingBar } from "@/components/billing/AgeingBar";
import { InvoiceStatusPill, TpaStatusPill } from "@/components/billing/StatusPill";
import { money, ageDays } from "@/lib/money";
import { Button } from "@/components/ui/button";
function BillingDashboard() {
  const { invoices } = useInvoices();
  const navigate = useNavigate();
  const s = invoicesSummary(invoices);
  const buckets = ageingBucketsFromInvoices(invoices);
  const recent = [...invoices].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 8);
  const tpaTop = invoices
    .filter((i) => i.tpaClaim && !["settled", "rejected"].includes(i.tpaClaim.status))
    .sort((a, b) => ageDays(b.tpaClaim!.lastUpdateAt) - ageDays(a.tpaClaim!.lastUpdateAt))
    .slice(0, 5);

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        eyebrow="Billing & TPA"
        title="Revenue cycle today"
        description="Invoices, collections, ageing and insurance claims."
        right={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/billing/tpa"><ShieldCheck className="mr-2 h-4 w-4" /> TPA Queue</Link>
            </Button>
            <Button asChild>
              <Link to="/billing/invoices/new"><FilePlus2 className="mr-2 h-4 w-4" /> New Invoice</Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <KpiCard label="Invoices Today" value={s.invoicesToday} tone="info" />
        <KpiCard label="Collections" value={money(s.collectionsToday)} tone="ok" trend="up" trendLabel="+8% vs yesterday" />
        <KpiCard label="Pending" value={money(s.pendingAmount)} tone="warn" />
        <KpiCard label="TPA Open" value={s.tpaCount} />
        <KpiCard label="Overdue 60+" value={money(s.overdueAmount)} tone="danger" />
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Receivables ageing</div>
            <div className="mt-0.5 text-sm text-muted-foreground">Click a bucket to filter invoices</div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/billing/invoices"><ListChecks className="mr-1.5 h-4 w-4" /> All invoices</Link>
          </Button>
        </div>
        <div className="mt-4">
          <AgeingBar buckets={buckets} />
        </div>
        <div className="mt-2 flex gap-2">
          {(["0-30", "31-60", "60+"] as const).map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => navigate("/billing/invoices")}
              className="rounded border border-border bg-card px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-accent/40"
            >Filter {b}d</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card lg:col-span-2">
          <div className="border-b border-border px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Recent invoices
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-5 py-2 text-left">Invoice</th>
                <th className="px-5 py-2 text-left">Patient</th>
                <th className="px-5 py-2 text-right">Total</th>
                <th className="px-5 py-2 text-right">Balance</th>
                <th className="px-5 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recent.map((b) => (
                <tr key={b.id} className="hover:bg-accent/30">
                  <td className="px-5 py-2.5">
                    <Link to={`/billing/invoices/${b.id}`} className="font-mono text-xs text-primary hover:underline">
                      {b.invoiceNo}
                    </Link>
                  </td>
                  <td className="px-5 py-2.5">{b.patientName}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums">{money(b.total)}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums">{money(b.balance)}</td>
                  <td className="px-5 py-2.5"><InvoiceStatusPill status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">TPA queue snapshot</div>
            <Link to="/billing/tpa" className="text-[11px] text-primary hover:underline">View all</Link>
          </div>
          <ul className="divide-y divide-border">
            {tpaTop.length === 0 && <li className="px-5 py-6 text-center text-sm text-muted-foreground">No open claims</li>}
            {tpaTop.map((inv) => (
              <li key={inv.id} className="px-5 py-3">
                <Link to={`/billing/invoices/${inv.id}`} className="block">
                  <div className="flex items-baseline justify-between">
                    <div className="font-mono text-xs">{inv.invoiceNo}</div>
                    <TpaStatusPill status={inv.tpaClaim!.status} />
                  </div>
                  <div className="mt-0.5 truncate text-sm font-medium">{inv.patientName}</div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{inv.tpaClaim!.tpaName}</span>
                    <span className="tabular-nums">{money(inv.tpaClaim!.claimedAmount)} · {ageDays(inv.tpaClaim!.lastUpdateAt)}d</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
export default BillingDashboard;
