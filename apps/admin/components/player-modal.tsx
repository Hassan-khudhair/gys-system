"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { createClient } from "../lib/supabase/client";
import type { Player } from "@gym/lib";

interface Props {
  open: boolean;
  player?: Player | null;
  gymId: string;
  onClose: () => void;
  onSaved: () => void;
}

const SUBSCRIPTION_OPTIONS = [
  { value: "monthly",      label: "Monthly (1 month)" },
  { value: "quarterly",    label: "Quarterly (3 months)" },
  { value: "semi_annual",  label: "Semi-Annual (6 months)" },
  { value: "annual",       label: "Annual (12 months)" },
];

const SUBSCRIPTION_MONTHS: Record<string, number> = {
  monthly: 1, quarterly: 3, semi_annual: 6, annual: 12,
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function addMonths(dateStr: string, months: number) {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export function PlayerModal({ open, player, gymId, onClose, onSaved }: Props) {
  const isEdit = Boolean(player);
  const [form, setForm] = useState({
    name:              "",
    phone:             "",
    email:             "",
    notes:             "",
    start_date:        todayStr(),
    end_date:          addMonths(todayStr(), 1),
    subscription_type: "monthly",
    amount_paid:       "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (player) {
      setForm({
        name:              player.name,
        phone:             player.phone             ?? "",
        email:             player.email             ?? "",
        notes:             player.notes             ?? "",
        start_date:        player.start_date,
        end_date:          player.end_date,
        subscription_type: player.subscription_type,
        amount_paid:       player.amount_paid != null ? String(player.amount_paid) : "",
      });
    } else {
      const today = todayStr();
      setForm({
        name: "", phone: "", email: "", notes: "",
        start_date: today,
        end_date: addMonths(today, 1),
        subscription_type: "monthly",
        amount_paid: "",
      });
    }
    setError(null);
  }, [player, open]);

  if (!open) return null;

  function set(field: string, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Auto-compute end_date when subscription_type or start_date changes
      if ((field === "subscription_type" || field === "start_date") && !isEdit) {
        const months = SUBSCRIPTION_MONTHS[field === "subscription_type" ? value : next.subscription_type] ?? 1;
        const start  = field === "start_date" ? value : next.start_date;
        next.end_date = addMonths(start, months);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const payload = {
      gym_id:            gymId,
      name:              form.name.trim(),
      phone:             form.phone.trim()  || null,
      email:             form.email.trim()  || null,
      notes:             form.notes.trim()  || null,
      start_date:        form.start_date,
      end_date:          form.end_date,
      subscription_type: form.subscription_type,
      amount_paid:       form.amount_paid ? parseFloat(form.amount_paid) : null,
    };

    let err;
    if (isEdit && player) {
      ({ error: err } = await supabase.from("players").update(payload).eq("id", player.id));
    } else {
      ({ error: err } = await supabase.from("players").insert(payload));
    }

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1E293B] border border-[#334155] rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#334155] sticky top-0 bg-[#1E293B] z-10">
          <h2 className="text-base font-semibold text-white">
            {isEdit ? "Edit Player" : "Add New Player"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#334155] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Full Name *</label>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
                placeholder="Ali Hassan"
                className="w-full bg-[#0F172A] border border-[#334155] text-white rounded-lg px-3.5 py-2.5 text-sm placeholder:text-[#475569] focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-colors"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+964 7XX XXX XXXX"
                className="w-full bg-[#0F172A] border border-[#334155] text-white rounded-lg px-3.5 py-2.5 text-sm placeholder:text-[#475569] focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="player@email.com"
                className="w-full bg-[#0F172A] border border-[#334155] text-white rounded-lg px-3.5 py-2.5 text-sm placeholder:text-[#475569] focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-colors"
              />
            </div>

            {/* Subscription type */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Subscription Type</label>
              <select
                value={form.subscription_type}
                onChange={(e) => set("subscription_type", e.target.value)}
                className="w-full bg-[#0F172A] border border-[#334155] text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-colors"
              >
                {SUBSCRIPTION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Start date */}
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Start Date *</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => set("start_date", e.target.value)}
                required
                className="w-full bg-[#0F172A] border border-[#334155] text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-colors"
              />
            </div>

            {/* End date */}
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">End Date *</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => set("end_date", e.target.value)}
                required
                className="w-full bg-[#0F172A] border border-[#334155] text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-colors"
              />
            </div>

            {/* Amount paid */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Amount Paid (IQD)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount_paid}
                onChange={(e) => set("amount_paid", e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#0F172A] border border-[#334155] text-white rounded-lg px-3.5 py-2.5 text-sm placeholder:text-[#475569] focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-colors"
              />
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                rows={2}
                placeholder="Optional notes…"
                className="w-full bg-[#0F172A] border border-[#334155] text-white rounded-lg px-3.5 py-2.5 text-sm placeholder:text-[#475569] focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-colors resize-none"
              />
            </div>
          </div>

          {error && (
            <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg px-4 py-3 text-sm text-[#EF4444]">
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[#94A3B8] hover:text-white hover:bg-[#334155] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Add Player"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
