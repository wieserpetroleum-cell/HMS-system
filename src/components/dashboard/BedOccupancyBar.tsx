interface BedOccupancyBarProps {
  ward: string;
  total: number;
  occupied: number;
  available: number;
}

export function BedOccupancyBar({ ward, total, occupied, available }: BedOccupancyBarProps) {
  const other = total - occupied - available;
  const pct = (n: number) => (n / total) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">{ward}</span>
        <span className="tabular-nums text-muted-foreground">
          {occupied}/{total} occupied
        </span>
      </div>
      <div className="flex h-2 overflow-hidden rounded-full bg-muted">
        <div className="bg-primary" style={{ width: `${pct(occupied)}%` }} />
        <div className="bg-condition/60" style={{ width: `${pct(other)}%` }} />
        <div className="bg-status-ok/40" style={{ width: `${pct(available)}%` }} />
      </div>
    </div>
  );
}