"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { useLocale } from "../../lib/i18n";
import { Dumbbell, Clock, XCircle, Loader2, LogOut } from "lucide-react";
import type { GymApplication } from "@gym/lib";

export default function PendingPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [application, setApplication] = useState<GymApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) { router.replace("/login"); return; }
      if (user.user_metadata?.role === "gym_admin") { router.replace("/dashboard"); return; }

      const { data } = await supabase
        .from("gym_applications")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!data) { router.replace("/register"); return; }
      setApplication(data);
      setLoading(false);
    }
    check();
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg transition-colors">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  const isRejected = application?.status === "rejected";

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 transition-colors">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-text">FitNex</h1>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8 text-center transition-colors">
          {isRejected ? (
            <>
              <div className="w-14 h-14 bg-danger/15 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-7 h-7 text-danger" />
              </div>
              <h2 className="text-lg font-bold text-text mb-2">{t("rejected_title")}</h2>
              <p className="text-muted text-sm mb-4">{t("rejected_msg")}</p>
              {application?.rejection_reason && (
                <div className="bg-danger/10 border border-danger/20 rounded-lg px-4 py-3 text-sm text-danger text-start mb-4">
                  <p className="font-medium mb-1">{t("rejection_reason")}</p>
                  <p>{application.rejection_reason}</p>
                </div>
              )}
              <p className="text-faint text-xs">
                {t("contact_admin")}{" "}
                <a href="mailto:support@mrgym.com" className="text-primary hover:underline">
                  support@mrgym.com
                </a>
              </p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-text mb-2">{t("pending_title")}</h2>
              <p className="text-muted text-sm leading-relaxed mb-5">
                {t("pending_msg")}
              </p>
              <div className="bg-surface-2 rounded-xl px-4 py-3 text-start space-y-1.5 mb-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">{t("gym")}</span>
                  <span className="text-text font-medium">{application?.gym_name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">{t("status")}</span>
                  <span className="text-primary font-medium">{t("pending_status")}</span>
                </div>
              </div>
              <p className="text-faint text-xs">{t("usually_24h")}</p>
            </>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 mx-auto mt-5 text-sm text-muted hover:text-text transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {t("sign_out")}
        </button>
      </div>
    </div>
  );
}
