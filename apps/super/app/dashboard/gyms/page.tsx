"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { createClient } from "../../../lib/supabase/client";
import { useLocale } from "../../../lib/i18n";
import { GymsTable } from "../../../components/gyms-table";
import { GymModal } from "../../../components/gym-modal";
import type { GymSummary } from "@gym/lib";

export default function GymsPage() {
  const { t } = useLocale();
  const [gyms, setGyms] = useState<GymSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editGym, setEditGym] = useState<GymSummary | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from("gym_summary").select("*").order("created_at", { ascending: false });
    setGyms(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(gym: GymSummary) {
    if (!confirm(`Delete "${gym.name}"?`)) return;
    const supabase = createClient();
    await supabase.from("gyms").delete().eq("id", gym.id);
    load();
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-5 border-b border-border">
        <h1 className="text-lg font-semibold text-text">{t("gyms_title")}</h1>
        <p className="text-sm text-muted mt-0.5">{t("gyms_subtitle")}</p>
      </div>

      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            {loading ? t("loading") : `${gyms.length} ${gyms.length === 1 ? t("gyms_registered") : t("gyms_registered_plural")}`}
          </p>
          <button onClick={() => { setEditGym(null); setModalOpen(true); }}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-md shadow-primary/20">
            <Plus className="w-4 h-4" />
            {t("add_gym")}
          </button>
        </div>

        {loading ? (
          <div className="bg-surface border border-border rounded-xl p-16 flex items-center justify-center transition-colors">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <GymsTable gyms={gyms} onEdit={(g) => { setEditGym(g); setModalOpen(true); }} onDelete={handleDelete} />
        )}
      </div>

      <GymModal open={modalOpen} gym={editGym} onClose={() => setModalOpen(false)} onSaved={load} />
    </div>
  );
}
