"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Users, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { createClient } from "../../../lib/supabase/client";
import { useLocale } from "../../../lib/i18n";
import { PlayersTable } from "../../../components/players-table";
import { PlayerModal } from "../../../components/player-modal";
import { getPlayerStatus } from "@gym/lib";
import type { Player } from "@gym/lib";

type Tab = "all" | "active" | "expiring" | "expired";

export default function PlayersPage() {
  const { t } = useLocale();
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

    const { data: adminRecord } = await supabase.from("gym_admins").select("gym_id").eq("user_id", user.id).single();
    if (!adminRecord) return;
    setGymId(adminRecord.gym_id);

    const { data } = await supabase.from("players").select("*")
      .eq("gym_id", adminRecord.gym_id).order("created_at", { ascending: false });

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
    if (!confirm(`Remove "${player.name}"?`)) return;
    const supabase = createClient();
    await supabase.from("players").delete().eq("id", player.id);
    load();
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-5 border-b border-border">
        <h1 className="text-lg font-semibold text-text">{t("players_title")}</h1>
        <p className="text-sm text-muted mt-0.5">{t("players_subtitle")}</p>
      </div>

      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-1 transition-colors">
            {(
              [
                { key: "all"      as Tab, icon: Users,         label: t("tab_all"),      color: "text-muted" },
                { key: "active"   as Tab, icon: CheckCircle2,  label: t("tab_active"),   color: "text-success" },
                { key: "expiring" as Tab, icon: AlertTriangle, label: t("tab_expiring"), color: "text-warning" },
                { key: "expired"  as Tab, icon: XCircle,       label: t("tab_expired"),  color: "text-danger" },
              ] as const
            ).map(({ key, icon: Icon, label, color }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  tab === key ? "bg-surface-2 text-text shadow-sm" : "text-muted hover:text-text"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${tab === key ? color : ""}`} />
                {label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  tab === key ? "bg-border text-text" : "text-faint"
                }`}>
                  {counts[key]}
                </span>
              </button>
            ))}
          </div>

          <button onClick={() => { setEditPlayer(null); setModalOpen(true); }} disabled={!gymId}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-md shadow-primary/20">
            <Plus className="w-4 h-4" />
            {t("add_player")}
          </button>
        </div>

        {loading ? (
          <div className="bg-surface border border-border rounded-xl p-16 flex items-center justify-center transition-colors">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <PlayersTable
            players={players}
            filterStatus={tab}
            onEdit={(p) => { setEditPlayer(p); setModalOpen(true); }}
            onDelete={handleDelete}
            onRenew={(p) => { setEditPlayer(p); setModalOpen(true); }}
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
