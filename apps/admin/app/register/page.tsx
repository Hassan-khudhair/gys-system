"use client";

import { useState } from "react";
import { Dumbbell, Eye, EyeOff, Loader2, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import { useLocale } from "../../lib/i18n";
import Image from "next/image";

export default function RegisterPage() {
  const { t } = useLocale();
  const [form, setForm] = useState({ gymName: "", city: "", address: "", phone: "", gymEmail: "", adminName: "", adminEmail: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function set(k: string, v: string) { setForm((prev) => ({ ...prev, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) { setError(t("passwords_no_match")); return; }
    if (form.password.length < 8) { setError(t("password_too_short")); return; }
    setLoading(true); setError(null);
    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.adminEmail, password: form.password,
      options: { data: { role: "pending_gym_admin", full_name: form.adminName } },
    });
    if (authError) { setError(authError.message); setLoading(false); return; }
    if (!authData.user) { setError("Failed to create user account."); setLoading(false); return; }
    const { error: appError } = await supabase.from("gym_applications").insert({
      gym_name: form.gymName, city: form.city || null, address: form.address || null,
      phone: form.phone || null, gym_email: form.gymEmail || null,
      admin_name: form.adminName, admin_email: form.adminEmail, user_id: authData.user.id, status: "pending",
    });
    if (appError) { setError(appError.message); setLoading(false); return; }
    setDone(true); setLoading(false);
  }

  const inputCls = "w-full bg-bg border border-border text-text rounded-lg px-3.5 py-2.5 text-sm placeholder:text-faint focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg px-4 transition-colors">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-9 h-9 text-success" />
          </div>
          <h1 className="text-xl font-bold text-text mb-2">{t("application_success")}</h1>
          <p className="text-muted text-sm leading-relaxed mb-6">{t("application_success_msg")}</p>
          <div className="bg-surface border border-border rounded-xl p-4 text-sm text-start space-y-2 mb-6">
            <p className="text-muted">{t("gym_label")}: <span className="text-text font-medium">{form.gymName}</span></p>
            <p className="text-muted">{t("login_email_label")}: <span className="text-text font-medium">{form.adminEmail}</span></p>
          </div>
          <Link href="/login" className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
            {t("go_to_login")} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg px-4 py-10 transition-colors">
      <div className="w-full max-w-xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="w-full rounded-2xl flex items-center justify-center mb-4 ">
            <Image src="/logo.png" alt="FitNex" width={56} height={36} className="w-26 h-16 " />
          </div>
          <h1 className="text-2xl font-bold text-text">{t("register_gym")}</h1>
          <p className="text-muted text-sm mt-1">
            {t("have_account")}{" "}
            <Link href="/login" className="text-primary hover:underline">{t("sign_in")}</Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-4 transition-colors">
            <h2 className="text-sm font-semibold text-text mb-4">{t("gym_info_section")}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-muted mb-1.5">{t("gym_name")}</label>
                <input value={form.gymName} onChange={(e) => set("gymName", e.target.value)} required placeholder="Gold's Gym Baghdad" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">{t("city")}</label>
                <input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Baghdad" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">{t("gym_phone")}</label>
                <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+964 7XX XXX XXXX" className={inputCls} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-muted mb-1.5">{t("gym_email_field")}</label>
                <input type="email" value={form.gymEmail} onChange={(e) => set("gymEmail", e.target.value)} placeholder="contact@yourgym.com" className={inputCls} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-muted mb-1.5">{t("address")}</label>
                <input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Street address" className={inputCls} />
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 space-y-4 transition-colors">
            <h2 className="text-sm font-semibold text-text mb-4">{t("admin_account_section")}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-muted mb-1.5">{t("your_full_name")}</label>
                <input value={form.adminName} onChange={(e) => set("adminName", e.target.value)} required placeholder="Ahmed Ali" className={inputCls} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-muted mb-1.5">{t("login_email")}</label>
                <input type="email" value={form.adminEmail} onChange={(e) => set("adminEmail", e.target.value)} required placeholder="you@yourgym.com" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">{t("password")}</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => set("password", e.target.value)} required placeholder={t("min_8")} className={`${inputCls} pe-10`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-e-3 top-1/2 -translate-y-1/2 text-faint hover:text-muted">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">{t("confirm_password")}</label>
                <input type="password" value={form.confirm} onChange={(e) => set("confirm", e.target.value)} required placeholder={t("repeat_password")} className={inputCls} />
              </div>
            </div>
          </div>

          {error && <div className="bg-danger/10 border border-danger/20 rounded-lg px-4 py-3 text-sm text-danger">{error}</div>}

          <button type="submit" disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-semibold rounded-lg py-3 text-sm transition-colors flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? t("submitting") : t("submit_application")}
          </button>
        </form>
      </div>
    </div>
  );
}
