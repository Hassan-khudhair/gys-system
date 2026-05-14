"use client";

import { useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { useLocale } from "../../../lib/i18n";
import { useAdmin } from "../../../lib/admin-context";
import { ExerciseTypeModal } from "../../../components/exercise-type-modal";
import { useToast } from "../../../components/toast";
import { useConfirm } from "../../../components/confirm-dialog";
import { Dumbbell, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { ExerciseTypeRecord } from "@gym/lib";

export default function ExerciseTypesPage() {
  const { t } = useLocale();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { gymId, exerciseTypes, exerciseTypesLoading, reloadExerciseTypes } = useAdmin();

  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<ExerciseTypeRecord | null>(null);

  function openAdd() { setEditRecord(null); setModalOpen(true); }
  function openEdit(et: ExerciseTypeRecord) { setEditRecord(et); setModalOpen(true); }

  async function handleDelete(et: ExerciseTypeRecord) {
    const supabase = createClient();
    const { count } = await supabase
      .from("subscription_plans")
      .select("id", { count: "exact", head: true })
      .eq("gym_id", gymId!)
      .eq("exercise_type", et.name);

    const inUse = (count ?? 0) > 0;
    const ok = await confirm({
      title: t("confirm_delete"),
      message: inUse
        ? t("confirm_delete_exercise_type_in_use_msg")
        : t("confirm_delete_exercise_type_msg"),
      confirmLabel: t("delete_btn"),
      variant: "danger",
    });
    if (!ok) return;
    await supabase.from("exercise_types").delete().eq("id", et.id);
    toast(t("toast_deleted"));
    reloadExerciseTypes();
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-5 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text">{t("exercise_types_title")}</h1>
          <p className="text-sm text-muted mt-0.5">{t("exercise_types_subtitle")}</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">{t("add_exercise_type")}</span>
        </button>
      </div>

      <div className="p-6 space-y-5">
        {exerciseTypesLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : exerciseTypes.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl px-5 py-16 text-center">
            <Dumbbell className="w-10 h-10 mx-auto mb-3 text-muted opacity-40" />
            <p className="text-muted text-sm">{t("no_exercise_types")}</p>
            <button onClick={openAdd} className="mt-4 text-sm text-primary hover:underline">
              {t("add_exercise_type")}
            </button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-surface border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {[t("exercise_type_name_label"), t("created_at_label"), ""].map((h) => (
                      <th key={h} className="px-5 py-3 text-start text-xs font-medium text-muted uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {exerciseTypes.map((et) => (
                    <tr key={et.id} className="hover:bg-surface-2/60 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-text">{et.name}</td>
                      <td className="px-5 py-3.5 text-muted text-xs">
                        {new Date(et.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => openEdit(et)}
                            className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(et)}
                            className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {exerciseTypes.map((et) => (
                <div key={et.id} className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-text">{et.name}</p>
                    <p className="text-xs text-muted mt-0.5">{new Date(et.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(et)}
                      className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 border border-border transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(et)}
                      className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 border border-border transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {gymId && (
        <ExerciseTypeModal
          open={modalOpen}
          exerciseType={editRecord}
          gymId={gymId}
          onClose={() => setModalOpen(false)}
          onSaved={reloadExerciseTypes}
        />
      )}
    </div>
  );
}
