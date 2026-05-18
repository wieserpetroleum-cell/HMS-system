import { cn } from "@/lib/utils";
import type { RadiologySeries } from "@/lib/types";

// Deterministic placeholder tile based on seed.
function seedToHsl(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return { hue, s2: (h >> 8) % 360 };
}

export function SeriesThumbnail({
  series,
  active,
  onClick,
}: {
  series: RadiologySeries;
  active?: boolean;
  onClick?: () => void;
}) {
  const { hue, s2 } = seedToHsl(series.thumbnailHint);
  const bg = `radial-gradient(circle at 30% 30%, hsl(${hue} 60% 22%), hsl(${s2} 80% 6%) 70%)`;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative aspect-square w-full overflow-hidden rounded-md border text-left transition",
        active ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-primary/60",
      )}
    >
      <div className="absolute inset-0" style={{ background: bg }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,_rgba(255,255,255,0.08),_transparent_60%)]" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-[10px] font-medium uppercase tracking-wide text-white">
        <div className="truncate">{series.description}</div>
        <div className="opacity-70">{series.imageCount} img</div>
      </div>
    </button>
  );
}

export function SeriesStage({ series }: { series?: RadiologySeries }) {
  if (!series) {
    return (
      <div className="grid h-full place-items-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
        No series selected
      </div>
    );
  }
  const { hue, s2 } = seedToHsl(series.thumbnailHint);
  const bg = `radial-gradient(ellipse at 35% 35%, hsl(${hue} 55% 28%), hsl(${s2} 70% 4%) 75%)`;
  return (
    <div className="relative h-full w-full overflow-hidden rounded-md border border-border bg-black">
      <div className="absolute inset-0" style={{ background: bg }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_60%,_rgba(255,255,255,0.06),_transparent_55%)]" />
      <div className="absolute left-3 top-3 rounded bg-black/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white/80">
        {series.description} · {series.imageCount} img
      </div>
      <div className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white/60">
        Preview only — not a real image
      </div>
    </div>
  );
}