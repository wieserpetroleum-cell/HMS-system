import { createFileRoute } from "@tanstack/react-router";
import { FilePlus2, ShieldCheck, Wallet, Receipt } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { mockBills, billsSummary, ageingBuckets } from "@/lib/mock/bills";
import { cn } from "@/lib/utils";
import type { Bill } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/dashboard/billing")({
  component: BillingDashboard,
});

const statusStyles: Record<Bill["status"], string> = {
  paid: "bg-status-ok/10 text-status-ok",
  pending: "bg-condition/15 text-condition",
  overdue: "bg-allergy/10 text-allergy",
  "tpa-pending": "bg-status-info/10 text-status-info",
};

function BillingDashboard() {
  const s = billsSummary();
  const buckets = ageingBuckets();
  const totalAgeing = Object.values(buckets).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        eyebrow="Billing & TPA"
        title="Revenue cycle today"
        description="Invoices, collections and outstanding ageing."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Invoices Today" value={s.invoicesToday} tone="info" />
        <KpiCard label="Collections" value={`₹${s.collectionsToday.toLocaleString()}`} tone="ok" trend="up" trendLabel="+8% vs yesterday" />
        <KpiCard label="Pending Amount" value={`₹${(s.pendingAmount / 1000).toFixed(1)}k`} tone="warn" />
        <KpiCard label="TPA Claims Open" value={s.tpaCount} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-5 py-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Recent Invoices
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="px-5 py-2 text-left">Invoice</th>
                  <th className="px-5 py-2 text-left">Patient</th>
                  <th className="px-5 py-2 text-right">Amount</th>
                  <th className="px-5 py-2 text-left">Status</th>
                  <th className="px-5 py-2 text-right">Age</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockBills.map((b) => (
                  <tr key={b.id}>
                    <td className="px-5 py-2.5 font-mono text-xs">{b.invoiceNo}</td>
                    <td className="px-5 py-2.5">{b.patientName}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums">
                      ₹{b.amount.toLocaleString()}
                    </td>
                    <td className="px-5 py-2.5">
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          statusStyles[b.status],
                        )}
                      >
                        {b.status === "tpa-pending" ? `TPA · ${b.tpa}` : b.status}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-right text-xs text-muted-foreground">
                      {b.createdAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Ageing Buckets
            </div>
            <div className="mt-4 space-y-3">
              {(Object.keys(buckets) as Array<keyof typeof buckets>).map((key) => {
                const amount = buckets[key];
                const pct = (amount / totalAgeing) * 100;
                const tone =
                  key === "0-30"
                    ? "bg-status-ok"
                    : key === "31-60"
                      ? "bg-condition"
                      : "bg-allergy";
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{key} days</span>
                      <span className="tabular-nums text-muted-foreground">
                        ₹{amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                      <div className={tone} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <QuickActions
            actions={[
              { label: "Generate Invoice", icon: FilePlus2 },
              { label: "Process TPA", icon: ShieldCheck },
              { label: "Record Payment", icon: Wallet },
              { label: "Bill Templates", icon: Receipt },
            ]}
          />
        </div>
      </div>
    </div>
  );
}