"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "../../lib/supabase/client";
import { useLocale } from "../../lib/i18n";
import { useAdmin } from "../../lib/admin-context";
import { StatsCard } from "../../components/stats-card";
import { DonutChart, HBarChart, Legend } from "../../components/charts";
import { formatDateShort } from "@gym/lib";
import { Users, CheckCircle2, XCircle, AlertTriangle, Clock, Banknote, TrendingUp } from "lucide-react";
import Link from "next/link";
import type { Player } from "@gym/lib";

interface GymStats {
  total: number;
  active: number;
  expired: number;
  expiring: number;
  total_revenue: number;
  monthly_revenue: number;
  fitness_revenue: number;
  bodybuilding_revenue: number;
  fitness_members: number;
  bodybuilding_members: number;
}

export default function DashboardPage() {
  const { t } = useLocale();
  const { gymId } = useAdmin();
  const [stats, setStats] = useState<GymStats | null>(null);
  const [expiringPlayers, setExpiringPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!gymId) return;
    const supabase = createClient();
    const today = new Date().toISOString().slice(0, 10);
    const sevenDaysLater = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

    // ONE RPC call replaces 5+ separate count queries
    const [{ data: statsData }, { data: expPlayers }] = await Promise.all([
      supabase.rpc("get_gym_stats", { p_gym_id: gymId }),
      supabase.from("players").select("id,name,phone,end_date")
        .eq("gym_id", gymId)
        .gte("end_date", today)
        .lte("end_date", sevenDaysLater)
        .order("end_date")
        .limit(10),
    ]);

    setStats(statsData as GymStats);
    setExpiringPlayers((expPlayers ?? []) as unknown as Player[]);
    setLoading(false);
  }, [gymId]);

  useEffect(() => { load(); }, [load]);

  function fmtCurrency(val: number) {
    return val.toLocaleString() + " " + t("currency");
  }

  function daysLeft(endDate: string) {
    const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);
    return diff + "d left";
  }

  const memberSegments = stats ? [
    { label: t("active"),        value: stats.active,   color: "#22C55E" },
    { label: t("expiring_soon"), value: stats.expiring, color: "#F59E0B" },
    { label: t("expired"),       value: stats.expired,  color: "#EF4444" },
  ] : [];

  const exerciseSegments = stats ? [
    { label: t("fitness"),      value: stats.fitness_members,      color: "#38BDF8" },
    { label: t("bodybuilding"), value: stats.bodybuilding_members, color: "#F59E0B" },
  ] : [];

  const revenueSegments = stats ? [
    { label: t("fitness"),      value: stats.fitness_revenue,      color: "#38BDF8" },
    { label: t("bodybuilding"), value: stats.bodybuilding_revenue, color: "#F59E0B" },
  ] : [];

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-5 border-b border-border">
          <h1 className="text-lg font-semibold text-text">{t("dashboard_title")}</h1>
          <p className="text-sm text-muted mt-0.5">{t("dashboard_subtitle")}</p>
        </div>
        <div className="p-6 flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-5 border-b border-border">
        <h1 className="text-lg font-semibold text-text">{t("dashboard_title")}</h1>
        <p className="text-sm text-muted mt-0.5">{t("dashboard_subtitle")}</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Member stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title={t("total_members")}  value={stats?.total ?? 0}    icon={Users}         iconColor="text-primary"  iconBg="bg-primary/15" />
          <StatsCard title={t("active")}          value={stats?.active ?? 0}   icon={CheckCircle2}  iconColor="text-success"  iconBg="bg-success/15" />
          <StatsCard title={t("expired")}         value={stats?.expired ?? 0}  icon={XCircle}       iconColor="text-danger"   iconBg="bg-danger/15" />
          <StatsCard title={t("expiring_soon")}   value={stats?.expiring ?? 0} icon={AlertTriangle} iconColor="text-warning"  iconBg="bg-warning/15" trend={t("within_7_days")} />
        </div>

        {/* Revenue stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title={t("total_revenue")}        value={fmtCurrency(stats?.total_revenue ?? 0)}        icon={Banknote}  iconColor="text-primary" iconBg="bg-primary/15" />
          <StatsCard title={t("monthly_revenue")}      value={fmtCurrency(stats?.monthly_revenue ?? 0)}      icon={TrendingUp} iconColor="text-success" iconBg="bg-success/15" />
          <StatsCard title={t("fitness_revenue")}      value={fmtCurrency(stats?.fitness_revenue ?? 0)}      icon={Users} iconColor="text-[#38BDF8]" iconBg="bg-[#38BDF8]/15" />
          <StatsCard title={t("bodybuilding_revenue")} value={fmtCurrency(stats?.bodybuilding_revenue ?? 0)} icon={Users} iconColor="text-warning"   iconBg="bg-warning/15" />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Member status donut */}
          <div className="bg-surface border border-border rounded-xl p-5 transition-colors">
            <h3 className="text-sm font-semibold text-text mb-4">{t("total_members")}</h3>
            <div className="flex items-center gap-5">
              <DonutChart segments={memberSegments} size={110} />
              <Legend segments={memberSegments} />
            </div>
          </div>

          {/* Exercise type distribution */}
          <div className="bg-surface border border-border rounded-xl p-5 transition-colors">
            <h3 className="text-sm font-semibold text-text mb-4">{t("exercise_type_label")}</h3>
            <div className="flex items-center gap-5">
              <DonutChart segments={exerciseSegments} size={110} />
              <Legend segments={exerciseSegments} />
            </div>
          </div>

          {/* Revenue by type */}
          <div className="bg-surface border border-border rounded-xl p-5 transition-colors">
            <h3 className="text-sm font-semibold text-text mb-4">{t("total_revenue")}</h3>
            <HBarChart segments={revenueSegments.map((s) => ({ ...s, value: s.value }))} />
            <p className="text-xs text-muted mt-3">{t("currency")}</p>
          </div>
        </div>

        {/* Expiring soon */}
        {expiringPlayers.length > 0 && (
          <div className="bg-warning/5 border border-warning/20 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-warning/20 flex items-center gap-2">
              <Clock className="w-4 h-4 text-warning" />
              <h2 className="text-sm font-semibold text-warning">{t("expiring_7_days")}</h2>
            </div>
            <div className="divide-y divide-warning/10">
              {expiringPlayers.map((player) => (
                <div key={player.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-text">{player.name}</p>
                    {player.phone && <p className="text-xs text-muted">{player.phone}</p>}
                  </div>
                  <div className="text-end">
                    <p className="text-xs text-warning font-medium">{daysLeft(player.end_date)}</p>
                    <p className="text-xs text-muted">{formatDateShort(player.end_date)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-warning/20">
              <Link href="/dashboard/players" className="text-xs text-warning hover:underline font-medium">
                {t("view_all_players")}
              </Link>
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/dashboard/players"
            className="bg-surface border border-border rounded-xl p-5 hover:border-primary/40 hover:bg-primary/5 transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-text text-sm">{t("manage_players")}</p>
                <p className="text-xs text-muted">{t("manage_players_desc")}</p>
              </div>
            </div>
          </Link>
          <Link href="/dashboard/expired"
            className="bg-surface border border-border rounded-xl p-5 hover:border-danger/40 hover:bg-danger/5 transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-danger/15 rounded-xl flex items-center justify-center group-hover:bg-danger/25 transition-colors">
                <XCircle className="w-5 h-5 text-danger" />
              </div>
              <div>
                <p className="font-semibold text-text text-sm">{t("expired_members")}</p>
                <p className="text-xs text-muted">{t("expired_members_desc")}</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
