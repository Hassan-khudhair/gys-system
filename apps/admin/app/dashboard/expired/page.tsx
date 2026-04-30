"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "../../../lib/supabase/client";
import { useLocale } from "../../../lib/i18n";
import { useAdmin } from "../../../lib/admin-context";
import { PlayersTable } from "../../../components/players-table";
import { PlayerModal } from "../../../components/player-modal";
import { RenewModal } from "../../../components/renew-modal";
import type { Player } from "@gym/lib";

const PAGE_SIZE = 15;

export default function ExpiredPage() {
  const { t } = useLocale();
  const { gymId } = useAdmin();

  const [players, setPlayers] = useState<Player[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [renewOpen, setRenewOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  useEffect(() => {
    const id = setTimeout(() => { setSearchQuery(search); setPage(1); }, 300);
    return () => clearTimeout(id);
  }, [search]);

  const load = useCallback(async () => {
    if (!gymId) return;
    setLoading(true);
    const supabase = createClient();
    const today = new Date().toISOString().slice(0, 10);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase.from("players").select("*", { count: "exact" })
      .eq("gym_id", gymId).lt("end_date", today);
    if (searchQuery) query = query.or(`name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`);

    const { data, count } = await query.order("end_date", { ascending: false }).range(from, to);
    setPlayers(data ?? []);
    setTotalCount(count ?? 0);
    setLoading(false);
  }, [gymId, page, searchQuery]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(player: Player) {
    if (!confirm(`Remove "${player.name}"?`)) return;
    const supabase = createClient();
    await supabase.from("players").delete().eq("id", player.id);
    load();
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-5 border-b border-border">
        <h1 className="text-lg font-semibold text-text">{t("expired_title")}</h1>
        <p className="text-sm text-muted mt-0.5">
          {totalCount} {totalCount === 1 ? t("expired_singular") : t("expired_plural")}
        </p>
      </div>

      <div className="p-6 space-y-5">
        <div className="bg-danger/5 border border-danger/20 rounded-xl px-5 py-3.5 text-sm text-danger">
          {t("expired_info")}
        </div>

        <PlayersTable
          players={players}
          loading={loading}
          page={page}
          totalPages={totalPages}
          onPage={setPage}
          search={search}
          onSearch={setSearch}
          onEdit={(p) => { setSelectedPlayer(p); setEditOpen(true); }}
          onDelete={handleDelete}
          onRenew={(p) => { setSelectedPlayer(p); setRenewOpen(true); }}
          filterStatus="expired"
        />
      </div>

      {gymId && (
        <>
          <PlayerModal
            open={editOpen}
            player={selectedPlayer}
            gymId={gymId}
            onClose={() => setEditOpen(false)}
            onSaved={load}
          />
          <RenewModal
            open={renewOpen}
            player={selectedPlayer}
            gymId={gymId}
            onClose={() => setRenewOpen(false)}
            onSaved={load}
          />
        </>
      )}
    </div>
  );
}
