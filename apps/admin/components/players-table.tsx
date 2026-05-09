"use client";

import { Search, Pencil, Trash2, RefreshCw, Users } from "lucide-react";
import type { Player } from "@gym/lib";
import { formatDateShort, getPlayerStatus, exerciseTypeBadgeClass } from "@gym/lib";
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
  filterStatus?: string;
}

const STATUS_CLASSES = {
  active:   "text-success bg-success/10 border-success/20",
  expiring: "text-warning bg-warning/10 border-warning/20",
  expired:  "text-danger  bg-danger/10  border-danger/20",
};

function PlayerAvatar({ name }: { name: string }) {
  const initials = name.trim().split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
      <span className="text-xs font-bold text-primary">{initials}</span>
    </div>
  );
}

export function PlayersTable({
  players, loading, page, totalPages, onPage, search, onSearch, onEdit, onDelete, onRenew,
}: Props) {
  const { t } = useLocale();

  const cols = [t("col_player"), t("col_phone"), t("exercise_type_label"), t("col_plan"), t("col_end"), t("col_status"), ""];

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden transition-colors relative">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-10 bg-surface/70 backdrop-blur-[2px] flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Search bar */}
      <div className="px-5 py-3.5 border-b border-border/60 flex items-center gap-3 bg-surface/80">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute inset-s-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-faint" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t("search_placeholder")}
            className="w-full bg-bg/60 border border-border/60 rounded-lg ps-9 pe-4 py-2 text-sm text-text placeholder:text-faint focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-surface-2/30">
              {cols.map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-start text-[10px] font-semibold text-faint uppercase tracking-widest whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {!loading && players.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-surface-2 border border-border flex items-center justify-center">
                      <Users className="w-5 h-5 text-faint" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text mb-0.5">
                        {search ? t("no_players_search") : t("no_players_category")}
                      </p>
                      {!search && <p className="text-xs text-faint">{t("add_player")}</p>}
                    </div>
                  </div>
                </td>
              </tr>
            )}
            {players.map((player) => {
              const { status, daysLeft } = getPlayerStatus(player.end_date);
              const label = status === "expired" ? t("status_expired") : status === "expiring" ? t("status_expiring") : t("status_active");
              const daysText = status === "expired"
                ? `${Math.abs(daysLeft)}${t("days_ago")}`
                : `${daysLeft}${t("days_left")}`;

              return (
                <tr
                  key={player.id}
                  className="hover:bg-surface-2/40 transition-colors duration-100 group"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <PlayerAvatar name={player.name} />
                      <div>
                        <p className="font-medium text-text text-[13px] leading-tight">{player.name}</p>
                        {player.age != null && (
                          <p className="text-[11px] text-muted mt-0.5">{player.age} {t("age")}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted text-[13px]">{player.phone ?? t("dash")}</td>
                  <td className="px-5 py-3.5">
                    {player.exercise_type ? (
                      <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border ${exerciseTypeBadgeClass(player.exercise_type)}`}>
                        {player.exercise_type}
                      </span>
                    ) : (
                      <span className="text-faint text-xs">{t("dash")}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-muted text-[13px] max-w-32 truncate">
                    {player.subscription_type || t("dash")}
                  </td>
                  <td className="px-5 py-3.5 text-muted text-[13px]">
                    {formatDateShort(player.end_date)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border ${STATUS_CLASSES[status]}`}>
                      {label}
                      <span className="opacity-60">· {daysText}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {/* Actions — visible always on mobile, fade in on desktop hover */}
                    <div className="flex items-center gap-0.5 justify-end opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150">
                      {(status === "expired" || status === "expiring") && (
                        <button
                          onClick={() => onRenew(player)}
                          title={t("renew")}
                          className="p-1.5 rounded-lg text-faint hover:text-success hover:bg-success/10 transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(player)}
                        title="Edit"
                        className="p-1.5 rounded-lg text-faint hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(player)}
                        title="Delete"
                        className="p-1.5 rounded-lg text-faint hover:text-danger hover:bg-danger/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
      <div className="md:hidden divide-y divide-border/40">
        {!loading && players.length === 0 && (
          <div className="px-5 py-14 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-surface-2 border border-border flex items-center justify-center">
                <Users className="w-5 h-5 text-faint" />
              </div>
              <p className="text-sm font-medium text-text">
                {search ? t("no_players_search") : t("no_players_category")}
              </p>
            </div>
          </div>
        )}
        {players.map((player) => {
          const { status, daysLeft } = getPlayerStatus(player.end_date);
          const label = status === "expired" ? t("status_expired") : status === "expiring" ? t("status_expiring") : t("status_active");
          const daysText = status === "expired"
            ? `${Math.abs(daysLeft)}${t("days_ago")}`
            : `${daysLeft}${t("days_left")}`;

          return (
            <div key={player.id} className="p-4 space-y-3 hover:bg-surface-2/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PlayerAvatar name={player.name} />
                  <div>
                    <p className="font-semibold text-text text-sm leading-tight">{player.name}</p>
                    <p className="text-xs text-muted mt-0.5">{player.phone ?? t("dash")}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${STATUS_CLASSES[status]}`}>
                  {label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 bg-surface-2/40 rounded-lg p-3 border border-border/40">
                <div>
                  <p className="text-[10px] text-faint uppercase font-semibold tracking-wider mb-1">{t("exercise_type_label")}</p>
                  {player.exercise_type ? (
                    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border ${exerciseTypeBadgeClass(player.exercise_type)}`}>
                      {player.exercise_type}
                    </span>
                  ) : (
                    <p className="text-xs text-faint">{t("dash")}</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-faint uppercase font-semibold tracking-wider mb-1">{t("col_end")}</p>
                  <p className="text-xs text-text font-medium">{formatDateShort(player.end_date)}</p>
                  <p className="text-[10px] text-muted mt-0.5">{daysText}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-faint uppercase font-semibold tracking-wider mb-1">{t("col_plan")}</p>
                  <p className="text-xs text-text truncate">{player.subscription_type || t("dash")}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-1.5 pt-0.5">
                {(status === "expired" || status === "expiring") && (
                  <button
                    onClick={() => onRenew(player)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-success/10 text-success border border-success/20 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {t("renew")}
                  </button>
                )}
                <button
                  onClick={() => onEdit(player)}
                  className="p-1.5 rounded-lg text-faint hover:text-primary hover:bg-primary/10 border border-border/60 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(player)}
                  className="p-1.5 rounded-lg text-faint hover:text-danger hover:bg-danger/10 border border-border/60 transition-colors"
                >
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
