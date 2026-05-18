import * as React from "react";
import type { ReportSection, ReportTemplate } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/forms/Combobox";
import { AlertTriangle, FileText, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  sections: ReportSection[];
  onChange: (sections: ReportSection[]) => void;
  templates: ReportTemplate[];
  templateId?: string;
  onTemplate: (id: string) => void;
  criticalFinding: boolean;
  onCriticalChange: (v: boolean) => void;
  saveState: "idle" | "saving" | "saved" | "dirty";
  readOnly?: boolean;
}

export function ReportEditor({
  sections, onChange, templates, templateId, onTemplate,
  criticalFinding, onCriticalChange, saveState, readOnly,
}: Props) {
  const update = (idx: number, text: string) => {
    const next = sections.map((s, i) => (i === idx ? { ...s, text } : s));
    onChange(next);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <FileText className="h-3.5 w-3.5" /> Report
        </div>
        <SaveIndicator state={saveState} />
      </div>

      <div className="space-y-3 border-b border-border p-4">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Template</label>
          <div className="mt-1">
            <Combobox
              options={templates.map((t) => ({ value: t.id, label: t.name }))}
              value={templateId}
              onChange={(v) => onTemplate(v)}
              placeholder="Apply template…"
              emptyText="No templates"
            />
          </div>
        </div>
        <label className={cn("flex items-center gap-2 rounded border px-3 py-2 text-xs font-medium", criticalFinding ? "border-allergy/40 bg-allergy/10 text-allergy" : "border-border bg-card text-muted-foreground")}>
          <input
            type="checkbox"
            checked={criticalFinding}
            disabled={readOnly}
            onChange={(e) => onCriticalChange(e.target.checked)}
            className="h-3.5 w-3.5 accent-allergy"
          />
          <AlertTriangle className="h-3.5 w-3.5" />
          Critical finding — notify referring physician
        </label>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {sections.map((sec, idx) => (
            <div key={sec.heading}>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{sec.heading}</label>
              <textarea
                value={sec.text}
                disabled={readOnly}
                onChange={(e) => update(idx, e.target.value)}
                rows={sec.heading === "Findings" ? 6 : sec.heading === "Impression" ? 3 : 2}
                className="mt-1 w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-70"
                placeholder={`Dictate ${sec.heading.toLowerCase()}…`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SaveIndicator({ state }: { state: Props["saveState"] }) {
  const label =
    state === "saving" ? "Saving…" :
    state === "saved" ? "Saved" :
    state === "dirty" ? "Unsaved" : "—";
  const tone =
    state === "saving" ? "text-condition-foreground" :
    state === "saved" ? "text-status-ok" :
    state === "dirty" ? "text-allergy" : "text-muted-foreground";
  return (
    <div className={cn("flex items-center gap-1.5 text-[11px] font-medium", tone)}>
      <Save className="h-3 w-3" /> {label}
    </div>
  );
}