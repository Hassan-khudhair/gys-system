"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { createClient } from "../lib/supabase/client";
import { useLocale } from "../lib/i18n";
import { useToast } from "./toast";
import type { ExerciseTypeRecord } from "@gym/lib";

interface Props {
  open: boolean;
  exerciseType?: ExerciseTypeRecord | null;
  gymId: string;
  onClose: () => void;
  onSaved: () => void;
}

export function ExerciseTypeModal({ open, exerciseType, gymId, onClose, onSaved }: Props) {
  const { t } = useLocale();
  const { toast } = useToast();
  const isEdit = Boolean(exerciseType);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(exerciseType?.name ?? "");
    setError(null);
  }, [exerciseType, open]);

  if (!open) return null;

  const inputCls = "w-full bg-bg border border-border text-text rounded-lg px-3.5 py-2.5 text-sm placeholder:text-faint focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    let err;
    if (isEdit && exerciseType) {
      ({ error: err } = await supabase
        .from("exercise_types")
        .update({ name: trimmed })
        .eq("id", exerciseType.id));
    } else {
      ({ error: err } = await supabase
        .from("exercise_types")
        .insert({ gym_id: gymId, name: trimmed }));
    }
    if (err) {
      setError(err.code === "23505" ? t("exercise_type_duplicate") : err.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    toast(isEdit ? t("toast_saved") : t("toast_added"));
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface border border-border rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-text">
            {isEdit ? t("edit_exercise_type") : t("add_exercise_type")}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              {t("exercise_type_name_label")}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder={t("exercise_type_name_placeholder")}
              className={inputCls}
              autoFocus
            />
          </div>
          {error && (
            <div className="bg-danger/10 border border-danger/20 rounded-lg px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-muted hover:text-text hover:bg-surface-2 transition-colors">
              {t("cancel")}
            </button>
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? t("save_changes") : t("add_exercise_type")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
