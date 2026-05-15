import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/forms/Combobox";
import { mockDrugs } from "@/lib/mock/drugs";
import type { RxItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const FREQ_PRESETS = ["1-0-0", "0-0-1", "1-0-1", "1-1-1", "1-1-1-1", "SOS", "HS"];
const DURATION_PRESETS = ["3 days", "5 days", "7 days", "10 days", "14 days", "1 month"];
const ROUTES = ["PO", "IV", "IM", "SC", "Topical", "Inhaled"];

const drugOptions = mockDrugs.map((d, i) => ({
  value: `${i}`,
  label: `${d.name} ${d.strength ?? ""}`.trim(),
  hint: d.form,
}));

interface Props {
  index: number;
  item: RxItem;
  onChange: (next: RxItem) => void;
  onRemove: () => void;
  allergyHit?: boolean;
}

export function RxRowEditor({ index, item, onChange, onRemove, allergyHit }: Props) {
  return (
    <div
      className={cn(
        "rounded-md border bg-background p-3",
        allergyHit ? "border-allergy/50 ring-1 ring-allergy/30" : "border-border",
      )}
    >
      <div className="flex items-center justify-between gap-2 pb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Rx · {String(index + 1).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-allergy/10 hover:text-allergy"
          aria-label="Remove prescription"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-12">
        <div className="md:col-span-5">
          <Combobox
            options={drugOptions}
            value={drugOptions.find((o) => o.label === `${item.drug} ${item.strength ?? ""}`.trim())?.value}
            onChange={(_, opt) => {
              if (!opt) return;
              const drug = mockDrugs[Number(opt.value)];
              onChange({ ...item, drug: drug.name, strength: drug.strength, form: drug.form });
            }}
            placeholder="Select drug…"
            emptyText="No matching drug"
          />
          {allergyHit && (
            <div className="mt-1 text-[10px] font-medium text-allergy">
              ⚠ Possible allergy conflict — review patient allergies
            </div>
          )}
        </div>
        <Input
          className="md:col-span-2"
          value={item.dose ?? ""}
          onChange={(e) => onChange({ ...item, dose: e.target.value })}
          placeholder="Dose"
        />
        <div className="md:col-span-2">
          <Input
            list={`freq-${item.id}`}
            value={item.frequency ?? ""}
            onChange={(e) => onChange({ ...item, frequency: e.target.value })}
            placeholder="Frequency"
          />
          <datalist id={`freq-${item.id}`}>
            {FREQ_PRESETS.map((f) => <option key={f} value={f} />)}
          </datalist>
        </div>
        <div className="md:col-span-2">
          <Input
            list={`dur-${item.id}`}
            value={item.duration ?? ""}
            onChange={(e) => onChange({ ...item, duration: e.target.value })}
            placeholder="Duration"
          />
          <datalist id={`dur-${item.id}`}>
            {DURATION_PRESETS.map((d) => <option key={d} value={d} />)}
          </datalist>
        </div>
        <select
          className="h-9 rounded-md border border-input bg-transparent px-2 text-sm md:col-span-1"
          value={item.route ?? "PO"}
          onChange={(e) => onChange({ ...item, route: e.target.value as RxItem["route"] })}
        >
          {ROUTES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <Input
          className="md:col-span-12"
          value={item.instructions ?? ""}
          onChange={(e) => onChange({ ...item, instructions: e.target.value })}
          placeholder="Instructions (e.g. after food, with water)"
        />
      </div>
    </div>
  );
}
