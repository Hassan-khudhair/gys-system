"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { createClient } from "../lib/supabase/client";
import { useLocale } from "../lib/i18n";
import { useAdmin } from "../lib/admin-context";
import { useToast } from "./toast";
import type { Player } from "@gym/lib";

interface Props {
  open: boolean;
  player?: Player | null;
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

export function PlayerModal({ open, player, gymId, onClose, onSaved }: Props) {
  const { t } = useLocale();
  const { toast } = useToast();
  const { plans: allPlans, exerciseTypes } = useAdmin();
  const isEdit = Boolean(player);
  const [form, setForm] = useState({
    name: "", phone: "", age: "", notes: "",
    start_date: todayStr(),
    end_date: addMonths(todayStr(), 1),
    subscription_type: "",
    amount_paid: "",
    exercise_type: "",
    plan_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plans = allPlans.filter((p) => p.is_active);

  useEffect(() => {
    if (player) {
      setForm({
        name: player.name,
        phone: player.phone ?? "",
        age: player.age != null ? String(player.age) : "",
        notes: player.notes ?? "",
        start_date: player.start_date,
        end_date: player.end_date,
        subscription_type: player.subscription_type,
        amount_paid: player.amount_paid != null ? String(player.amount_paid) : "",
        exercise_type: player.exercise_type ?? exerciseTypes[0]?.name ?? "",
        plan_id: player.plan_id ?? "",
      });
    } else {
      const today = todayStr();
      setForm({
        name: "", phone: "", age: "", notes: "",
        start_date: today, end_date: addMonths(today, 1),
        subscription_type: "", amount_paid: "",
        exercise_type: exerciseTypes[0]?.name ?? "", plan_id: "",
      });
    }
    setError(null);
  }, [player, open, exerciseTypes]);

  if (!open) return null;

  const filteredPlans = plans.filter((p) => p.exercise_type === form.exercise_type);

  function set(field: string, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      // When exercise type changes, clear plan selection
      if (field === "exercise_type") {
        next.plan_id = "";
        next.subscription_type = "";
        next.amount_paid = "";
      }

      // When plan is selected, auto-fill price and end_date
      if (field === "plan_id" && value) {
        const selected = plans.find((p) => p.id === value);
        if (selected) {
          next.subscription_type = selected.name;
          next.amount_paid = String(selected.price);
          next.end_date = addMonths(next.start_date, selected.duration_months);
        }
      }

      // When start date changes and plan is selected, recalculate end_date
      if (field === "start_date" && next.plan_id) {
        const selected = plans.find((p) => p.id === next.plan_id);
        if (selected) {
          next.end_date = addMonths(value, selected.duration_months);
        }
      }

      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const supabase = createClient();
    const payload = {
      gym_id: gymId,
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      age: form.age ? parseInt(form.age) : null,
      notes: form.notes.trim() || null,
      start_date: form.start_date,
      end_date: form.end_date,
      subscription_type: form.subscription_type || form.plan_id || "custom",
      amount_paid: form.amount_paid ? parseFloat(form.amount_paid) : null,
      exercise_type: form.exercise_type || null,
      plan_id: form.plan_id || null,
    };
    let err;
    if (isEdit && player) {
      ({ error: err } = await supabase.from("players").update(payload).eq("id", player.id));
    } else {
      ({ error: err } = await supabase.from("players").insert(payload));
    }
    if (err) { setError(err.message); setLoading(false); return; }
    setLoading(false);
    toast(isEdit ? t("toast_saved") : t("toast_added"));
    onSaved(); onClose();
  }

  const inputCls = "w-full bg-bg border border-border text-text rounded-lg px-3.5 py-2.5 text-sm placeholder:text-faint focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface border border-border rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-surface z-10">
          <h2 className="text-base font-semibold text-text">
            {isEdit ? t("edit_player_title") : t("add_player_title")}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-muted mb-1.5">{t("full_name")} *</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="Ali Hassan" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">{t("phone")}</label>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+964 7XX XXX XXXX" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">{t("age")}</label>
              <input type="number" min="5" max="100" value={form.age} onChange={(e) => set("age", e.target.value)} placeholder={t("age_placeholder")} className={inputCls} />
            </div>
          </div>

          {/* Exercise type */}
          <div>
            <label className="block text-xs font-medium text-muted mb-2">{t("exercise_type_label")}</label>
            {exerciseTypes.length === 0 ? (
              <div className="w-full bg-bg border border-border text-muted rounded-lg px-3.5 py-2.5 text-sm">
                {t("no_exercise_types_yet")}
              </div>
            ) : (
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${Math.min(exerciseTypes.length, 3)}, 1fr)` }}
              >
                {exerciseTypes.map((et) => (
                  <button
                    key={et.id}
                    type="button"
                    onClick={() => set("exercise_type", et.name)}
                    className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${
                      form.exercise_type === et.name
                        ? "bg-primary/15 border-primary text-primary"
                        : "bg-bg border-border text-muted hover:text-text hover:border-border"
                    }`}
                  >
                    {et.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Subscription plan */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">{t("subscription_type")}</label>
            {filteredPlans.length > 0 ? (
              <select value={form.plan_id} onChange={(e) => set("plan_id", e.target.value)} className={inputCls}>
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
              <input type="date" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">{t("end_date")} *</label>
              <input type="date" value={form.end_date} onChange={(e) => set("end_date", e.target.value)} required className={inputCls} />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">{t("amount_paid")}</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount_paid}
              onChange={(e) => set("amount_paid", e.target.value)}
              placeholder="0.00"
              className={inputCls}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">{t("notes")}</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} placeholder={t("notes_placeholder")} className={`${inputCls} resize-none`} />
          </div>

          {error && <div className="bg-danger/10 border border-danger/20 rounded-lg px-4 py-3 text-sm text-danger">{error}</div>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-muted hover:text-text hover:bg-surface-2 transition-colors">
              {t("cancel")}
            </button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? t("save_changes") : t("add_player_btn")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
