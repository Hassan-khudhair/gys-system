"use client";

import { useState } from "react";
import { Search, Pencil, Trash2, RefreshCw, Users } from "lucide-react";
import type { Player } from "@gym/lib";
import { formatDateShort, getPlayerStatus, SUBSCRIPTION_LABELS } from "@gym/lib";
import { useLocale } from "../lib/i18n";

interface Props {
  players: Player[];
  onEdit: (player: Player) => void;
  onDelete: (player: Player) => void;
  onRenew: (player: Player) => void;
  filterStatus?: "all" | "active" | "expiring" | "expired";
}

const STATUS_CLASSES = {
  active:   "text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20",
  expiring: "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20",
  expired:  "text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20",
};

function PlayerAvatar({ name }: { name: string }) {
  const initials = name.trim().split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
      <span className="text-xs font-bold text-primary">{initials}</span>
    </div>
  );
}

export function PlayersTable({ players, onEdit, onDelete, onRenew, filterStatus = "all" }: Props) {
  const { t } = useLocale();
  const [search, setSearch] = useState("");

  const filtered = players
    .filter((p) => {
      const { status } = getPlayerStatus(p.end_date);
      if (filterStatus !== "all" && status !== filterStatus) return false;
      return p.name.toLowerCase().includes(search.toLowerCase()) || (p.phone ?? "").includes(search);
    })
    .sort((a, b) => {
      const sa = getPlayerStatus(a.end_date);
      const sb = getPlayerStatus(b.end_date);
      if (sa.daysLeft !== sb.daysLeft) return sa.daysLeft - sb.daysLeft;
      return 0;
    });

  const cols = [t("col_player"), t("col_phone"), t("col_plan"), t("col_start"), t("col_end"), t("col_status"), ""];

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden transition-colors">
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute inset-s-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search_placeholder")}
            className="w-full bg-bg border border-border rounded-lg ps-9 pe-4 py-2 text-sm text-text placeholder:text-faint focus:outline-none focus:border-primary transition-colors" />
        </div>
        <span className="text-xs text-muted ms-auto">
          {filtered.length} {filtered.length === 1 ? t("player_singular") : t("player_plural")}
        </span>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {cols.map((h) => (
                <th key={h} className="px-5 py-3 text-start text-xs font-medium text-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-muted">
                  <Users className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p>{search ? t("no_players_search") : t("no_players_category")}</p>
                </td>
              </tr>
            )}
            {filtered.map((player) => {
              const { status, label, daysText } = getPlayerStatus(player.end_date);
              return (
                <tr key={player.id} className="hover:bg-surface-2/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <PlayerAvatar name={player.name} />
                      <div>
                        <p className="font-medium text-text">{player.name}</p>
                        {player.email && <p className="text-xs text-muted">{player.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted">{player.phone ?? t("dash")}</td>
                  <td className="px-5 py-3.5 text-muted text-xs">{SUBSCRIPTION_LABELS[player.subscription_type] ?? player.subscription_type}</td>
                  <td className="px-5 py-3.5 text-muted text-xs">{formatDateShort(player.start_date)}</td>
                  <td className="px-5 py-3.5 text-muted text-xs">{formatDateShort(player.end_date)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_CLASSES[status]}`}>
                      {label}<span className="opacity-70">· {daysText}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      {(status === "expired" || status === "expiring") && (
                        <button onClick={() => onRenew(player)} className="p-1.5 rounded-lg text-muted hover:text-success hover:bg-success/10 transition-colors" title="Renew">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => onEdit(player)} className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDelete(player)} className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-border">
        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center text-muted">
            <Users className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>{search ? t("no_players_search") : t("no_players_category")}</p>
          </div>
        )}
        {filtered.map((player) => {
          const { status, label, daysText } = getPlayerStatus(player.end_date);
          return (
            <div key={player.id} className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PlayerAvatar name={player.name} />
                  <div>
                    <p className="font-semibold text-text">{player.name}</p>
                    <p className="text-xs text-muted">{player.phone ?? t("dash")}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${STATUS_CLASSES[status]}`}>
                  {label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-surface-2/50 rounded-lg p-3 border border-border/50">
                <div>
                  <p className="text-[10px] text-muted uppercase font-medium mb-1">{t("col_plan")}</p>
                  <p className="text-xs text-text font-medium">{SUBSCRIPTION_LABELS[player.subscription_type] ?? player.subscription_type}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted uppercase font-medium mb-1">{t("col_end")}</p>
                  <p className="text-xs text-text font-medium">{formatDateShort(player.end_date)}</p>
                  <p className="text-[9px] text-muted mt-0.5">{daysText}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                {(status === "expired" || status === "expiring") && (
                  <button onClick={() => onRenew(player)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-success/10 text-success border border-success/20 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" />
                    {t("renew") ?? "Renew"}
                  </button>
                )}
                <button onClick={() => onEdit(player)} className="p-2 rounded-lg text-muted hover:text-primary hover:bg-primary/10 border border-border transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(player)} className="p-2 rounded-lg text-muted hover:text-danger hover:bg-danger/10 border border-border transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
