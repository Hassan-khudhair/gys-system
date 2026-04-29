import { createClient } from "../../lib/supabase/server";
import { Header } from "../../components/header";
import { StatsCard } from "../../components/stats-card";
import { getPlayerStatus, formatDateShort } from "@gym/lib";
import { Users, CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Find which gym this admin manages
  const { data: adminRecord } = await supabase
    .from("gym_admins")
    .select("gym_id")
    .eq("user_id", user!.id)
    .single();

  const gymId = adminRecord?.gym_id;

  const today = new Date().toISOString().slice(0, 10);
  const sevenDaysLater = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  const [
    { count: total },
    { count: active },
    { count: expired },
    { count: expiring },
    { data: expiringPlayers },
  ] = await Promise.all([
    supabase.from("players").select("*", { count: "exact", head: true }).eq("gym_id", gymId),
    supabase.from("players").select("*", { count: "exact", head: true }).eq("gym_id", gymId).gte("end_date", today),
    supabase.from("players").select("*", { count: "exact", head: true }).eq("gym_id", gymId).lt("end_date", today),
    supabase.from("players").select("*", { count: "exact", head: true }).eq("gym_id", gymId).gte("end_date", today).lte("end_date", sevenDaysLater),
    supabase.from("players").select("*").eq("gym_id", gymId).gte("end_date", today).lte("end_date", sevenDaysLater).order("end_date"),
  ]);

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Dashboard" subtitle="Your gym overview" />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Members"
            value={total ?? 0}
            icon={Users}
            iconColor="text-[#F59E0B]"
            iconBg="bg-[#F59E0B]/15"
          />
          <StatsCard
            title="Active"
            value={active ?? 0}
            icon={CheckCircle2}
            iconColor="text-[#22C55E]"
            iconBg="bg-[#22C55E]/15"
          />
          <StatsCard
            title="Expired"
            value={expired ?? 0}
            icon={XCircle}
            iconColor="text-[#EF4444]"
            iconBg="bg-[#EF4444]/15"
          />
          <StatsCard
            title="Expiring Soon"
            value={expiring ?? 0}
            icon={AlertTriangle}
            iconColor="text-[#F59E0B]"
            iconBg="bg-[#F59E0B]/15"
            trend="Within 7 days"
          />
        </div>

        {/* Expiring Soon Alert */}
        {(expiringPlayers?.length ?? 0) > 0 && (
          <div className="bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#F59E0B]/20 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F59E0B]" />
              <h2 className="text-sm font-semibold text-[#F59E0B]">Expiring in the next 7 days</h2>
            </div>
            <div className="divide-y divide-[#F59E0B]/10">
              {expiringPlayers!.map((player) => {
                const { daysText } = getPlayerStatus(player.end_date);
                return (
                  <div key={player.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-white">{player.name}</p>
                      {player.phone && <p className="text-xs text-[#94A3B8]">{player.phone}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#F59E0B] font-medium">{daysText}</p>
                      <p className="text-xs text-[#94A3B8]">{formatDateShort(player.end_date)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-3 border-t border-[#F59E0B]/20">
              <Link href="/dashboard/players" className="text-xs text-[#F59E0B] hover:underline font-medium">
                View all players →
              </Link>
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/dashboard/players"
            className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 hover:border-[#F59E0B]/40 hover:bg-[#F59E0B]/5 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F59E0B]/15 rounded-xl flex items-center justify-center group-hover:bg-[#F59E0B]/25 transition-colors">
                <Users className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Manage Players</p>
                <p className="text-xs text-[#94A3B8]">Add, edit, renew memberships</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/expired"
            className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 hover:border-[#EF4444]/40 hover:bg-[#EF4444]/5 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#EF4444]/15 rounded-xl flex items-center justify-center group-hover:bg-[#EF4444]/25 transition-colors">
                <XCircle className="w-5 h-5 text-[#EF4444]" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Expired Members</p>
                <p className="text-xs text-[#94A3B8]">Follow up and renew</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
