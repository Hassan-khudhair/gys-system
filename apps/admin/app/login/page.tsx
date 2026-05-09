"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { Dumbbell, Eye, EyeOff, Loader2 } from "lucide-react";
import { useLocale } from "../../lib/i18n";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/dashboard");
    router.refresh();
  }

  const inputCls = "w-full bg-bg border border-border text-text rounded-lg px-4 py-2.5 text-sm placeholder:text-faint focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 transition-colors">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <div className="w-full rounded-2xl flex items-center justify-center mb-4 ">
            <Image src="/logo.png" alt="FitNex" width={56} height={36} className="w-26 h-16 " />
          </div>
          <p className="text-muted text-sm mt-1">{t("gym_admin_panel")}</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8 transition-colors">
          <h2 className="text-lg font-semibold text-text mb-6">{t("login_title")}</h2>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">{t("email_label")}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                placeholder="you@yourgym.com" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">{t("password_label")}</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••"
                  className={`${inputCls} pe-10`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-e-3 top-1/2 -translate-y-1/2 text-faint hover:text-muted transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <div className="bg-danger/10 border border-danger/20 rounded-lg px-4 py-3 text-sm text-danger">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2.5 text-sm transition-colors flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? t("signing_in") : t("sign_in")}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-muted">
              {t("no_account")}{" "}
              <a href="/register" className="text-primary hover:underline font-medium">{t("register_here")}</a>
            </p>
          </div>
        </div>
        <p className="text-center text-faint text-xs mt-6" suppressHydrationWarning>
          © {new Date().getFullYear()} FitNex. {t("copyright")}
        </p>
      </div>
    </div>
  );
}
