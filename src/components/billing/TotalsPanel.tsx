import { money } from "@/lib/money";
import type { Invoice } from "@/lib/types";
import { Input } from "@/components/ui/input";

export function TotalsPanel({
  invoice, onDiscountChange, readOnly,
}: {
  invoice: Invoice;
  onDiscountChange?: (n: number) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Totals</div>
      <div className="mt-3 space-y-2 text-sm">
        <Row label="Subtotal" value={money(invoice.subtotal)} />
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Discount</span>
          {readOnly ? (
            <span className="tabular-nums">- {money(invoice.discount)}</span>
          ) : (
            <Input
              type="number" min={0} max={invoice.subtotal}
              value={invoice.discount}
              onChange={(e) => onDiscountChange?.(Math.max(0, Math.min(invoice.subtotal, Number(e.target.value || 0))))}
              className="h-7 w-24 text-right tabular-nums"
            />
          )}
        </div>
        <Row label={`Tax (${Math.round(invoice.taxRate * 100)}%)`} value={money(invoice.taxAmount)} />
        <div className="my-2 border-t border-border" />
        <Row label="Total" value={money(invoice.total)} strong />
        <Row label="Paid" value={money(invoice.paid)} tone="ok" />
        <Row label="Balance" value={money(invoice.balance)} strong tone={invoice.balance > 0 ? "warn" : "ok"} />
      </div>
    </div>
  );
}

function Row({ label, value, strong, tone }: { label: string; value: string; strong?: boolean; tone?: "ok" | "warn" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={[
        "tabular-nums",
        strong ? "font-bold" : "",
        tone === "ok" ? "text-status-ok" : tone === "warn" ? "text-allergy" : "",
      ].join(" ")}>{value}</span>
    </div>
  );
}
