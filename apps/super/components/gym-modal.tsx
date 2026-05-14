"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { createClient } from "../lib/supabase/client";
import { useLocale } from "../lib/i18n";
import { useToast } from "./toast";
import type { GymSummary } from "@gym/lib";

interface Props {
  open: boolean;
  gym?: GymSummary | null;
  onClose: () => void;
  onSaved: () => void;
}

export function GymModal({ open, gym, onClose, onSaved }: Props) {
  const { t } = useLocale();
  const { toast } = useToast();
  const isEdit = Boolean(gym);
  const [form, setForm] = useState({
    name: "", city: "", address: "", phone: "", email: "", max_members: "100", status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const STATUS_OPTIONS = [
    { value: "active",    label: t("status_active") },
    { value: "inactive",  label: t("status_inactive") },
    { value: "suspended", label: t("status_suspended") },
  ];

  useEffect(() => {
    if (gym) {
      setForm({
        name: gym.name, city: gym.city ?? "", address: gym.address ?? "",
        phone: gym.phone ?? "", email: gym.email ?? "",
        max_members: String(gym.max_members), status: gym.status,
      });
    } else {
      setForm({ name: "", city: "", address: "", phone: "", email: "", max_members: "100", status: "active" });
    }
    setError(null);
  }, [gym, open]);

  if (!open) return null;

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const supabase = createClient();
    const payload = {
      name: form.name.trim(), city: form.city.trim() || null, address: form.address.trim() || null,
      phone: form.phone.trim() || null, email: form.email.trim() || null,
      max_members: parseInt(form.max_members) || 100, status: form.status,
    };
    let err;
    if (isEdit && gym) {
      ({ error: err } = await supabase.from("gyms").update(payload).eq("id", gym.id));
    } else {
      ({ error: err } = await supabase.from("gyms").insert(payload));
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
      <div className="relative bg-surface border border-border rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-text">
            {isEdit ? t("edit_gym") : t("create_gym")}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-muted mb-1.5">{t("gym_name")}</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} required
                placeholder="Gold's Gym Downtown" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">{t("city")}</label>
              <input value={form.city} onChange={(e) => set("city", e.target.value)}
                placeholder="Baghdad" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">{t("phone")}</label>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)}
                placeholder="+964 7XX XXX XXXX" className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-muted mb-1.5">{t("gym_email")}</label>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                placeholder="contact@gym.com" className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-muted mb-1.5">{t("address")}</label>
              <input value={form.address} onChange={(e) => set("address", e.target.value)}
                placeholder="Street address" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">{t("max_members")}</label>
              <input type="number" min="1" value={form.max_members} onChange={(e) => set("max_members", e.target.value)}
                className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">{t("status")}</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {error && <div className="bg-danger/10 border border-danger/20 rounded-lg px-4 py-3 text-sm text-danger">{error}</div>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-muted hover:text-text hover:bg-surface-2 transition-colors">
              {t("cancel")}
            </button>
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? t("save_changes") : t("create_gym")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
