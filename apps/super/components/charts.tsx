"use client";

interface Segment {
  label: string;
  value: number;
  color: string;
}

function n(val: number | null | undefined): number {
  return val ?? 0;
}

export function DonutChart({ segments, size = 140 }: { segments: Segment[]; size?: number }) {
  const total = segments.reduce((s, seg) => s + n(seg.value), 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 14;

  if (total === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth="16"
          className="text-border" />
      </svg>
    );
  }

  let offset = -Math.PI / 2;
  const arcs = segments
    .filter((s) => n(s.value) > 0)
    .map((seg) => {
      const angle = (n(seg.value) / total) * 2 * Math.PI;
      const x1 = cx + r * Math.cos(offset);
      const y1 = cy + r * Math.sin(offset);
      offset += angle;
      const x2 = cx + r * Math.cos(offset);
      const y2 = cy + r * Math.sin(offset);
      return { seg, x1, y1, x2, y2, large: angle > Math.PI ? 1 : 0 };
    });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth="16"
        className="text-border opacity-30" />
      {arcs.map(({ seg, x1, y1, x2, y2, large }) => (
        <path key={seg.label}
          d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
          fill="none" stroke={seg.color} strokeWidth="16" strokeLinecap="round" />
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" dominantBaseline="middle"
        className="fill-text" fontSize="22" fontWeight="700">{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="middle"
        className="fill-muted" fontSize="10">total</text>
    </svg>
  );
}

export function HBarChart({ segments }: { segments: Segment[] }) {
  const max = Math.max(...segments.map((s) => n(s.value)), 1);
  return (
    <div className="space-y-3 w-full">
      {segments.map((seg) => (
        <div key={seg.label}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted">{seg.label}</span>
            <span className="text-xs font-semibold text-text">{n(seg.value).toLocaleString("en-US")}</span>
          </div>
          <div className="h-2 rounded-full bg-border overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(n(seg.value) / max) * 100}%`, backgroundColor: seg.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Legend({ segments }: { segments: Segment[] }) {
  const total = segments.reduce((s, seg) => s + n(seg.value), 0);
  return (
    <div className="space-y-2">
      {segments.map((seg) => {
        const pct = total > 0 ? Math.round((n(seg.value) / total) * 100) : 0;
        return (
          <div key={seg.label} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-xs text-muted">{seg.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text">{n(seg.value).toLocaleString("en-US")}</span>
              <span className="text-[10px] text-faint w-8 text-end">{pct}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
