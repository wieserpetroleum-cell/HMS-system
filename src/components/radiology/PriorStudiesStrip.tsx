import { Link } from "react-router-dom";
import type { RadiologyOrder } from "@/lib/types";
import { ModalityIcon } from "./ModalityIcon";

export function PriorStudiesStrip({ studies }: { studies: RadiologyOrder[] }) {
  if (studies.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border p-3 text-[11px] text-muted-foreground">
        No prior imaging on file.
      </div>
    );
  }
  return (
    <div>
      <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Prior studies</div>
      <ul className="flex gap-2 overflow-x-auto pb-1">
        {studies.map((s) => (
          <li key={s.id} className="shrink-0">
            <Link
              to="/radiology/studies/$id"
              params={{ id: s.id }}
              className="block w-40 rounded-md border border-border bg-card p-2 transition hover:border-primary/50"
            >
              <div className="flex items-center justify-between">
                <ModalityIcon modality={s.modality} />
                <span className="font-mono text-[10px] text-muted-foreground">{new Date(s.orderedAt).toLocaleDateString()}</span>
              </div>
              <div className="mt-1 truncate text-xs font-medium">{s.studyName}</div>
              <div className="truncate text-[10px] text-muted-foreground">{s.bodyPart}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}