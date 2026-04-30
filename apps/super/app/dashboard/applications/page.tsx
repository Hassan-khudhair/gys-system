"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "../../../lib/i18n";
import { formatDate } from "@gym/lib";
import type { GymApplication } from "@gym/lib";
import { createClient } from "../../../lib/supabase/client";
import { Clock, CheckCircle2, XCircle, Building2, Mail, Phone, MapPin, Loader2, AlertCircle } from "lucide-react";

const STATUS_CLS = {
  pending:  "text-warning bg-warning/10 border-warning/20",
  approved: "text-success bg-success/10 border-success/20",
  rejected: "text-danger bg-danger/10 border-danger/20",
};

type Tab = "pending" | "approved" | "rejected";

function RejectModal({
  open, application, onClose, onRejected,
}: {
  open: boolean;
  application: GymApplication | null;
  onClose: () => void;
  onRejected: (id: string, reason: string) => Promise<void>;
}) {
  const { t } = useLocale();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open || !application) return null;

  async function handleReject() {
    setLoading(true);
    await onRejected(application!.id, reason);
    setLoading(false); onClose(); setReason("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl transition-colors">
        <h3 className="text-base font-semibold text-text mb-1">{t("reject_application")}</h3>
        <p className="text-sm text-muted mb-4">
          {t("rejection_note")} <span className="text-text">{application.gym_name}</span>.
        </p>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
          placeholder={t("rejection_reason_placeholder")}
          className="w-full bg-bg border border-border text-text rounded-lg px-3.5 py-2.5 text-sm placeholder:text-faint focus:outline-none focus:border-danger focus:ring-1 focus:ring-danger transition-colors resize-none mb-4" />
        <div className="flex gap-3 justify-end">
          <button onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted hover:text-text hover:bg-surface-2 rounded-lg transition-colors">
            {t("cancel")}
          </button>
          <button onClick={handleReject} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-danger hover:bg-danger/90 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {t("reject")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ApplicationsPage() {
  const { t } = useLocale();
  const [applications, setApplications] = useState<GymApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("pending");
  const [approving, setApproving] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<GymApplication | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from("gym_applications").select("*").order("created_at", { ascending: false });
    setApplications(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleApprove(app: GymApplication) {
    if (!confirm(`Approve "${app.gym_name}"?`)) return;
    setApproving(app.id);
    const supabase = createClient();
    const { error } = await supabase.rpc("approve_gym_application", { application_id: app.id });
    if (error) alert(error.message);
    setApproving(null);
    load();
  }

  async function handleReject(applicationId: string, reason: string) {
    const supabase = createClient();
    const { error } = await supabase.from("gym_applications").update({
      status: "rejected", rejection_reason: reason || null, reviewed_at: new Date().toISOString(),
    }).eq("id", applicationId);
    if (error) alert(error.message);
    load();
  }

  const counts = {
    pending:  applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const filtered = applications.filter((a) => a.status === tab);

  const STATUS_ICONS = { pending: Clock, approved: CheckCircle2, rejected: XCircle };

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "pending",  label: t("tab_pending"),  icon: Clock },
    { key: "approved", label: t("tab_approved"), icon: CheckCircle2 },
    { key: "rejected", label: t("tab_rejected"), icon: XCircle },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-5 border-b border-border">
        <h1 className="text-lg font-semibold text-text">{t("applications_title")}</h1>
        <p className="text-sm text-muted mt-0.5">{t("applications_subtitle")}</p>
      </div>

      <div className="p-6 space-y-5">
        <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-1 w-fit transition-colors">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                tab === key ? "bg-surface-2 text-text shadow-sm" : "text-muted hover:text-text"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                tab === key ? "bg-border text-text" : "text-faint"
              }`}>
                {counts[key]}
              </span>
            </button>
          ))}
        </div>

        {tab === "pending" && counts.pending > 0 && (
          <div className="flex items-start gap-3 bg-warning/5 border border-warning/20 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
            <p className="text-sm text-muted">
              <span className="text-warning font-medium">{counts.pending} {counts.pending > 1 ? t("pending_apps_plural") : t("pending_apps")}</span>{" "}
              {t("review_note")}
            </p>
          </div>
        )}

        {loading ? (
          <div className="bg-surface border border-border rounded-xl p-16 flex items-center justify-center transition-colors">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-16 text-center transition-colors">
            <Building2 className="w-8 h-8 text-border mx-auto mb-3" />
            <p className="text-muted text-sm">{t("no_applications")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((app) => {
              const StatusIcon = STATUS_ICONS[app.status as keyof typeof STATUS_ICONS] ?? Clock;
              const statusCls = STATUS_CLS[app.status as keyof typeof STATUS_CLS] ?? STATUS_CLS.pending;
              const isApprovingThis = approving === app.id;

              return (
                <div key={app.id} className="bg-surface border border-border rounded-xl p-5 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">
                          {app.gym_name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-text truncate">{app.gym_name}</h3>
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 ${statusCls}`}>
                            <StatusIcon className="w-3 h-3" />
                            {app.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                          {app.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {app.city}</span>}
                          {app.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {app.phone}</span>}
                          {app.gym_email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {app.gym_email}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-end shrink-0">
                      <p className="text-xs text-faint">{t("applied")}</p>
                      <p className="text-xs text-muted">{formatDate(app.created_at)}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                    <div className="text-xs text-muted">
                      {t("admin_label")}: <span className="text-text">{app.admin_name}</span>{" "}
                      <span className="text-faint">({app.admin_email})</span>
                    </div>
                    {app.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => setRejectModal(app)} disabled={isApprovingThis}
                          className="px-3 py-1.5 text-xs font-medium text-danger bg-danger/10 hover:bg-danger/20 border border-danger/20 rounded-lg transition-colors disabled:opacity-50">
                          {t("reject")}
                        </button>
                        <button onClick={() => handleApprove(app)} disabled={isApprovingThis}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50">
                          {isApprovingThis
                            ? <><Loader2 className="w-3 h-3 animate-spin" /> {t("approving")}</>
                            : <><CheckCircle2 className="w-3 h-3" /> {t("approve")}</>
                          }
                        </button>
                      </div>
                    )}
                    {app.status === "rejected" && app.rejection_reason && (
                      <p className="text-xs text-danger">{t("reason")}: {app.rejection_reason}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <RejectModal
        open={rejectModal !== null}
        application={rejectModal}
        onClose={() => setRejectModal(null)}
        onRejected={handleReject}
      />
    </div>
  );
}
