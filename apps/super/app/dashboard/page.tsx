import { createClient } from "../../lib/supabase/server";
import { Header } from "../../components/header";
import { StatsCard } from "../../components/stats-card";
import { formatDate } from "@gym/lib";
import { Building2, Users, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { data: gyms },
    { count: totalPlayers },
    { count: activePlayers },
    { count: pendingApps }
  ] = await Promise.all([
    supabase.from("gym_summary").select("*").order("created_at", { ascending: false }),
    supabase.from("players").select("*", { count: "exact", head: true }),
    supabase
      .from("players")
      .select("*", { count: "exact", head: true })
      .gte("end_date", new Date().toISOString().slice(0, 10)),
    supabase.from("gym_applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const gymList = gyms ?? [];
  const totalGyms = gymList.length;
  const activeGyms = gymList.filter((g) => g.status === "active").length;
  const expiringSoon = gymList.reduce((sum, g) => sum + (g.expiring_soon ?? 0), 0);
  const pendingCount = pendingApps ?? 0;

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Dashboard" subtitle="Overview of all gyms and members" />

      <div className="p-6 space-y-6">
        {/* Pending Applications Alert */}
        {pendingCount > 0 && (
          <div className="bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#8B5CF6]/15 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {pendingCount} Pending Gym Application{pendingCount > 1 ? "s" : ""}
                </p>
                <p className="text-xs text-[#94A3B8]">Review and approve new gym registration requests</p>
              </div>
            </div>
            <Link
              href="/dashboard/applications"
              className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Review Now
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Gyms"
            value={totalGyms}
            icon={Building2}
            iconColor="text-[#8B5CF6]"
            iconBg="bg-[#8B5CF6]/15"
          />
          <StatsCard
            title="Active Gyms"
            value={activeGyms}
            icon={CheckCircle2}
            iconColor="text-[#22C55E]"
            iconBg="bg-[#22C55E]/15"
          />
          <StatsCard
            title="Total Members"
            value={totalPlayers ?? 0}
            icon={Users}
            iconColor="text-[#38BDF8]"
            iconBg="bg-[#38BDF8]/15"
          />
          <StatsCard
            title="Expiring Soon"
            value={expiringSoon}
            icon={AlertTriangle}
            iconColor="text-[#F59E0B]"
            iconBg="bg-[#F59E0B]/15"
            trend="Within next 7 days"
          />
        </div>

        {/* Recent Gyms */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#334155] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Recent Gyms</h2>
            <Link href="/dashboard/gyms" className="text-xs text-[#8B5CF6] hover:text-[#7C3AED] font-medium transition-colors">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-[#334155]">
            {gymList.slice(0, 5).length === 0 && (
              <div className="px-5 py-10 text-center text-[#94A3B8] text-sm">
                No gyms yet.{" "}
                <Link href="/dashboard/gyms" className="text-[#8B5CF6] hover:underline">
                  Create the first gym →
                </Link>
              </div>
            )}
            {gymList.slice(0, 5).map((gym) => (
              <Link
                key={gym.id}
                href={`/dashboard/gyms/${gym.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#263348]/60 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-[#8B5CF6]">
                    {gym.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{gym.name}</p>
                  <p className="text-xs text-[#94A3B8]">{gym.city ?? "No city"}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-white">{gym.total_members ?? 0}</p>
                  <p className="text-xs text-[#94A3B8]">members</p>
                </div>
                <div
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    gym.status === "active"
                      ? "text-[#22C55E] bg-[#22C55E]/10"
                      : gym.status === "suspended"
                      ? "text-[#EF4444] bg-[#EF4444]/10"
                      : "text-[#94A3B8] bg-[#94A3B8]/10"
                  }`}
                >
                  {gym.status}
                </div>
                <p className="text-xs text-[#475569] flex-shrink-0 w-24 text-right">
                  {formatDate(gym.created_at)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
