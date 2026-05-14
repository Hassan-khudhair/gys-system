"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../lib/supabase/client";
import { useLocale } from "../../../lib/i18n";
import { useAdmin } from "../../../lib/admin-context";
import { PlanModal } from "../../../components/plan-modal";
import { Pagination } from "../../../components/pagination";
import { useToast } from "../../../components/toast";
import { useConfirm } from "../../../components/confirm-dialog";
import { Tag, Plus, Pencil, Trash2, Loader2, CheckCircle, XCircle } from "lucide-react";
import type { SubscriptionPlan } from "@gym/lib";
import { exerciseTypeBadgeClass } from "@gym/lib";

const PAGE_SIZE = 10;

export default function PlansPage() {
  const { t } = useLocale();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { gymId, plans, plansLoading, reloadPlans, exerciseTypes } = useAdmin();
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<SubscriptionPlan | null>(null);

  const loading = plansLoading;

  function openAdd() { setEditPlan(null); setModalOpen(true); }
  function openEdit(plan: SubscriptionPlan) { setEditPlan(plan); setModalOpen(true); }

  async function deletePlan(plan: SubscriptionPlan) {
    const ok = await confirm({
      title: t("confirm_delete"),
      message: t("confirm_delete_plan_msg"),
      confirmLabel: t("delete_btn"),
      variant: "danger",
    });
    if (!ok) return;
    const supabase = createClient();
    await supabase.from("subscription_plans").delete().eq("id", plan.id);
    toast(t("toast_deleted"));
    reloadPlans();
  }

  const allTabs = ["all", ...exerciseTypes.map((et) => et.name)];
  const filtered = plans.filter((p) => tab === "all" || p.exercise_type === tab);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleTab(tb: string) { setTab(tb); setPage(1); }

  // Reset to "all" if the active tab's exercise type was deleted
  useEffect(() => {
    if (tab !== "all" && !exerciseTypes.some((et) => et.name === tab)) setTab("all");
  }, [exerciseTypes, tab]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-5 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text">{t("plans_title")}</h1>
          <p className="text-sm text-muted mt-0.5">{t("plans_subtitle")}</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">{t("add_plan")}</span>
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* Tabs */}
        <div className="flex gap-1 flex-wrap bg-surface border border-border rounded-xl p-1 w-fit">
          {allTabs.map((tb) => (
            <button
              key={tb}
              onClick={() => handleTab(tb)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                tab === tb ? "bg-surface-2 text-text shadow-sm" : "text-muted hover:text-text"
              }`}
            >
              {tb === "all" ? t("tab_all_plans") : tb}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : paginated.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl px-5 py-16 text-center">
            <Tag className="w-10 h-10 mx-auto mb-3 text-muted opacity-40" />
            <p className="text-muted text-sm">{tab === "all" ? t("no_plans") : t("no_plans_type")}</p>
            <button onClick={openAdd} className="mt-4 text-sm text-primary hover:underline">{t("add_plan")}</button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-surface border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {[t("plan_name"), t("exercise_type_label"), t("duration_months_label"), t("price_label"), t("plan_status"), ""].map((h) => (
                      <th key={h} className="px-5 py-3 text-start text-xs font-medium text-muted uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.map((plan) => (
                    <tr key={plan.id} className="hover:bg-surface-2/60 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-text">{plan.name}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${exerciseTypeBadgeClass(plan.exercise_type)}`}>
                          {plan.exercise_type}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-muted">
                        {plan.duration_months} {plan.duration_months === 1 ? t("month") : t("months")}
                      </td>
                      <td className="px-5 py-3.5 text-text font-medium">
                        {plan.price.toLocaleString()} {t("currency")}
                      </td>
                      <td className="px-5 py-3.5">
                        {plan.is_active ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" /> {t("plan_active")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted bg-muted/10 border border-border px-2 py-0.5 rounded-full">
                            <XCircle className="w-3 h-3" /> {t("plan_inactive")}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => openEdit(plan)} className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => deletePlan(plan)} className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors">
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
              {paginated.map((plan) => (
                <div key={plan.id} className="bg-surface border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-text">{plan.name}</p>
                      <span className={`inline-flex items-center mt-1 text-xs font-medium px-2 py-0.5 rounded-full border ${exerciseTypeBadgeClass(plan.exercise_type)}`}>
                        {plan.exercise_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => openEdit(plan)} className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 border border-border transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => deletePlan(plan)} className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 border border-border transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 bg-surface-2/50 rounded-lg p-3 border border-border/50 text-[11px]">
                    <div>
                      <p className="text-muted uppercase font-medium mb-0.5">{t("duration_months_label")}</p>
                      <p className="text-text font-semibold">{plan.duration_months} {plan.duration_months === 1 ? t("month") : t("months")}</p>
                    </div>
                    <div>
                      <p className="text-muted uppercase font-medium mb-0.5">{t("price_label")}</p>
                      <p className="text-text font-semibold">{plan.price.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted uppercase font-medium mb-0.5">{t("plan_status")}</p>
                      <p className={`font-semibold ${plan.is_active ? "text-success" : "text-muted"}`}>
                        {plan.is_active ? t("plan_active") : t("plan_inactive")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Pagination page={page} totalPages={totalPages} onPage={setPage} />
          </>
        )}
      </div>

      {gymId && (
        <PlanModal
          open={modalOpen}
          plan={editPlan}
          gymId={gymId}
          onClose={() => setModalOpen(false)}
          onSaved={reloadPlans}
        />
      )}
    </div>
  );
}
