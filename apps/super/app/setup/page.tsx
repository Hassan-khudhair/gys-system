"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

export default function SetupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function set(k: string, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, password: form.password }),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Failed to create super admin.");
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-[#22C55E]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-[#22C55E]" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Super Admin Created!</h1>
          <p className="text-[#94A3B8] text-sm mb-6">
            You can now sign in with <span className="text-white font-medium">{form.email}</span>.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            Go to Login →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-[#8B5CF6] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#8B5CF6]/30">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Master Gym Setup</h1>
          <p className="text-[#94A3B8] text-sm mt-1">Create the super admin account</p>
        </div>

        <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-8">
          <div className="flex items-center gap-2 bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 rounded-lg px-4 py-3 mb-6">
            <ShieldCheck className="w-4 h-4 text-[#8B5CF6] flex-shrink-0" />
            <p className="text-xs text-[#94A3B8]">
              This creates the master admin account. Only do this once.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
                placeholder="superadmin@mastergym.com"
                className="w-full bg-[#0F172A] border border-[#334155] text-white rounded-lg px-4 py-2.5 text-sm placeholder:text-[#475569] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  required
                  placeholder="Min 8 characters"
                  className="w-full bg-[#0F172A] border border-[#334155] text-white rounded-lg px-4 py-2.5 pr-10 text-sm placeholder:text-[#475569] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#94A3B8]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                value={form.confirm}
                onChange={(e) => set("confirm", e.target.value)}
                required
                placeholder="Repeat password"
                className="w-full bg-[#0F172A] border border-[#334155] text-white rounded-lg px-4 py-2.5 text-sm placeholder:text-[#475569] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-colors"
              />
            </div>

            {error && (
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg px-4 py-3 text-sm text-[#EF4444]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-60 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Creating account…" : "Create Super Admin"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
