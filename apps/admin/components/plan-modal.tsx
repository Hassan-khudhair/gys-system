"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { createClient } from "../lib/supabase/client";
import { useLocale } from "../lib/i18n";
import type { SubscriptionPlan, ExerciseType } from "@gym/lib";

interface Props {
  open: boolean;
  plan?: SubscriptionPlan | null;
  gymId: string;
  onClose: () => void;
  onSaved: () => void;
}

export function PlanModal({ open, plan, gymId, onClose, onSaved }: Props) {
  const { t } = useLocale();
  const isEdit = Boolean(plan);
  const [form, setForm] = useState({
    name: "",
    exercise_type: "fitness" as ExerciseType,
    duration_months: "1",
    price: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (plan) {
      setForm({
        name: plan.name,
        exercise_type: plan.exercise_type,
        duration_months: String(plan.duration_months),
        price: String(plan.price),
        is_active: plan.is_active,
      });
    } else {
      setForm({ name: "", exercise_type: "fitness", duration_months: "1", price: "", is_active: true });
    }
    setError(null);
  }, [plan, open]);

  if (!open) return null;

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const supabase = createClient();
    const payload = {
      gym_id: gymId,
      name: form.name.trim(),
      exercise_type: form.exercise_type,
      duration_months: parseInt(form.duration_months),
      price: parseFloat(form.price),
      is_active: form.is_active,
    };
    let err;
    if (isEdit && plan) {
      ({ error: err } = await supabase.from("subscription_plans").update(payload).eq("id", plan.id));
    } else {
      ({ error: err } = await supabase.from("subscription_plans").insert(payload));
    }
    if (err) { setError(err.message); setLoading(false); return; }
    setLoading(false); onSaved(); onClose();
  }

  const inputCls = "w-full bg-bg border border-border text-text rounded-lg px-3.5 py-2.5 text-sm placeholder:text-faint focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-text">
            {isEdit ? t("edit_plan") : t("add_plan")}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">{t("plan_name")}</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
              placeholder={t("fitness") + " — " + t("month")}
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">{t("exercise_type_label")}</label>
            <select value={form.exercise_type} onChange={(e) => set("exercise_type", e.target.value)} className={inputCls}>
              <option value="fitness">{t("fitness")}</option>
              <option value="bodybuilding">{t("bodybuilding")}</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">{t("duration_months_label")}</label>
              <input
                type="number"
                min="1"
                max="36"
                value={form.duration_months}
                onChange={(e) => set("duration_months", e.target.value)}
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">{t("price_label")}</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                required
                placeholder="0"
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => set("is_active", !form.is_active)}
              className={`relative w-10 h-5 rounded-full transition-colors ${form.is_active ? "bg-primary" : "bg-border"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form.is_active ? "inset-s-[22px]" : "inset-s-0.5"}`} />
            </button>
            <span className="text-sm text-text">{form.is_active ? t("plan_active") : t("plan_inactive")}</span>
          </div>

          {error && <div className="bg-danger/10 border border-danger/20 rounded-lg px-4 py-3 text-sm text-danger">{error}</div>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-muted hover:text-text hover:bg-surface-2 transition-colors">
              {t("cancel")}
            </button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? t("save_changes") : t("add_plan")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
