import { Link } from "@tanstack/react-router";
import type { Invoice, TpaClaimStatus } from "@/lib/types";
import { money, ageDays } from "@/lib/money";
import { TpaStatusPill } from "./StatusPill";

const COLUMNS: TpaClaimStatus[] = ["draft", "pre-auth", "submitted", "query", "approved", "settled", "rejected"];

export function TpaPipeline({ invoices }: { invoices: Invoice[] }) {
  return (
    <div className="grid auto-cols-[18rem] grid-flow-col gap-3 overflow-x-auto pb-2">
      {COLUMNS.map((col) => {
        const items = invoices.filter((i) => i.tpaClaim?.status === col);
        return (
          <div key={col} className="rounded-lg border border-border bg-muted/30">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <TpaStatusPill status={col} />
              <span className="text-xs text-muted-foreground tabular-nums">{items.length}</span>
            </div>
            <div className="space-y-2 p-2">
              {items.length === 0 && <div className="px-2 py-6 text-center text-xs text-muted-foreground">No claims</div>}
              {items.map((inv) => (
                <Link
                  key={inv.id}
                  to="/billing/invoices/$id"
                  params={{ id: inv.id }}
                  search={{ tab: "tpa" } as never}
                  className="block rounded-md border border-border bg-card p-3 transition-colors hover:bg-accent/40"
                >
                  <div className="flex items-baseline justify-between">
                    <div className="font-mono text-xs">{inv.invoiceNo}</div>
                    <div className="text-[10px] text-muted-foreground">{ageDays(inv.tpaClaim!.lastUpdateAt)}d</div>
                  </div>
                  <div className="mt-1 truncate text-sm font-medium">{inv.patientName}</div>
                  <div className="text-[11px] text-muted-foreground">{inv.tpaClaim!.tpaName} · {inv.tpaClaim!.provider}</div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="tabular-nums">{money(inv.tpaClaim!.claimedAmount)}</span>
                    {inv.tpaClaim!.approvedAmount != null && (
                      <span className="tabular-nums text-status-ok">+{money(inv.tpaClaim!.approvedAmount)}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
