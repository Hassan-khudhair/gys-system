"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "../../../components/header";
import { formatDate } from "@gym/lib";
import type { GymApplication } from "@gym/lib";
import {
  Clock, CheckCircle2, XCircle, Building2, Mail, Phone,
  MapPin, Loader2, AlertCircle
} from "lucide-react";

const STATUS_CONFIG = {
  pending:  { label: "Pending",  className: "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20",  icon: Clock },
  approved: { label: "Approved", className: "text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20", icon: CheckCircle2 },
  rejected: { label: "Rejected", className: "text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20", icon: XCircle },
};

type Tab = "pending" | "approved" | "rejected";

function RejectModal({
  open,
  application,
  onClose,
  onRejected,
}: {
  open: boolean;
  application: GymApplication | null;
  onClose: () => void;
  onRejected: () => void;
}) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open || !application) return null;

  async function handleReject() {
    setLoading(true);
    await fetch("/api/applications/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: application!.id, reason }),
    });
    setLoading(false);
    onRejected();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1E293B] border border-[#334155] rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <h3 className="text-base font-semibold text-white mb-1">Reject Application</h3>
        <p className="text-sm text-[#94A3B8] mb-4">
          Rejecting <span className="text-white">{application.gym_name}</span>.
          Optionally provide a reason.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Reason for rejection (optional)…"
          className="w-full bg-[#0F172A] border border-[#334155] text-white rounded-lg px-3.5 py-2.5 text-sm placeholder:text-[#475569] focus:outline-none focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444] transition-colors resize-none mb-4"
        />
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#94A3B8] hover:text-white hover:bg-[#334155] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#EF4444] hover:bg-red-600 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<GymApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("pending");
  const [approving, setApproving] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<GymApplication | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/applications/list");
    const json = await res.json();
    setApplications(json.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleApprove(app: GymApplication) {
    if (!confirm(`Approve "${app.gym_name}" and create their gym account?`)) return;
    setApproving(app.id);
    await fetch("/api/applications/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: app.id }),
    });
    setApproving(null);
    load();
  }

  const counts = {
    pending:  applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const filtered = applications.filter((a) => a.status === tab);

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "pending",  label: "Pending",  icon: Clock },
    { key: "approved", label: "Approved", icon: CheckCircle2 },
    { key: "rejected", label: "Rejected", icon: XCircle },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Gym Applications" subtitle="Review and approve gym registration requests" />

      <div className="p-6 space-y-5">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-[#1E293B] border border-[#334155] rounded-lg p-1 w-fit">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                tab === key
                  ? "bg-[#263348] text-white shadow-sm"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                tab === key ? "bg-[#334155] text-white" : "text-[#475569]"
              }`}>
                {counts[key]}
              </span>
            </button>
          ))}
        </div>

        {/* Pending notice */}
        {tab === "pending" && counts.pending > 0 && (
          <div className="flex items-start gap-3 bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-[#F59E0B] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-[#94A3B8]">
              <span className="text-[#F59E0B] font-medium">{counts.pending} gym{counts.pending > 1 ? "s" : ""}</span>{" "}
              waiting for your approval. Approving will create their gym and grant dashboard access.
            </p>
          </div>
        )}

        {loading ? (
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-16 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-16 text-center">
            <Building2 className="w-8 h-8 text-[#334155] mx-auto mb-3" />
            <p className="text-[#94A3B8] text-sm">No {tab} applications.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((app) => {
              const cfg = STATUS_CONFIG[app.status];
              const StatusIcon = cfg.icon;
              const isApprovingThis = approving === app.id;

              return (
                <div
                  key={app.id}
                  className="bg-[#1E293B] border border-[#334155] rounded-xl p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Gym info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-[#8B5CF6]">
                          {app.gym_name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-white truncate">{app.gym_name}</h3>
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${cfg.className}`}>
                            <StatusIcon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#94A3B8]">
                          {app.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {app.city}
                            </span>
                          )}
                          {app.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {app.phone}
                            </span>
                          )}
                          {app.gym_email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {app.gym_email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Applied date */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-[#475569]">Applied</p>
                      <p className="text-xs text-[#94A3B8]">{formatDate(app.created_at)}</p>
                    </div>
                  </div>

                  {/* Admin info */}
                  <div className="mt-3 pt-3 border-t border-[#334155] flex items-center justify-between">
                    <div className="text-xs text-[#94A3B8]">
                      Admin: <span className="text-white">{app.admin_name}</span>{" "}
                      <span className="text-[#475569]">({app.admin_email})</span>
                    </div>

                    {/* Actions */}
                    {app.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setRejectModal(app)}
                          disabled={isApprovingThis}
                          className="px-3 py-1.5 text-xs font-medium text-[#EF4444] bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/20 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(app)}
                          disabled={isApprovingThis}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isApprovingThis
                            ? <><Loader2 className="w-3 h-3 animate-spin" /> Approving…</>
                            : <><CheckCircle2 className="w-3 h-3" /> Approve</>
                          }
                        </button>
                      </div>
                    )}

                    {app.status === "rejected" && app.rejection_reason && (
                      <p className="text-xs text-[#EF4444]">
                        Reason: {app.rejection_reason}
                      </p>
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
        onRejected={load}
      />
    </div>
  );
}
