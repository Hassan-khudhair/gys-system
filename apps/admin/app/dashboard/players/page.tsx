"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Users, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { createClient } from "../../../lib/supabase/client";
import { useLocale } from "../../../lib/i18n";
import { useAdmin } from "../../../lib/admin-context";
import { PlayersTable } from "../../../components/players-table";
import { PlayerModal } from "../../../components/player-modal";
import { RenewModal } from "../../../components/renew-modal";
import { useToast } from "../../../components/toast";
import { useConfirm } from "../../../components/confirm-dialog";
import type { Player } from "@gym/lib";

type Tab = "all" | "active" | "expiring" | "expired";
const PAGE_SIZE = 15;

export default function PlayersPage() {
  const { t } = useLocale();
  const { gymId } = useAdmin();
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const [players, setPlayers] = useState<Player[]>([]);
  const [counts, setCounts] = useState({ total: 0, active: 0, expiring: 0, expired: 0 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [renewOpen, setRenewOpen] = useState(false);
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);

  // Debounce: wait 300ms after typing before hitting the DB
  useEffect(() => {
    const id = setTimeout(() => { setSearchQuery(search); setPage(1); }, 300);
    return () => clearTimeout(id);
  }, [search]);

  // Server-side paginated fetch with filters
  const loadPlayers = useCallback(async () => {
    if (!gymId) return;
    setLoading(true);
    const supabase = createClient();
    const today = new Date().toISOString().slice(0, 10);
    const sevenDaysLater = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase.from("players").select("*", { count: "exact" }).eq("gym_id", gymId);
    if (searchQuery) query = query.or(`name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`);
    if (tab === "active")   query = query.gte("end_date", today);
    if (tab === "expired")  query = query.lt("end_date", today);
    if (tab === "expiring") query = query.gte("end_date", today).lte("end_date", sevenDaysLater);

    const { data, count } = await query.order("end_date").range(from, to);
    setPlayers(data ?? []);
    setTotalCount(count ?? 0);
    setLoading(false);
  }, [gymId, tab, page, searchQuery]);

  // Single RPC for all tab counts — no separate count queries
  const loadCounts = useCallback(async () => {
    if (!gymId) return;
    const supabase = createClient();
    const { data } = await supabase.rpc("get_gym_stats", { p_gym_id: gymId });
    if (data) {
      const s = data as { total: number; active: number; expiring: number; expired: number };
      setCounts({ total: s.total, active: s.active, expiring: s.expiring, expired: s.expired });
    }
  }, [gymId]);

  useEffect(() => { loadPlayers(); }, [loadPlayers]);
  useEffect(() => { loadCounts(); }, [loadCounts]);

  function reload() { loadPlayers(); loadCounts(); }

  async function handleDelete(player: Player) {
    const ok = await confirm({
      title: t("confirm_delete"),
      message: t("confirm_delete_player_msg"),
      confirmLabel: t("delete_btn"),
      variant: "danger",
    });
    if (!ok) return;
    const supabase = createClient();
    await supabase.from("players").delete().eq("id", player.id);
    toast(t("toast_deleted"));
    reload();
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const TABS = [
    { key: "all"      as Tab, icon: Users,         label: t("tab_all"),      color: "text-muted",   count: counts.total },
    { key: "active"   as Tab, icon: CheckCircle2,  label: t("tab_active"),   color: "text-success", count: counts.active },
    { key: "expiring" as Tab, icon: AlertTriangle, label: t("tab_expiring"), color: "text-warning", count: counts.expiring },
    { key: "expired"  as Tab, icon: XCircle,       label: t("tab_expired"),  color: "text-danger",  count: counts.expired },
  ] as const;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-5 border-b border-border">
        <h1 className="text-lg font-semibold text-text">{t("players_title")}</h1>
        <p className="text-sm text-muted mt-0.5">{t("players_subtitle")}</p>
      </div>

      <div className="p-6 space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Scrollable tab bar — no line-break on mobile */}
          <div className="overflow-x-auto [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-1 w-max transition-colors">
              {TABS.map(({ key, icon: Icon, label, color, count }) => (
                <button key={key} onClick={() => { setTab(key); setPage(1); }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                    tab === key ? "bg-surface-2 text-text shadow-sm" : "text-muted hover:text-text"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${tab === key ? color : ""}`} />
                  <span className="hidden xs:inline sm:inline">{label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                    tab === key ? "bg-border text-text" : "text-faint"
                  }`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => { setEditPlayer(null); setEditOpen(true); }} disabled={!gymId}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-md shadow-primary/20 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            {t("add_player")}
          </button>
        </div>

        <PlayersTable
          players={players}
          loading={loading}
          page={page}
          totalPages={totalPages}
          onPage={setPage}
          search={search}
          onSearch={setSearch}
          onEdit={(p) => { setEditPlayer(p); setEditOpen(true); }}
          onDelete={handleDelete}
          onRenew={(p) => { setEditPlayer(p); setRenewOpen(true); }}
          filterStatus={tab}
        />
      </div>

      {gymId && (
        <>
          <PlayerModal
            open={editOpen}
            player={editPlayer}
            gymId={gymId}
            onClose={() => setEditOpen(false)}
            onSaved={reload}
          />
          <RenewModal
            open={renewOpen}
            player={editPlayer}
            gymId={gymId}
            onClose={() => setRenewOpen(false)}
            onSaved={reload}
          />
        </>
      )}
    </div>
  );
}
