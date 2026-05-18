interface Props {
  values: number[];
  width?: number;
  height?: number;
  stroke?: string;
}

export function VitalsSparkline({ values, width = 80, height = 24, stroke = "currentColor" }: Props) {
  if (values.length < 2) return <span className="text-[10px] text-muted-foreground">—</span>;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  const points = values
    .map((v, i) => `${(i * step).toFixed(1)},${(height - ((v - min) / range) * height).toFixed(1)}`)
    .join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline fill="none" stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" points={points} />
      <circle cx={width} cy={height - ((values[values.length - 1] - min) / range) * height} r={2} fill={stroke} />
    </svg>
  );
}