import { createClient } from "../../../../lib/supabase/server";
import { Header } from "../../../../components/header";
import { notFound } from "next/navigation";
import { formatDate, formatDateShort, getPlayerStatus } from "@gym/lib";
import {
  Building2, Users, CheckCircle2, AlertTriangle, Phone, Mail, MapPin,
  ArrowLeft, Clock
} from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GymDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: gym }, { data: players }] = await Promise.all([
    supabase.from("gym_summary").select("*").eq("id", id).single(),
    supabase
      .from("players")
      .select("*")
      .eq("gym_id", id)
      .order("end_date", { ascending: true }),
  ]);

  if (!gym) notFound();

  const playerList = players ?? [];

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title={gym.name} subtitle={gym.city ?? undefined} />

      <div className="p-6 space-y-6">
        {/* Back link */}
        <Link
          href="/dashboard/gyms"
          className="inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Gyms
        </Link>

        {/* Gym info card */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-[#8B5CF6]">
                {gym.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">{gym.name}</h2>
                <span
                  className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                    gym.status === "active"
                      ? "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20"
                      : "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20"
                  }`}
                >
                  {gym.status}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#94A3B8]">
                {gym.city && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {gym.city}
                  </span>
                )}
                {gym.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> {gym.phone}
                  </span>
                )}
                {gym.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> {gym.email}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Created {formatDate(gym.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Member stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Members", value: gym.total_members ?? 0, color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/15", icon: Users },
            { label: "Active",        value: gym.active_members ?? 0, color: "text-[#22C55E]", bg: "bg-[#22C55E]/15", icon: CheckCircle2 },
            { label: "Expired",       value: gym.expired_members ?? 0, color: "text-[#EF4444]", bg: "bg-[#EF4444]/15", icon: Building2 },
            { label: "Expiring Soon", value: gym.expiring_soon ?? 0, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/15", icon: AlertTriangle },
          ].map(({ label, value, color, bg, icon: Icon }) => (
            <div key={label} className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-[#94A3B8]">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Players table */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#334155]">
            <h3 className="text-sm font-semibold text-white">Members ({playerList.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#334155]">
                  {["Name", "Phone", "Subscription", "Start", "End", "Status"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {playerList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-[#94A3B8] text-sm">
                      No members registered in this gym.
                    </td>
                  </tr>
                )}
                {playerList.map((player) => {
                  const { status, label, daysText } = getPlayerStatus(player.end_date);
                  return (
                    <tr key={player.id} className="hover:bg-[#263348]/60 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-white">{player.name}</td>
                      <td className="px-5 py-3.5 text-[#94A3B8]">{player.phone ?? "—"}</td>
                      <td className="px-5 py-3.5 text-[#94A3B8] capitalize">{player.subscription_type.replace("_", " ")}</td>
                      <td className="px-5 py-3.5 text-[#94A3B8]">{formatDateShort(player.start_date)}</td>
                      <td className="px-5 py-3.5 text-[#94A3B8]">{formatDateShort(player.end_date)}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${
                            status === "active"
                              ? "text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20"
                              : status === "expiring"
                              ? "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20"
                              : "text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20"
                          }`}
                        >
                          {label} · {daysText}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
