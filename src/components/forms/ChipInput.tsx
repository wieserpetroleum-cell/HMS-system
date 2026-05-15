import * as React from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ChipInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  tone?: "allergy" | "condition" | "default";
  id?: string;
}

const toneClass: Record<string, string> = {
  allergy: "bg-allergy/10 text-allergy border-allergy/30",
  condition: "bg-condition/15 text-condition-foreground border-condition/40",
  default: "bg-secondary text-foreground border-border",
};

export function ChipInput({
  value,
  onChange,
  placeholder = "Type and press Enter",
  tone = "default",
  id,
}: ChipInputProps) {
  const [draft, setDraft] = React.useState("");

  const add = () => {
    const v = draft.trim();
    if (!v || value.includes(v)) {
      setDraft("");
      return;
    }
    onChange([...value, v]);
    setDraft("");
  };

  return (
    <div>
      <Input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
        placeholder={placeholder}
      />
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {value.map((chip) => (
            <span
              key={chip}
              className={cn(
                "inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-medium",
                toneClass[tone],
              )}
            >
              {chip}
              <button
                type="button"
                onClick={() => onChange(value.filter((c) => c !== chip))}
                className="opacity-60 hover:opacity-100"
                aria-label={`Remove ${chip}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
