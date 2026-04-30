"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "../../lib/supabase/client";
import { useLocale } from "../../lib/i18n";
import { StatsCard } from "../../components/stats-card";
import { DonutChart, HBarChart, Legend } from "../../components/charts";
import { formatDate } from "@gym/lib";
import { Building2, Users, CheckCircle2, AlertTriangle, Clock, Banknote, TrendingUp } from "lucide-react";
import Link from "next/link";
import type { GymSummary } from "@gym/lib";

interface AllStats {
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
  const [gymList, setGymList] = useState<GymSummary[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [stats, setStats] = useState<AllStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const supabase = createClient();

    // Three parallel queries instead of many sequential ones
    const [
      { data: gyms },
      { count: pending },
      { data: allStats },
    ] = await Promise.all([
      supabase.from("gym_summary").select("*").order("created_at", { ascending: false }),
      supabase.from("gym_applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.rpc("get_all_gym_stats"),
    ]);

    setGymList(gyms ?? []);
    setPendingCount(pending ?? 0);
    setStats(allStats as AllStats);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalGyms = gymList.length;
  const activeGyms = gymList.filter((g) => g.status === "active").length;

  function fmtCurrency(val: number) {
    return val.toLocaleString() + " " + t("currency");
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
    { label: t("fitness_revenue"),      value: stats.fitness_revenue,      color: "#38BDF8" },
    { label: t("bodybuilding_revenue"), value: stats.bodybuilding_revenue, color: "#F59E0B" },
  ] : [];

  const topGyms = [...gymList]
    .sort((a, b) => (b.total_members ?? 0) - (a.total_members ?? 0))
    .slice(0, 6)
    .map((g) => ({ label: g.name, value: g.total_members ?? 0, color: "#6366F1" }));

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-5 border-b border-border">
        <h1 className="text-lg font-semibold text-text">{t("dashboard_title")}</h1>
        <p className="text-sm text-muted mt-0.5">{t("dashboard_subtitle")}</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Pending apps notice */}
        {!loading && pendingCount > 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text">
                  {pendingCount} {pendingCount > 1 ? t("pending_apps_plural") : t("pending_apps")}
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

        {/* Gym + member stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title={t("total_gyms")}    value={loading ? "—" : totalGyms}            icon={Building2}   iconColor="text-primary"    iconBg="bg-primary/15" />
          <StatsCard title={t("active_gyms")}   value={loading ? "—" : activeGyms}           icon={CheckCircle2} iconColor="text-success"    iconBg="bg-success/15" />
          <StatsCard title={t("total_members")} value={loading ? "—" : (stats?.total ?? 0)}  icon={Users}        iconColor="text-[#38BDF8]"  iconBg="bg-[#38BDF8]/15" />
          <StatsCard title={t("expiring_soon")} value={loading ? "—" : (stats?.expiring ?? 0)} icon={AlertTriangle} iconColor="text-warning" iconBg="bg-warning/15" trend={t("within_7_days")} />
        </div>

        {/* Revenue stats */}
        {!loading && stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title={t("total_revenue")}        value={fmtCurrency(stats.total_revenue)}        icon={Banknote}   iconColor="text-primary" iconBg="bg-primary/15" />
            <StatsCard title={t("monthly_revenue")}      value={fmtCurrency(stats.monthly_revenue)}      icon={TrendingUp} iconColor="text-success" iconBg="bg-success/15" />
            <StatsCard title={t("fitness_revenue")}      value={fmtCurrency(stats.fitness_revenue)}      icon={Users} iconColor="text-[#38BDF8]" iconBg="bg-[#38BDF8]/15" />
            <StatsCard title={t("bodybuilding_revenue")} value={fmtCurrency(stats.bodybuilding_revenue)} icon={Users} iconColor="text-warning"   iconBg="bg-warning/15" />
          </div>
        )}

        {/* Charts row */}
        {!loading && stats && (
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
              <HBarChart segments={revenueSegments} />
              <p className="text-xs text-muted mt-3">{t("currency")}</p>
            </div>
          </div>
        )}

        {/* Top gyms by members */}
        {!loading && topGyms.length > 0 && (
          <div className="bg-surface border border-border rounded-xl p-5 transition-colors">
            <h3 className="text-sm font-semibold text-text mb-4">{t("gyms_title")} — {t("col_members")}</h3>
            <HBarChart segments={topGyms} />
          </div>
        )}

        {/* Recent gyms */}
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
                  gym.status === "active"    ? "text-success bg-success/10"
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
