"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "../../../lib/supabase/client";
import { useLocale } from "../../../lib/i18n";
import { PlayersTable } from "../../../components/players-table";
import { PlayerModal } from "../../../components/player-modal";
import type { Player } from "@gym/lib";

export default function ExpiredPage() {
  const { t } = useLocale();
  const [players, setPlayers] = useState<Player[]>([]);
  const [gymId, setGymId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: adminRecord } = await supabase.from("gym_admins").select("gym_id").eq("user_id", user.id).single();
    if (!adminRecord) return;
    setGymId(adminRecord.gym_id);

    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase.from("players").select("*")
      .eq("gym_id", adminRecord.gym_id).lt("end_date", today).order("end_date", { ascending: false });

    setPlayers(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(player: Player) {
    if (!confirm(`Remove "${player.name}"?`)) return;
    const supabase = createClient();
    await supabase.from("players").delete().eq("id", player.id);
    load();
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-5 border-b border-border">
        <h1 className="text-lg font-semibold text-text">{t("expired_title")}</h1>
        <p className="text-sm text-muted mt-0.5">
          {players.length} {players.length === 1 ? t("expired_singular") : t("expired_plural")}
        </p>
      </div>

      <div className="p-6 space-y-5">
        <div className="bg-danger/5 border border-danger/20 rounded-xl px-5 py-3.5 text-sm text-danger">
          {t("expired_info")}
        </div>

        {loading ? (
          <div className="bg-surface border border-border rounded-xl p-16 flex items-center justify-center transition-colors">
            <div className="w-6 h-6 border-2 border-danger border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <PlayersTable
            players={players}
            filterStatus="all"
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
