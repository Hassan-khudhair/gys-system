"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { createClient } from "../../../lib/supabase/client";
import { Header } from "../../../components/header";
import { GymsTable } from "../../../components/gyms-table";
import { GymModal } from "../../../components/gym-modal";
import type { GymSummary } from "@gym/lib";

export default function GymsPage() {
  const [gyms, setGyms] = useState<GymSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editGym, setEditGym] = useState<GymSummary | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("gym_summary")
      .select("*")
      .order("created_at", { ascending: false });
    setGyms(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(gym: GymSummary) {
    if (!confirm(`Delete "${gym.name}"? This will also delete all players in this gym.`)) return;
    const supabase = createClient();
    await supabase.from("gyms").delete().eq("id", gym.id);
    load();
  }

  function openCreate() {
    setEditGym(null);
    setModalOpen(true);
  }

  function openEdit(gym: GymSummary) {
    setEditGym(gym);
    setModalOpen(true);
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Gyms" subtitle="Manage all gyms in the system" />

      <div className="p-6 space-y-5">
        {/* Action bar */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#94A3B8]">
              {loading ? "Loading…" : `${gyms.length} gym${gyms.length !== 1 ? "s" : ""} registered`}
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-md shadow-[#8B5CF6]/20"
          >
            <Plus className="w-4 h-4" />
            New Gym
          </button>
        </div>

        {loading ? (
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-16 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <GymsTable gyms={gyms} onEdit={openEdit} onDelete={handleDelete} />
        )}
      </div>

      <GymModal
        open={modalOpen}
        gym={editGym}
        onClose={() => setModalOpen(false)}
        onSaved={load}
      />
    </div>
  );
}
