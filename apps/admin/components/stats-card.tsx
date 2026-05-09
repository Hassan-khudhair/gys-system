import { type LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBg?: string;
  trend?: string;
}

export function StatsCard({ title, value, icon: Icon, iconColor, trend }: StatsCardProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-muted uppercase tracking-wider">{title}</p>
        <Icon className={`w-4 h-4 shrink-0 opacity-60 ${iconColor}`} />
      </div>
      <p className="text-3xl font-bold text-text tabular-nums leading-none">{value}</p>
      {trend && <p className="text-xs text-muted mt-2">{trend}</p>}
    </div>
  );
}
