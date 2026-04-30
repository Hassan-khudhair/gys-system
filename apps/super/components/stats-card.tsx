import { type LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  trend?: string;
}

export function StatsCard({ title, value, icon: Icon, iconColor, iconBg, trend }: StatsCardProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex items-start gap-4 transition-colors">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted font-medium truncate">{title}</p>
        <p className="text-2xl font-bold text-text mt-0.5">{value}</p>
        {trend && <p className="text-xs text-muted mt-1">{trend}</p>}
      </div>
    </div>
  );
}
