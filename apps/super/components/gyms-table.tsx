"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye, Pencil, Trash2, Building2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import type { GymSummary } from "@gym/lib";
import { formatDate } from "@gym/lib";
import { useLocale } from "../lib/i18n";

function GymInitial({ name }: { name: string }) {
  const letters = name.trim().split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
      <span className="text-xs font-bold text-primary">{letters}</span>
    </div>
  );
}

interface Props {
  gyms: GymSummary[];
  onEdit: (gym: GymSummary) => void;
  onDelete: (gym: GymSummary) => void;
}

export function GymsTable({ gyms, onEdit, onDelete }: Props) {
  const { t } = useLocale();
  const [search, setSearch] = useState("");
  const router = useRouter();

  const STATUS_CONFIG = {
    active:    { label: t("status_active"),    icon: CheckCircle2, className: "text-success bg-success/10 border-success/20" },
    inactive:  { label: t("status_inactive"),  icon: XCircle,      className: "text-muted bg-muted/10 border-muted/20" },
    suspended: { label: t("status_suspended"), icon: AlertCircle,  className: "text-danger bg-danger/10 border-danger/20" },
  };

  const filtered = gyms.filter(
    (g) => g.name.toLowerCase().includes(search.toLowerCase()) || (g.city ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const cols = [t("col_gym"), t("col_city"), t("col_status"), t("col_members"), t("col_active"), t("col_expiring"), t("col_created"), ""];

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden transition-colors">
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute inset-s-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search_gyms")}
            className="w-full bg-bg border border-border rounded-lg ps-9 pe-4 py-2 text-sm text-text placeholder:text-faint focus:outline-none focus:border-primary transition-colors" />
        </div>
        <span className="text-xs text-muted ms-auto">
          {filtered.length} {filtered.length === 1 ? t("gym_singular") : t("gym_plural")}
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
                <td colSpan={8} className="px-5 py-12 text-center text-muted">
                  <Building2 className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p>{search ? t("no_gyms_search") : t("no_gyms_start")}</p>
                </td>
              </tr>
            )}
            {filtered.map((gym) => {
              const statusCfg = STATUS_CONFIG[gym.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.active;
              const StatusIcon = statusCfg.icon;
              return (
                <tr key={gym.id} className="hover:bg-surface-2/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <GymInitial name={gym.name} />
                      <div>
                        <p className="font-medium text-text">{gym.name}</p>
                        {gym.email && <p className="text-xs text-muted">{gym.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted">{gym.city ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${statusCfg.className}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusCfg.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-text">{gym.total_members ?? 0}</td>
                  <td className="px-5 py-3.5 text-success font-medium">{gym.active_members ?? 0}</td>
                  <td className="px-5 py-3.5">
                    {gym.expiring_soon > 0
                      ? <span className="text-warning font-medium">{gym.expiring_soon}</span>
                      : <span className="text-muted">0</span>
                    }
                  </td>
                  <td className="px-5 py-3.5 text-muted text-xs">{formatDate(gym.created_at)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => router.push(`/dashboard/gyms/${gym.id}`)}
                        className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => onEdit(gym)}
                        className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDelete(gym)}
                        className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors" title="Delete">
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
            <Building2 className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>{search ? t("no_gyms_search") : t("no_gyms_start")}</p>
          </div>
        )}
        {filtered.map((gym) => {
          const statusCfg = STATUS_CONFIG[gym.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.active;
          const StatusIcon = statusCfg.icon;
          return (
            <div key={gym.id} className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GymInitial name={gym.name} />
                  <div>
                    <p className="font-semibold text-text">{gym.name}</p>
                    <p className="text-xs text-muted">{gym.city ?? "—"}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${statusCfg.className}`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusCfg.label}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-surface-2/50 rounded-lg p-3 border border-border/50">
                <div className="text-center">
                  <p className="text-[10px] text-muted uppercase font-medium mb-1">{t("col_members")}</p>
                  <p className="text-sm text-text font-bold">{gym.total_members ?? 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-muted uppercase font-medium mb-1">{t("col_active")}</p>
                  <p className="text-sm text-success font-bold">{gym.active_members ?? 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-muted uppercase font-medium mb-1">{t("col_expiring")}</p>
                  <p className={`text-sm font-bold ${gym.expiring_soon > 0 ? "text-warning" : "text-muted"}`}>{gym.expiring_soon ?? 0}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <p className="text-[10px] text-muted">{t("col_created")}: {formatDate(gym.created_at)}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => router.push(`/dashboard/gyms/${gym.id}`)}
                    className="p-2 rounded-lg text-muted hover:text-text border border-border transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => onEdit(gym)}
                    className="p-2 rounded-lg text-muted hover:text-primary border border-border transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(gym)}
                    className="p-2 rounded-lg text-muted hover:text-danger border border-border transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
