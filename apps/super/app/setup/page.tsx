"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "../../lib/i18n";
import { Dumbbell, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

export default function SetupPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function set(k: string, v: string) { setForm((prev) => ({ ...prev, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) { setError(t("confirm_password") + " ≠"); return; }
    if (form.password.length < 8) { setError("Min 8 characters."); return; }
    setLoading(true); setError(null);

    const res = await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, password: form.password }),
    });

    const json = await res.json();
    if (!res.ok) { setError(json.error ?? "Failed to create super admin."); setLoading(false); return; }
    setDone(true); setLoading(false);
  }

  const inputCls = "w-full bg-bg border border-border text-text rounded-lg px-4 py-2.5 text-sm placeholder:text-faint focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg px-4 transition-colors">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-xl font-bold text-text mb-2">{t("account_created")}</h1>
          <p className="text-muted text-sm mb-6">
            {t("account_created_msg")} <span className="text-text font-medium">{form.email}</span>
          </p>
          <button
            onClick={() => router.push("/login")}
            className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            {t("go_to_login")} →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 transition-colors">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text">{t("setup_title")}</h1>
          <p className="text-muted text-sm mt-1">{t("setup_subtitle")}</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8 transition-colors">
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 mb-6">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            <p className="text-xs text-muted">{t("setup_warning")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">{t("email_label")}</label>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required
                placeholder="superadmin@mrgym.com" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">{t("password")}</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={form.password}
                  onChange={(e) => set("password", e.target.value)} required placeholder="Min 8 characters"
                  className={`${inputCls} pe-10`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-e-3 top-1/2 -translate-y-1/2 text-faint hover:text-muted">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">{t("confirm_password")}</label>
              <input type="password" value={form.confirm} onChange={(e) => set("confirm", e.target.value)} required
                placeholder="Repeat password" className={inputCls} />
            </div>
            {error && <div className="bg-danger/10 border border-danger/20 rounded-lg px-4 py-3 text-sm text-danger">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? t("creating") : t("create_account")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
