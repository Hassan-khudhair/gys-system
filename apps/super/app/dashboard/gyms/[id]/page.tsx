"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { createClient } from "../../../../../lib/supabase/client";
import { useLocale } from "../../../../../lib/i18n";
import { formatDate, formatDateShort, getPlayerStatus } from "@gym/lib";
import {
  Building2, Users, CheckCircle2, AlertTriangle, Phone, Mail, MapPin,
  ArrowLeft, Clock, Loader2,
} from "lucide-react";
import Link from "next/link";
import type { Player } from "@gym/lib";
import type { GymSummary } from "@gym/lib";

export default function GymDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLocale();
  const [gym, setGym] = useState<GymSummary | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [{ data: gymData }, { data: playerData }] = await Promise.all([
        supabase.from("gym_summary").select("*").eq("id", id).single(),
        supabase.from("players").select("*").eq("gym_id", id).order("end_date", { ascending: true }),
      ]);
      if (!gymData) { setNotFoundState(true); return; }
      setGym(gymData);
      setPlayers(playerData ?? []);
      setLoading(false);
    }
    load();
  }, [id]);

  if (notFoundState) { notFound(); }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  const STATUS_CLS = {
    active:    "bg-success/10 text-success border-success/20",
    suspended: "bg-danger/10 text-danger border-danger/20",
    inactive:  "bg-muted/10 text-muted border-muted/20",
  };

  const statusCls = STATUS_CLS[gym!.status as keyof typeof STATUS_CLS] ?? STATUS_CLS.inactive;

  const memberStats = [
    { label: t("total_members"),  value: gym!.total_members  ?? 0, color: "text-primary",  bg: "bg-primary/15",  icon: Users },
    { label: t("active"),         value: gym!.active_members ?? 0, color: "text-success",  bg: "bg-success/15",  icon: CheckCircle2 },
    { label: t("expired"),        value: gym!.expired_members ?? 0, color: "text-danger",  bg: "bg-danger/15",   icon: Building2 },
    { label: t("expiring_soon"),  value: gym!.expiring_soon  ?? 0, color: "text-warning",  bg: "bg-warning/15",  icon: AlertTriangle },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-5 border-b border-border">
        <h1 className="text-lg font-semibold text-text">{gym!.name}</h1>
        {gym!.city && <p className="text-sm text-muted mt-0.5">{gym!.city}</p>}
      </div>

      <div className="p-6 space-y-6">
        <Link href="/dashboard/gyms"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-text transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t("back_to_gyms")}
        </Link>

        <div className="bg-surface border border-border rounded-xl p-6 transition-colors">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-primary">{gym!.name.slice(0, 2).toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-text">{gym!.name}</h2>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusCls}`}>
                  {gym!.status}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
                {gym!.city && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {gym!.city}</span>}
                {gym!.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {gym!.phone}</span>}
                {gym!.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {gym!.email}</span>}
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {t("created")} {formatDate(gym!.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {memberStats.map(({ label, value, color, bg, icon: Icon }) => (
            <div key={label} className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4 transition-colors">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-muted">{label}</p>
                <p className="text-2xl font-bold text-text">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-surface border border-border rounded-xl overflow-hidden transition-colors">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-text">{t("members_count")} ({players.length})</h3>
          </div>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {[t("col_name"), t("col_phone"), t("col_subscription"), t("col_start"), t("col_end"), t("col_status")].map((h) => (
                    <th key={h} className="px-5 py-3 text-start text-xs font-medium text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {players.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-muted text-sm">{t("no_members_gym")}</td>
                  </tr>
                )}
                {players.map((player) => {
                  const { status, label, daysText } = getPlayerStatus(player.end_date);
                  return (
                    <tr key={player.id} className="hover:bg-surface-2/60 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-text">{player.name}</td>
                      <td className="px-5 py-3.5 text-muted">{player.phone ?? "—"}</td>
                      <td className="px-5 py-3.5 text-muted capitalize">{player.subscription_type.replace("_", " ")}</td>
                      <td className="px-5 py-3.5 text-muted">{formatDateShort(player.start_date)}</td>
                      <td className="px-5 py-3.5 text-muted">{formatDateShort(player.end_date)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${
                          status === "active"   ? "text-success bg-success/10 border-success/20"
                          : status === "expiring" ? "text-warning bg-warning/10 border-warning/20"
                          : "text-danger bg-danger/10 border-danger/20"
                        }`}>
                          {label} · {daysText}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-border">
            {players.length === 0 && (
              <div className="px-5 py-10 text-center text-muted text-sm">{t("no_members_gym")}</div>
            )}
            {players.map((player) => {
              const { status, label, daysText } = getPlayerStatus(player.end_date);
              return (
                <div key={player.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-text">{player.name}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                      status === "active"   ? "text-success bg-success/10 border-success/20"
                      : status === "expiring" ? "text-warning bg-warning/10 border-warning/20"
                      : "text-danger bg-danger/10 border-danger/20"
                    }`}>
                      {label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>{player.phone ?? "—"}</span>
                    <span>{player.subscription_type.replace("_", " ")}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 bg-surface-2/50 rounded-lg p-2.5 border border-border/50 text-[11px]">
                    <div>
                      <p className="text-muted mb-0.5">{t("col_start")}</p>
                      <p className="text-text font-medium">{formatDateShort(player.start_date)}</p>
                    </div>
                    <div>
                      <p className="text-muted mb-0.5">{t("col_end")}</p>
                      <p className="text-text font-medium">{formatDateShort(player.end_date)}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-center text-muted">{daysText}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
