import * as React from "react";
import { Link, useSearch } from "react-router-dom";
import { z } from "zod";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useInvoices } from "@/lib/invoices-store";
import { InvoiceStatusPill } from "@/components/billing/StatusPill";
import { money, ageDays, ageBucket } from "@/lib/money";
import type { InvoiceStatus } from "@/lib/types";

const STATUSES: InvoiceStatus[] = ["draft", "pending", "partial", "paid", "tpa-pending", "overdue", "cancelled"];

const searchSchema = z.object({
  q: z.string().optional(),
  status: z.string().optional(),
  age: z.enum(["0-30", "31-60", "60+"]).optional(),
function InvoicesList() {
  const { invoices } = useInvoices();
  const search = useSearch({ from: "/_authenticated/billing/invoices/" });
  const [q, setQ] = React.useState(search.q ?? "");
  const [statusFilter, setStatusFilter] = React.useState<InvoiceStatus | "all">((search.status as InvoiceStatus) ?? "all");

  const filtered = invoices.filter((i) => {
    if (statusFilter !== "all" && i.status !== statusFilter) return false;
    if (search.age && ageBucket(ageDays(i.createdAt)) !== search.age) return false;
    if (q) {
      const ql = q.toLowerCase();
      if (![i.invoiceNo, i.patientName, i.patientUid].some((s) => s.toLowerCase().includes(ql))) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5 p-8">
      <PageHeader
        eyebrow="Billing"
        title="Invoices"
        description={`${filtered.length} of ${invoices.length} invoices`}
        right={
          <Button asChild>
            <Link to="/billing/invoices/new"><Plus className="mr-2 h-4 w-4" /> New Invoice</Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Invoice no, patient, UID…" className="pl-8" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Chip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>All</Chip>
          {STATUSES.map((s) => (
            <Chip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>{s}</Chip>
          ))}
        </div>
        {search.age && (
          <span className="rounded border border-primary/30 bg-primary/10 px-2 py-1 text-xs text-primary">Age: {search.age}d</span>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <th className="px-4 py-2 text-left">Invoice</th>
              <th className="px-4 py-2 text-left">Patient</th>
              <th className="px-4 py-2 text-left">Source</th>
              <th className="px-4 py-2 text-right">Total</th>
              <th className="px-4 py-2 text-right">Paid</th>
              <th className="px-4 py-2 text-right">Balance</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-right">Age</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No invoices match the current filters.</td></tr>
            )}
            {filtered.map((i) => (
              <tr key={i.id} className="hover:bg-accent/30">
                <td className="px-4 py-2.5">
                  <Link to="/billing/invoices/$id" params={{ id: i.id }} className="font-mono text-xs text-primary hover:underline">
                    {i.invoiceNo}
                  </Link>
                </td>
                <td className="px-4 py-2.5">
                  <div>{i.patientName}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{i.patientUid}</div>
                </td>
                <td className="px-4 py-2.5 text-xs uppercase text-muted-foreground">{i.sourceType}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{money(i.total)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-status-ok">{money(i.paid)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{money(i.balance)}</td>
                <td className="px-4 py-2.5"><InvoiceStatusPill status={i.status} /></td>
                <td className="px-4 py-2.5 text-right text-xs text-muted-foreground tabular-nums">{ageDays(i.createdAt)}d</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button" onClick={onClick}
      className={[
        "rounded-full border px-2.5 py-1 text-xs capitalize transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:bg-accent/40",
      ].join(" ")}
    >{children}</button>
  );
}
export default InvoicesList;
