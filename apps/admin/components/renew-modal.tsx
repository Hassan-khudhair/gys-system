"use client";

import { useState, useEffect } from "react";
import { X, Loader2, RefreshCw } from "lucide-react";
import { createClient } from "../lib/supabase/client";
import { useLocale } from "../lib/i18n";
import { useAdmin } from "../lib/admin-context";
import { useToast } from "./toast";
import type { Player, ExerciseType } from "@gym/lib";

interface Props {
  open: boolean;
  player: Player | null;
  gymId: string;
  onClose: () => void;
  onSaved: () => void;
}

function todayStr() { return new Date().toISOString().slice(0, 10); }
function addMonths(dateStr: string, months: number) {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export function RenewModal({ open, player, gymId, onClose, onSaved }: Props) {
  const { t } = useLocale();
  const { toast } = useToast();
  const { plans: allPlans } = useAdmin();
  const activePlans = allPlans.filter((p) => p.is_active);

  const [exerciseType, setExerciseType] = useState<ExerciseType>("fitness");
  const [planId, setPlanId] = useState("");
  const [startDate, setStartDate] = useState(todayStr());
  const [endDate, setEndDate] = useState(addMonths(todayStr(), 1));
  const [amountPaid, setAmountPaid] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !player) return;
    const today = todayStr();
    const et: ExerciseType = player.exercise_type ?? "fitness";
    setExerciseType(et);
    setStartDate(today);
    setError(null);

    // Try to pre-select the player's existing plan if still active
    const existingPlan = activePlans.find((p) => p.id === player.plan_id && p.exercise_type === et);
    if (existingPlan) {
      setPlanId(existingPlan.id);
      setAmountPaid(String(existingPlan.price));
      setEndDate(addMonths(today, existingPlan.duration_months));
    } else {
      setPlanId("");
      setAmountPaid("");
      setEndDate(addMonths(today, 1));
    }
  }, [open, player]);

  if (!open || !player) return null;

  const filteredPlans = activePlans.filter((p) => p.exercise_type === exerciseType);

  function handleExerciseType(et: ExerciseType) {
    setExerciseType(et);
    setPlanId("");
    setAmountPaid("");
    setEndDate(addMonths(startDate, 1));
  }

  function handlePlan(id: string) {
    setPlanId(id);
    if (!id) return;
    const selected = activePlans.find((p) => p.id === id);
    if (selected) {
      setAmountPaid(String(selected.price));
      setEndDate(addMonths(startDate, selected.duration_months));
    }
  }

  function handleStartDate(val: string) {
    setStartDate(val);
    if (planId) {
      const selected = activePlans.find((p) => p.id === planId);
      if (selected) setEndDate(addMonths(val, selected.duration_months));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!player) return;
    setLoading(true);
    setError(null);

    const selected = activePlans.find((p) => p.id === planId);
    const supabase = createClient();
    const { error: err } = await supabase
      .from("players")
      .update({
        start_date: startDate,
        end_date: endDate,
        plan_id: planId || null,
        subscription_type: selected?.name ?? player.subscription_type,
        exercise_type: exerciseType,
        amount_paid: amountPaid ? parseFloat(amountPaid) : null,
      })
      .eq("id", player.id);

    if (err) { setError(err.message); setLoading(false); return; }
    setLoading(false);
    toast(t("toast_renewed"));
    onSaved();
    onClose();
  }

  const inputCls = "w-full bg-bg border border-border text-text rounded-lg px-3.5 py-2.5 text-sm placeholder:text-faint focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-success/15 border border-success/30 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-success" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text">{t("renew_title")}</h2>
              <p className="text-xs text-muted">{player.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Info banner */}
          <div className="bg-success/5 border border-success/20 rounded-lg px-4 py-2.5 text-xs text-success">
            {t("renew_info")}
          </div>

          {/* Exercise type */}
          <div>
            <label className="block text-xs font-medium text-muted mb-2">{t("exercise_type_label")}</label>
            <div className="grid grid-cols-2 gap-2">
              {(["fitness", "bodybuilding"] as ExerciseType[]).map((et) => (
                <button
                  key={et}
                  type="button"
                  onClick={() => handleExerciseType(et)}
                  className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${
                    exerciseType === et
                      ? "bg-primary/15 border-primary text-primary"
                      : "bg-bg border-border text-muted hover:text-text hover:border-border"
                  }`}
                >
                  {et === "fitness" ? t("fitness") : t("bodybuilding")}
                </button>
              ))}
            </div>
          </div>

          {/* Plan selection */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">{t("subscription_type")} *</label>
            {filteredPlans.length > 0 ? (
              <select
                required
                value={planId}
                onChange={(e) => handlePlan(e.target.value)}
                className={inputCls}
              >
                <option value="">{t("select_plan")}</option>
                {filteredPlans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.duration_months} {p.duration_months === 1 ? t("month") : t("months")} — {p.price.toLocaleString()} {t("currency")}
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full bg-bg border border-border text-muted rounded-lg px-3.5 py-2.5 text-sm">
                {t("no_plans_for_type")}
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">{t("start_date")} *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => handleStartDate(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">{t("end_date")} *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">{t("amount_paid")}</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="0.00"
              className={inputCls}
            />
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger/20 rounded-lg px-4 py-3 text-sm text-danger">{error}</div>
          )}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-muted hover:text-text hover:bg-surface-2 transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={loading || filteredPlans.length === 0}
              className="flex items-center gap-2 px-5 py-2 bg-success hover:bg-success/90 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {loading ? t("renewing") : t("renew_btn")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
