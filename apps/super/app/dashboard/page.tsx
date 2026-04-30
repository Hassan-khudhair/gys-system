"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "../../lib/supabase/client";
import { useLocale } from "../../lib/i18n";
import { StatsCard } from "../../components/stats-card";
import { formatDate } from "@gym/lib";
import { Building2, Users, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";
import type { GymSummary } from "@gym/lib";

export default function DashboardPage() {
  const { t } = useLocale();
  const [gymList, setGymList] = useState<GymSummary[]>([]);
  const [stats, setStats] = useState({ totalPlayers: 0, activePlayers: 0, pendingCount: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const supabase = createClient();
    const today = new Date().toISOString().slice(0, 10);
    const [
      { data: gyms },
      { count: totalPlayers },
      { count: activePlayers },
      { count: pendingApps },
    ] = await Promise.all([
      supabase.from("gym_summary").select("*").order("created_at", { ascending: false }),
      supabase.from("players").select("*", { count: "exact", head: true }),
      supabase.from("players").select("*", { count: "exact", head: true }).gte("end_date", today),
      supabase.from("gym_applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ]);
    setGymList(gyms ?? []);
    setStats({ totalPlayers: totalPlayers ?? 0, activePlayers: activePlayers ?? 0, pendingCount: pendingApps ?? 0 });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalGyms = gymList.length;
  const activeGyms = gymList.filter((g) => g.status === "active").length;
  const expiringSoon = gymList.reduce((sum, g) => sum + (g.expiring_soon ?? 0), 0);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-5 border-b border-border">
        <h1 className="text-lg font-semibold text-text">{t("dashboard_title")}</h1>
        <p className="text-sm text-muted mt-0.5">{t("dashboard_subtitle")}</p>
      </div>

      <div className="p-6 space-y-6">
        {!loading && stats.pendingCount > 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text">
                  {stats.pendingCount} {stats.pendingCount > 1 ? t("pending_apps_plural") : t("pending_apps")}
                </p>
                <p className="text-xs text-muted">{t("review_note")}</p>
              </div>
            </div>
            <Link href="/dashboard/applications"
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded-lg transition-colors">
              {t("review_now")}
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title={t("total_gyms")} value={loading ? "—" : totalGyms} icon={Building2} iconColor="text-primary" iconBg="bg-primary/15" />
          <StatsCard title={t("active_gyms")} value={loading ? "—" : activeGyms} icon={CheckCircle2} iconColor="text-success" iconBg="bg-success/15" />
          <StatsCard title={t("total_members")} value={loading ? "—" : stats.totalPlayers} icon={Users} iconColor="text-[#38BDF8]" iconBg="bg-[#38BDF8]/15" />
          <StatsCard title={t("expiring_soon")} value={loading ? "—" : expiringSoon} icon={AlertTriangle} iconColor="text-warning" iconBg="bg-warning/15" trend={t("within_7_days")} />
        </div>

        <div className="bg-surface border border-border rounded-xl overflow-hidden transition-colors">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text">{t("recent_gyms")}</h2>
            <Link href="/dashboard/gyms" className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
              {t("view_all")}
            </Link>
          </div>
          <div className="divide-y divide-border">
            {gymList.slice(0, 5).length === 0 && (
              <div className="px-5 py-10 text-center text-muted text-sm">
                {t("no_gyms_yet")}{" "}
                <Link href="/dashboard/gyms" className="text-primary hover:underline">{t("create_first_gym")}</Link>
              </div>
            )}
            {gymList.slice(0, 5).map((gym) => (
              <Link key={gym.id} href={`/dashboard/gyms/${gym.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-2/60 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">{gym.name.slice(0, 2).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">{gym.name}</p>
                  <p className="text-xs text-muted">{gym.city ?? t("no_city")}</p>
                </div>
                <div className="hidden sm:block text-end shrink-0">
                  <p className="text-sm font-medium text-text">{gym.total_members ?? 0}</p>
                  <p className="text-xs text-muted">{t("members")}</p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  gym.status === "active" ? "text-success bg-success/10"
                  : gym.status === "suspended" ? "text-danger bg-danger/10"
                  : "text-muted bg-muted/10"
                }`}>
                  {gym.status}
                </span>
                <p className="hidden md:block text-xs text-faint shrink-0 w-24 text-end">{formatDate(gym.created_at)}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
