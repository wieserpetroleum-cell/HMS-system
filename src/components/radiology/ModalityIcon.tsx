import { Activity, Bone, Brain, Heart, ScanLine, Waves } from "lucide-react";
import type { Modality } from "@/lib/types";
import { cn } from "@/lib/utils";

const map: Record<Modality, { Icon: React.ComponentType<{ className?: string }>; label: string }> = {
  xray: { Icon: Bone, label: "X-Ray" },
  ct: { Icon: ScanLine, label: "CT" },
  mri: { Icon: Brain, label: "MRI" },
  usg: { Icon: Waves, label: "USG" },
  mammo: { Icon: Heart, label: "Mammo" },
  dexa: { Icon: Activity, label: "DEXA" },
};

export function ModalityIcon({ modality, className, showLabel = false }: { modality: Modality; className?: string; showLabel?: boolean }) {
  const { Icon, label } = map[modality];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-muted-foreground", className)}>
      <Icon className="h-4 w-4" />
      {showLabel && <span className="text-xs font-medium uppercase tracking-wide">{label}</span>}
    </span>
  );
}

export function modalityLabel(modality: Modality) {
  return map[modality].label;
}