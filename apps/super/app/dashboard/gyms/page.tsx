"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { createClient } from "../../../lib/supabase/client";
import { useLocale } from "../../../lib/i18n";
import { GymsTable } from "../../../components/gyms-table";
import { GymModal } from "../../../components/gym-modal";
import { useToast } from "../../../components/toast";
import { useConfirm } from "../../../components/confirm-dialog";
import type { GymSummary } from "@gym/lib";

const PAGE_SIZE = 12;

export default function GymsPage() {
  const { t } = useLocale();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [gyms, setGyms] = useState<GymSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editGym, setEditGym] = useState<GymSummary | null>(null);

  useEffect(() => {
    const id = setTimeout(() => { setSearchQuery(search); setPage(1); }, 300);
    return () => clearTimeout(id);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase.from("gym_summary").select("*", { count: "exact" })
      .order("created_at", { ascending: false });
    if (searchQuery) query = query.or(`name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`);

    const { data, count } = await query.range(from, to);
    setGyms(data ?? []);
    setTotalCount(count ?? 0);
    setLoading(false);
  }, [page, searchQuery]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(gym: GymSummary) {
    const ok = await confirm({
      title: t("confirm_delete"),
      message: t("confirm_delete_gym_msg"),
      confirmLabel: t("delete_btn"),
      variant: "danger",
    });
    if (!ok) return;
    const supabase = createClient();
    await supabase.from("gyms").delete().eq("id", gym.id);
    toast(t("toast_deleted"));
    load();
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-5 border-b border-border">
        <h1 className="text-lg font-semibold text-text">{t("gyms_title")}</h1>
        <p className="text-sm text-muted mt-0.5">{t("gyms_subtitle")}</p>
      </div>

      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            {loading ? t("loading") : `${totalCount} ${totalCount === 1 ? t("gyms_registered") : t("gyms_registered_plural")}`}
          </p>
          <button onClick={() => { setEditGym(null); setModalOpen(true); }}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-md shadow-primary/20">
            <Plus className="w-4 h-4" />
            {t("add_gym")}
          </button>
        </div>

        <GymsTable
          gyms={gyms}
          loading={loading}
          page={page}
          totalPages={totalPages}
          onPage={setPage}
          search={search}
          onSearch={setSearch}
          onEdit={(g) => { setEditGym(g); setModalOpen(true); }}
          onDelete={handleDelete}
        />
      </div>

      <GymModal open={modalOpen} gym={editGym} onClose={() => setModalOpen(false)} onSaved={load} />
    </div>
  );
}
