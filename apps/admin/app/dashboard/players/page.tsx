"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Users, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { createClient } from "../../../lib/supabase/client";
import { Header } from "../../../components/header";
import { PlayersTable } from "../../../components/players-table";
import { PlayerModal } from "../../../components/player-modal";
import { getPlayerStatus } from "@gym/lib";
import type { Player } from "@gym/lib";

type Tab = "all" | "active" | "expiring" | "expired";

const TABS: { key: Tab; label: string; icon: React.ElementType; color: string }[] = [
  { key: "all",      label: "All",          icon: Users,         color: "text-[#94A3B8]" },
  { key: "active",   label: "Active",       icon: CheckCircle2,  color: "text-[#22C55E]" },
  { key: "expiring", label: "Expiring",     icon: AlertTriangle, color: "text-[#F59E0B]" },
  { key: "expired",  label: "Expired",      icon: XCircle,       color: "text-[#EF4444]" },
];

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [gymId, setGymId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: adminRecord } = await supabase
      .from("gym_admins")
      .select("gym_id")
      .eq("user_id", user.id)
      .single();

    if (!adminRecord) return;
    setGymId(adminRecord.gym_id);

    const { data } = await supabase
      .from("players")
      .select("*")
      .eq("gym_id", adminRecord.gym_id)
      .order("created_at", { ascending: false });

    setPlayers(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const counts = {
    all:      players.length,
    active:   players.filter((p) => getPlayerStatus(p.end_date).status === "active").length,
    expiring: players.filter((p) => getPlayerStatus(p.end_date).status === "expiring").length,
    expired:  players.filter((p) => getPlayerStatus(p.end_date).status === "expired").length,
  };

  async function handleDelete(player: Player) {
    if (!confirm(`Remove "${player.name}" from the gym?`)) return;
    const supabase = createClient();
    await supabase.from("players").delete().eq("id", player.id);
    load();
  }

  function handleRenew(player: Player) {
    setEditPlayer(player);
    setModalOpen(true);
  }

  function openAdd() {
    setEditPlayer(null);
    setModalOpen(true);
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Players" subtitle="Manage your gym members" />

      <div className="p-6 space-y-5">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-[#1E293B] border border-[#334155] rounded-lg p-1">
            {TABS.map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  tab === key
                    ? "bg-[#263348] text-white shadow-sm"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${tab === key ? color : ""}`} />
                {label}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                    tab === key ? "bg-[#334155] text-white" : "text-[#475569]"
                  }`}
                >
                  {counts[key]}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={openAdd}
            disabled={!gymId}
            className="flex items-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-md shadow-[#F59E0B]/20"
          >
            <Plus className="w-4 h-4" />
            Add Player
          </button>
        </div>

        {loading ? (
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-16 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#F59E0B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <PlayersTable
            players={players}
            filterStatus={tab}
            onEdit={(p) => { setEditPlayer(p); setModalOpen(true); }}
            onDelete={handleDelete}
            onRenew={handleRenew}
          />
        )}
      </div>

      {gymId && (
        <PlayerModal
          open={modalOpen}
          player={editPlayer}
          gymId={gymId}
          onClose={() => setModalOpen(false)}
          onSaved={load}
        />
      )}
    </div>
  );
}
