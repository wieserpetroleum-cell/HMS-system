import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useInvoices } from "@/lib/invoices-store";
import { TpaPipeline } from "@/components/billing/TpaPipeline";
import { TpaStatusPill } from "@/components/billing/StatusPill";
import { money, ageDays } from "@/lib/money";
function TpaQueue() {
  const { invoices } = useInvoices();
  const [view, setView] = React.useState<"pipeline" | "table">("pipeline");
  const claims = invoices.filter((i) => i.tpaClaim);

  return (
    <div className="space-y-5 p-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/billing" className="inline-flex items-center hover:text-foreground"><ArrowLeft className="mr-1 h-3.5 w-3.5" /> Billing</Link>
      </div>
      <PageHeader
        eyebrow="Billing"
        title="TPA Queue"
        description={`${claims.length} insurance claim(s) across the pipeline`}
        right={
          <div className="inline-flex rounded-md border border-border bg-card p-0.5">
            {(["pipeline","table"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={[
                "rounded px-3 py-1.5 text-xs capitalize",
                view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              ].join(" ")}>{v}</button>
            ))}
          </div>
        }
      />

      {view === "pipeline" ? (
        <TpaPipeline invoices={claims} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-2 text-left">Invoice</th>
                <th className="px-4 py-2 text-left">Patient</th>
                <th className="px-4 py-2 text-left">TPA</th>
                <th className="px-4 py-2 text-right">Claimed</th>
                <th className="px-4 py-2 text-right">Approved</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-right">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {claims.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No TPA claims.</td></tr>}
              {claims.map((i) => (
                <tr key={i.id} className="hover:bg-accent/30">
                  <td className="px-4 py-2.5">
                    <Link to=`{result}` search={{ tab: "tpa" }} className="font-mono text-xs text-primary hover:underline">
                      {i.invoiceNo}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">{i.patientName}</td>
                  <td className="px-4 py-2.5"><div>{i.tpaClaim!.tpaName}</div><div className="text-[11px] text-muted-foreground">{i.tpaClaim!.provider}</div></td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{money(i.tpaClaim!.claimedAmount)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{i.tpaClaim!.approvedAmount != null ? money(i.tpaClaim!.approvedAmount) : "—"}</td>
                  <td className="px-4 py-2.5"><TpaStatusPill status={i.tpaClaim!.status} /></td>
                  <td className="px-4 py-2.5 text-right text-xs text-muted-foreground">{ageDays(i.tpaClaim!.lastUpdateAt)}d ago</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
export default TpaQueue;
