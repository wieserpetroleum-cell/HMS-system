import { Trash2 } from "lucide-react";
import type { InvoiceItem, InvoiceItemCategory } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { money } from "@/lib/money";

const catLabel: Record<InvoiceItemCategory, string> = {
  consultation: "Consult", procedure: "Procedure", room: "Room",
  pharmacy: "Pharmacy", lab: "Lab", radiology: "Radiology", misc: "Misc",
};

export function LineItemRow({
  item, onChange, onRemove, readOnly,
}: {
  item: InvoiceItem;
  onChange: (patch: Partial<InvoiceItem>) => void;
  onRemove: () => void;
  readOnly?: boolean;
}) {
  const update = (patch: Partial<InvoiceItem>) => {
    const next = { ...item, ...patch };
    next.amount = next.qty * next.unitPrice;
    onChange(next);
  };

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-3 py-2">
        <span className="inline-block rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {catLabel[item.category]}
        </span>
        {item.code && <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{item.code}</div>}
      </td>
      <td className="px-3 py-2">
        <Input
          value={item.description}
          onChange={(e) => update({ description: e.target.value })}
          className="h-8 text-sm"
          readOnly={readOnly}
        />
      </td>
      <td className="px-3 py-2">
        <Input
          type="number" min={1} value={item.qty}
          onChange={(e) => update({ qty: Math.max(1, Number(e.target.value || 1)) })}
          className="h-8 w-16 text-right text-sm tabular-nums"
          readOnly={readOnly}
        />
      </td>
      <td className="px-3 py-2">
        <Input
          type="number" min={0} value={item.unitPrice}
          onChange={(e) => update({ unitPrice: Math.max(0, Number(e.target.value || 0)) })}
          className="h-8 w-24 text-right text-sm tabular-nums"
          readOnly={readOnly}
        />
      </td>
      <td className="px-3 py-2 text-right text-sm font-medium tabular-nums">{money(item.amount)}</td>
      <td className="px-3 py-2 text-right">
        {!readOnly && (
          <button type="button" onClick={onRemove} className="rounded p-1 text-muted-foreground hover:bg-allergy/10 hover:text-allergy" aria-label="Remove">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </td>
    </tr>
  );
}
