"use client";

import { useState } from "react";
import { Search, Pencil, Trash2, RefreshCw, Users } from "lucide-react";
import type { Player } from "@gym/lib";
import { formatDateShort, getPlayerStatus, SUBSCRIPTION_LABELS } from "@gym/lib";

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
    <div className="w-8 h-8 rounded-full bg-[#F59E0B]/20 border border-[#F59E0B]/30 flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-bold text-[#F59E0B]">{initials}</span>
    </div>
  );
}

export function PlayersTable({ players, onEdit, onDelete, onRenew, filterStatus = "all" }: Props) {
  const [search, setSearch] = useState("");

  const filtered = players
    .filter((p) => {
      const { status } = getPlayerStatus(p.end_date);
      if (filterStatus !== "all" && status !== filterStatus) return false;
      return (
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.phone ?? "").includes(search)
      );
    })
    .sort((a, b) => {
      // Sort: expiring first, then active, then expired — by end_date
      const sa = getPlayerStatus(a.end_date);
      const sb = getPlayerStatus(b.end_date);
      if (sa.daysLeft !== sb.daysLeft) return sa.daysLeft - sb.daysLeft;
      return 0;
    });

  return (
    <div className="bg-[#1E293B] border border-[#334155] rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-[#334155] flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone…"
            className="w-full bg-[#0F172A] border border-[#334155] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-[#475569] focus:outline-none focus:border-[#F59E0B] transition-colors"
          />
        </div>
        <span className="text-xs text-[#94A3B8] ml-auto">
          {filtered.length} {filtered.length === 1 ? "player" : "players"}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#334155]">
              {["Player", "Phone", "Plan", "Start", "End", "Status", ""].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#334155]">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-[#94A3B8]">
                  <Users className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p>{search ? "No players match your search." : "No players in this category."}</p>
                </td>
              </tr>
            )}
            {filtered.map((player) => {
              const { status, label, daysText } = getPlayerStatus(player.end_date);
              return (
                <tr key={player.id} className="hover:bg-[#263348]/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <PlayerAvatar name={player.name} />
                      <div>
                        <p className="font-medium text-white">{player.name}</p>
                        {player.email && <p className="text-xs text-[#94A3B8]">{player.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[#94A3B8]">{player.phone ?? "—"}</td>
                  <td className="px-5 py-3.5 text-[#94A3B8] text-xs">
                    {SUBSCRIPTION_LABELS[player.subscription_type] ?? player.subscription_type}
                  </td>
                  <td className="px-5 py-3.5 text-[#94A3B8] text-xs">{formatDateShort(player.start_date)}</td>
                  <td className="px-5 py-3.5 text-[#94A3B8] text-xs">{formatDateShort(player.end_date)}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_CLASSES[status]}`}
                    >
                      {label}
                      <span className="opacity-70">· {daysText}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      {(status === "expired" || status === "expiring") && (
                        <button
                          onClick={() => onRenew(player)}
                          className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#22C55E] hover:bg-[#22C55E]/10 transition-colors"
                          title="Renew"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(player)}
                        className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F59E0B] hover:bg-[#F59E0B]/10 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(player)}
                        className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                        title="Delete"
                      >
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
    </div>
  );
}
