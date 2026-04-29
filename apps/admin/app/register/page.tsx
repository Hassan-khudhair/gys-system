"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, Eye, EyeOff, Loader2, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    gymName:    "",
    city:       "",
    address:    "",
    phone:      "",
    gymEmail:   "",
    adminName:  "",
    adminEmail: "",
    password:   "",
    confirm:    "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [done, setDone]     = useState(false);

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

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Something went wrong. Please try again.");
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
          <div className="w-16 h-16 bg-[#22C55E]/20 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-9 h-9 text-[#22C55E]" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Application Submitted!</h1>
          <p className="text-[#94A3B8] text-sm leading-relaxed mb-6">
            Your gym registration request has been sent. The Master Gym team will review
            your application and notify you once it&apos;s approved.
          </p>
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 text-sm text-left space-y-2 mb-6">
            <p className="text-[#94A3B8]">Gym: <span className="text-white font-medium">{form.gymName}</span></p>
            <p className="text-[#94A3B8]">Login email: <span className="text-white font-medium">{form.adminEmail}</span></p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            Go to Login <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] px-4 py-10">
      <div className="w-full max-w-xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-[#F59E0B] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#F59E0B]/30">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Register Your Gym</h1>
          <p className="text-[#94A3B8] text-sm mt-1">
            Already have an account?{" "}
            <Link href="/login" className="text-[#F59E0B] hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Gym Information */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white mb-4">Gym Information</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Gym Name *</label>
                <input
                  value={form.gymName}
                  onChange={(e) => set("gymName", e.target.value)}
                  required
                  placeholder="Gold's Gym Baghdad"
                  className="w-full bg-[#0F172A] border border-[#334155] text-white rounded-lg px-3.5 py-2.5 text-sm placeholder:text-[#475569] focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">City</label>
                <input
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="Baghdad"
                  className="w-full bg-[#0F172A] border border-[#334155] text-white rounded-lg px-3.5 py-2.5 text-sm placeholder:text-[#475569] focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+964 7XX XXX XXXX"
                  className="w-full bg-[#0F172A] border border-[#334155] text-white rounded-lg px-3.5 py-2.5 text-sm placeholder:text-[#475569] focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-colors"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Gym Email</label>
                <input
                  type="email"
                  value={form.gymEmail}
                  onChange={(e) => set("gymEmail", e.target.value)}
                  placeholder="contact@yourgym.com"
                  className="w-full bg-[#0F172A] border border-[#334155] text-white rounded-lg px-3.5 py-2.5 text-sm placeholder:text-[#475569] focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-colors"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Address</label>
                <input
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="Street address"
                  className="w-full bg-[#0F172A] border border-[#334155] text-white rounded-lg px-3.5 py-2.5 text-sm placeholder:text-[#475569] focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Admin Account */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white mb-4">Your Admin Account</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Your Full Name *</label>
                <input
                  value={form.adminName}
                  onChange={(e) => set("adminName", e.target.value)}
                  required
                  placeholder="Ahmed Ali"
                  className="w-full bg-[#0F172A] border border-[#334155] text-white rounded-lg px-3.5 py-2.5 text-sm placeholder:text-[#475569] focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-colors"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Login Email *</label>
                <input
                  type="email"
                  value={form.adminEmail}
                  onChange={(e) => set("adminEmail", e.target.value)}
                  required
                  placeholder="you@yourgym.com"
                  className="w-full bg-[#0F172A] border border-[#334155] text-white rounded-lg px-3.5 py-2.5 text-sm placeholder:text-[#475569] focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    required
                    placeholder="Min 8 characters"
                    className="w-full bg-[#0F172A] border border-[#334155] text-white rounded-lg px-3.5 py-2.5 pr-10 text-sm placeholder:text-[#475569] focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-colors"
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
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Confirm Password *</label>
                <input
                  type="password"
                  value={form.confirm}
                  onChange={(e) => set("confirm", e.target.value)}
                  required
                  placeholder="Repeat password"
                  className="w-full bg-[#0F172A] border border-[#334155] text-white rounded-lg px-3.5 py-2.5 text-sm placeholder:text-[#475569] focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-colors"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg px-4 py-3 text-sm text-[#EF4444]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-60 text-white font-semibold rounded-lg py-3 text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Submitting application…" : "Submit Gym Application"}
          </button>
        </form>
      </div>
    </div>
  );
}
