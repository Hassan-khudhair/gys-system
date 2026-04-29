"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { createClient } from "../lib/supabase/client";
import type { GymSummary } from "@gym/lib";

interface Props {
  open: boolean;
  gym?: GymSummary | null;
  onClose: () => void;
  onSaved: () => void;
}

const STATUS_OPTIONS = [
  { value: "active",    label: "Active" },
  { value: "inactive",  label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

export function GymModal({ open, gym, onClose, onSaved }: Props) {
  const isEdit = Boolean(gym);
  const [form, setForm] = useState({
    name: "",
    city: "",
    address: "",
    phone: "",
    email: "",
    max_members: "100",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (gym) {
      setForm({
        name:        gym.name,
        city:        gym.city        ?? "",
        address:     gym.address     ?? "",
        phone:       gym.phone       ?? "",
        email:       gym.email       ?? "",
        max_members: String(gym.max_members),
        status:      gym.status,
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
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const payload = {
      name:        form.name.trim(),
      city:        form.city.trim()    || null,
      address:     form.address.trim() || null,
      phone:       form.phone.trim()   || null,
      email:       form.email.trim()   || null,
      max_members: parseInt(form.max_members) || 100,
      status:      form.status,
    };

    let err;
    if (isEdit && gym) {
      ({ error: err } = await supabase.from("gyms").update(payload).eq("id", gym.id));
    } else {
      ({ error: err } = await supabase.from("gyms").insert(payload));
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
      <div className="relative bg-[#1E293B] border border-[#334155] rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#334155]">
          <h2 className="text-base font-semibold text-white">
            {isEdit ? "Edit Gym" : "Create New Gym"}
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
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Gym Name *</label>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
                placeholder="Gold's Gym Downtown"
                className="w-full bg-[#0F172A] border border-[#334155] text-white rounded-lg px-3.5 py-2.5 text-sm placeholder:text-[#475569] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">City</label>
              <input
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="Baghdad"
                className="w-full bg-[#0F172A] border border-[#334155] text-white rounded-lg px-3.5 py-2.5 text-sm placeholder:text-[#475569] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+964 7XX XXX XXXX"
                className="w-full bg-[#0F172A] border border-[#334155] text-white rounded-lg px-3.5 py-2.5 text-sm placeholder:text-[#475569] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-colors"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="contact@gym.com"
                className="w-full bg-[#0F172A] border border-[#334155] text-white rounded-lg px-3.5 py-2.5 text-sm placeholder:text-[#475569] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-colors"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Address</label>
              <input
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Street address"
                className="w-full bg-[#0F172A] border border-[#334155] text-white rounded-lg px-3.5 py-2.5 text-sm placeholder:text-[#475569] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Max Members</label>
              <input
                type="number"
                min="1"
                value={form.max_members}
                onChange={(e) => set("max_members", e.target.value)}
                className="w-full bg-[#0F172A] border border-[#334155] text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full bg-[#0F172A] border border-[#334155] text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-colors"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
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
              className="flex items-center gap-2 px-5 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Gym"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
