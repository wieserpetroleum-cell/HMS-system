import { cn } from "@/lib/utils";

const tones = {
  ok: "bg-status-ok/15 text-status-ok border-status-ok/30",
  warn: "bg-condition/20 text-condition-foreground border-condition/40",
  danger: "bg-allergy/15 text-allergy border-allergy/30",
  neutral: "bg-muted text-muted-foreground border-border",
  info: "bg-primary/10 text-primary border-primary/30",
} as const;

export type PillTone = keyof typeof tones;

export function StatusPill({
  tone = "neutral",
  children,
  className,
}: {
  tone?: PillTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}