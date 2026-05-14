import { type LucideIcon } from "lucide-react";

const BORDER_MAP: Record<string, string> = {
  "text-primary":    "border-s-primary",
  "text-success":    "border-s-success",
  "text-danger":     "border-s-danger",
  "text-warning":    "border-s-warning",
  "text-[#38BDF8]":  "[border-inline-start-color:#38BDF8]",
};

const ICON_BG_MAP: Record<string, string> = {
  "text-primary":    "bg-primary/10",
  "text-success":    "bg-success/10",
  "text-danger":     "bg-danger/10",
  "text-warning":    "bg-warning/10",
  "text-[#38BDF8]":  "bg-[#38BDF8]/10",
};

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBg?: string;
  trend?: string;
}

export function StatsCard({ title, value, icon: Icon, iconColor, trend }: StatsCardProps) {
  const borderClass = BORDER_MAP[iconColor] ?? "";
  const iconBgClass = ICON_BG_MAP[iconColor] ?? "bg-surface-2";

  return (
    <div
      className={`bg-surface border border-border border-s-2 ${borderClass} rounded-xl p-5 transition-all duration-200 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-px`}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-semibold text-muted uppercase tracking-wider leading-none pt-0.5">
          {title}
        </p>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconBgClass}`}>
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-text tabular-nums leading-none tracking-tight">{value}</p>
      {trend && (
        <p className="text-[11px] text-muted mt-2 leading-none">{trend}</p>
      )}
    </div>
  );
}
