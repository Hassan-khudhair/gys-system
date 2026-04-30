"use client";

import { useState } from "react";
import { Search, Pencil, Trash2, RefreshCw, Users } from "lucide-react";
import type { Player } from "@gym/lib";
import { formatDateShort, getPlayerStatus } from "@gym/lib";
import { useLocale } from "../lib/i18n";
import { Pagination } from "./pagination";

interface Props {
  players: Player[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
  search: string;
  onSearch: (s: string) => void;
  onEdit: (player: Player) => void;
  onDelete: (player: Player) => void;
  onRenew: (player: Player) => void;
  filterStatus?: "all" | "active" | "expiring" | "expired";
}

const STATUS_CLASSES = {
  active:   "text-success bg-success/10 border-success/20",
  expiring: "text-warning bg-warning/10 border-warning/20",
  expired:  "text-danger bg-danger/10 border-danger/20",
};

const EXERCISE_BADGE = {
  fitness:      "bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/20",
  bodybuilding: "bg-warning/10 text-warning border-warning/20",
};

function PlayerAvatar({ name }: { name: string }) {
  const initials = name.trim().split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
      <span className="text-xs font-bold text-primary">{initials}</span>
    </div>
  );
}

export function PlayersTable({ 
  players, loading, page, totalPages, onPage, search, onSearch, onEdit, onDelete, onRenew, filterStatus = "all" 
}: Props) {
  const { t } = useLocale();

  const cols = [t("col_player"), t("col_phone"), t("exercise_type_label"), t("col_plan"), t("col_end"), t("col_status"), ""];

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden transition-colors relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-10 bg-surface/60 backdrop-blur-[2px] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute inset-s-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
          <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder={t("search_placeholder")}
            className="w-full bg-bg border border-border rounded-lg ps-9 pe-4 py-2 text-sm text-text placeholder:text-faint focus:outline-none focus:border-primary transition-colors" />
        </div>
      </div>

      {/* Desktop table */}
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
            {!loading && players.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-muted">
                  <Users className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p>{search ? t("no_players_search") : t("no_players_category")}</p>
                </td>
              </tr>
            )}
            {players.map((player) => {
              const { status, daysLeft } = getPlayerStatus(player.end_date);
              const label = status === "expired" ? t("status_expired") : status === "expiring" ? t("status_expiring") : t("status_active");
              const daysText = status === "expired" ? `${Math.abs(daysLeft)}${t("days_ago")}` : `${daysLeft}${t("days_left")}`;
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
                  <td className="px-5 py-3.5">
                    {player.exercise_type ? (
                      <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${EXERCISE_BADGE[player.exercise_type]}`}>
                        {player.exercise_type === "fitness" ? t("fitness") : t("bodybuilding")}
                      </span>
                    ) : <span className="text-faint text-xs">{t("dash")}</span>}
                  </td>
                  <td className="px-5 py-3.5 text-muted text-xs max-w-35 truncate">
                    {player.subscription_type || t("dash")}
                  </td>
                  <td className="px-5 py-3.5 text-muted text-xs">{formatDateShort(player.end_date)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_CLASSES[status]}`}>
                      {label}<span className="opacity-70">· {daysText}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      {(status === "expired" || status === "expiring") && (
                        <button onClick={() => onRenew(player)} className="p-1.5 rounded-lg text-muted hover:text-success hover:bg-success/10 transition-colors">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => onEdit(player)} className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDelete(player)} className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors">
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

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-border">
        {!loading && players.length === 0 && (
          <div className="px-5 py-12 text-center text-muted">
            <Users className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>{search ? t("no_players_search") : t("no_players_category")}</p>
          </div>
        )}
        {players.map((player) => {
          const { status, daysLeft } = getPlayerStatus(player.end_date);
          const label = status === "expired" ? t("status_expired") : status === "expiring" ? t("status_expiring") : t("status_active");
          const daysText = status === "expired" ? `${Math.abs(daysLeft)}${t("days_ago")}` : `${daysLeft}${t("days_left")}`;
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

              <div className="grid grid-cols-2 gap-3 bg-surface-2/50 rounded-lg p-3 border border-border/50">
                <div>
                  <p className="text-[10px] text-muted uppercase font-medium mb-1">{t("exercise_type_label")}</p>
                  {player.exercise_type ? (
                    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${EXERCISE_BADGE[player.exercise_type]}`}>
                      {player.exercise_type === "fitness" ? t("fitness") : t("bodybuilding")}
                    </span>
                  ) : <p className="text-xs text-faint">{t("dash")}</p>}
                </div>
                <div>
                  <p className="text-[10px] text-muted uppercase font-medium mb-1">{t("col_end")}</p>
                  <p className="text-xs text-text font-medium">{formatDateShort(player.end_date)}</p>
                  <p className="text-[9px] text-muted mt-0.5">{daysText}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-muted uppercase font-medium mb-1">{t("col_plan")}</p>
                  <p className="text-xs text-text truncate">{player.subscription_type || t("dash")}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                {(status === "expired" || status === "expiring") && (
                  <button onClick={() => onRenew(player)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-success/10 text-success border border-success/20 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" />
                    {t("renew")}
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

      <Pagination page={page} totalPages={totalPages} onPage={onPage} />
    </div>
  );
}
