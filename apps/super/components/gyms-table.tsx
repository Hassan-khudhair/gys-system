"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye, Pencil, Trash2, Building2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import type { GymSummary } from "@gym/lib";
import { formatDate } from "@gym/lib";

const STATUS_CONFIG = {
  active:    { label: "Active",    icon: CheckCircle2, className: "text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20" },
  inactive:  { label: "Inactive",  icon: XCircle,      className: "text-[#94A3B8] bg-[#94A3B8]/10 border-[#94A3B8]/20" },
  suspended: { label: "Suspended", icon: AlertCircle,  className: "text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20" },
};

function GymInitial({ name }: { name: string }) {
  const letters = name.trim().split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className="w-9 h-9 rounded-lg bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-bold text-[#8B5CF6]">{letters}</span>
    </div>
  );
}

interface Props {
  gyms: GymSummary[];
  onEdit: (gym: GymSummary) => void;
  onDelete: (gym: GymSummary) => void;
}

export function GymsTable({ gyms, onEdit, onDelete }: Props) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = gyms.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.city ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-[#1E293B] border border-[#334155] rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-[#334155] flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search gyms…"
            className="w-full bg-[#0F172A] border border-[#334155] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-[#475569] focus:outline-none focus:border-[#8B5CF6] transition-colors"
          />
        </div>
        <span className="text-xs text-[#94A3B8] ml-auto">
          {filtered.length} {filtered.length === 1 ? "gym" : "gyms"}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#334155]">
              {["Gym", "City", "Status", "Members", "Active", "Expiring", "Created", ""].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#334155]">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-[#94A3B8]">
                  <Building2 className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p>{search ? "No gyms match your search." : "No gyms yet. Create one to get started."}</p>
                </td>
              </tr>
            )}
            {filtered.map((gym) => {
              const status = STATUS_CONFIG[gym.status] ?? STATUS_CONFIG.active;
              const StatusIcon = status.icon;
              return (
                <tr key={gym.id} className="hover:bg-[#263348]/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <GymInitial name={gym.name} />
                      <div>
                        <p className="font-medium text-white">{gym.name}</p>
                        {gym.email && <p className="text-xs text-[#94A3B8]">{gym.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[#94A3B8]">{gym.city ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${status.className}`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-white">{gym.total_members ?? 0}</td>
                  <td className="px-5 py-3.5 text-[#22C55E] font-medium">{gym.active_members ?? 0}</td>
                  <td className="px-5 py-3.5">
                    {gym.expiring_soon > 0 ? (
                      <span className="text-[#F59E0B] font-medium">{gym.expiring_soon}</span>
                    ) : (
                      <span className="text-[#94A3B8]">0</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-[#94A3B8] text-xs">{formatDate(gym.created_at)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => router.push(`/dashboard/gyms/${gym.id}`)}
                        className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#334155] transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(gym)}
                        className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#8B5CF6] hover:bg-[#8B5CF6]/10 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(gym)}
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
