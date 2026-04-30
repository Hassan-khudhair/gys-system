"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "../../lib/supabase/client";
import { useLocale } from "../../lib/i18n";
import { StatsCard } from "../../components/stats-card";
import { getPlayerStatus, formatDateShort } from "@gym/lib";
import { Users, CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";
import type { Player } from "@gym/lib";

export default function DashboardPage() {
  const { t } = useLocale();
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0, expiring: 0 });
  const [expiringPlayers, setExpiringPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: adminRecord } = await supabase.from("gym_admins").select("gym_id").eq("user_id", user.id).single();
    const gymId = adminRecord?.gym_id;
    if (!gymId) { setLoading(false); return; }

    const today = new Date().toISOString().slice(0, 10);
    const sevenDaysLater = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

    const [
      { count: total },
      { count: active },
      { count: expired },
      { count: expiring },
      { data: expPlayers },
    ] = await Promise.all([
      supabase.from("players").select("*", { count: "exact", head: true }).eq("gym_id", gymId),
      supabase.from("players").select("*", { count: "exact", head: true }).eq("gym_id", gymId).gte("end_date", today),
      supabase.from("players").select("*", { count: "exact", head: true }).eq("gym_id", gymId).lt("end_date", today),
      supabase.from("players").select("*", { count: "exact", head: true }).eq("gym_id", gymId).gte("end_date", today).lte("end_date", sevenDaysLater),
      supabase.from("players").select("*").eq("gym_id", gymId).gte("end_date", today).lte("end_date", sevenDaysLater).order("end_date"),
    ]);

    setStats({ total: total ?? 0, active: active ?? 0, expired: expired ?? 0, expiring: expiring ?? 0 });
    setExpiringPlayers(expPlayers ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title={t("total_members")} value={stats.total} icon={Users} iconColor="text-primary" iconBg="bg-primary/15" />
          <StatsCard title={t("active")} value={stats.active} icon={CheckCircle2} iconColor="text-success" iconBg="bg-success/15" />
          <StatsCard title={t("expired")} value={stats.expired} icon={XCircle} iconColor="text-danger" iconBg="bg-danger/15" />
          <StatsCard title={t("expiring_soon")} value={stats.expiring} icon={AlertTriangle} iconColor="text-warning" iconBg="bg-warning/15" trend={t("within_7_days")} />
        </div>

        {expiringPlayers.length > 0 && (
          <div className="bg-warning/5 border border-warning/20 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-warning/20 flex items-center gap-2">
              <Clock className="w-4 h-4 text-warning" />
              <h2 className="text-sm font-semibold text-warning">{t("expiring_7_days")}</h2>
            </div>
            <div className="divide-y divide-warning/10">
              {expiringPlayers.map((player) => {
                const { daysText } = getPlayerStatus(player.end_date);
                return (
                  <div key={player.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-text">{player.name}</p>
                      {player.phone && <p className="text-xs text-muted">{player.phone}</p>}
                    </div>
                    <div className="text-end">
                      <p className="text-xs text-warning font-medium">{daysText}</p>
                      <p className="text-xs text-muted">{formatDateShort(player.end_date)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-3 border-t border-warning/20">
              <Link href="/dashboard/players" className="text-xs text-warning hover:underline font-medium">
                {t("view_all_players")}
              </Link>
            </div>
          </div>
        )}

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
