"use client";

import { Dumbbell, TrendingUp, Users, Shield, ChevronDown, RefreshCw, ArrowRight, ArrowLeft } from "lucide-react";
import { useLocale } from "@/lib/i18n";

const REGISTER_URL = process.env.NEXT_PUBLIC_ADMIN_REGISTER_URL ?? "#";

/* ── Floating widgets ───────────────────── */

function MockDashboard() {
  const { t } = useLocale();

  const members = [
    { name: "عبدالله محمد", init: "عم", status: "active"   as const, days: 24 },
    { name: "عمر حسين",     init: "عح", status: "expiring" as const, days: 4  },
    { name: "فاطمة علي",   init: "فع", status: "active"   as const, days: 61 },
    { name: "كريم جواد",   init: "كج", status: "expired"  as const, days: -3 },
    { name: "زينب صالح",   init: "زص", status: "active"   as const, days: 38 },
  ];

  const badge = {
    active:   "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    expiring: "bg-amber-500/15  text-amber-400  border-amber-500/25",
    expired:  "bg-red-500/15    text-red-400    border-red-500/25",
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-2xl w-85 glow-indigo-sm">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/7">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/25 flex items-center justify-center">
            <Dumbbell className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-none mb-0.5">صالة الفروسية</p>
            <p className="text-[10px] text-slate-500">Al-Firosia Gym</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="relative w-2 h-2">
            <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping-dot" />
            <div className="relative w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <span className="text-[10px] font-medium text-emerald-400">{t("mock_online")}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 divide-x divide-white/6 border-b border-white/7">
        {(
          [
            { key: "mock_total",    value: "847", color: "text-slate-200" },
            { key: "mock_active",   value: "601", color: "text-emerald-400" },
            { key: "mock_expiring", value: "41",  color: "text-amber-400" },
            { key: "mock_expired",  value: "205", color: "text-red-400" },
          ] as const
        ).map((s) => (
          <div key={s.key} className="text-center py-3">
            <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[9px] text-slate-500 uppercase tracking-wide mt-0.5">{t(s.key)}</p>
          </div>
        ))}
      </div>

      <div className="divide-y divide-white/5">
        {members.map((m, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5">
            <div className="w-7 h-7 rounded-full bg-linear-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-500/20 flex items-center justify-center text-[9px] font-bold text-indigo-300 shrink-0">
              {m.init}
            </div>
            <span className="text-xs text-slate-300 flex-1 font-medium">{m.name}</span>
            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${badge[m.status]}`}>
              {t(`mock_${m.status}` as Parameters<typeof t>[0])}
            </span>
            <span className={`text-[9px] w-9 text-right ${m.days > 7 ? "text-slate-500" : m.days > 0 ? "text-amber-500" : "text-red-500"}`}>
              {m.days > 0 ? `${m.days}d` : `${Math.abs(m.days)}d ago`}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-5 py-2.5 border-t border-white/7">
        <span className="text-[10px] text-slate-500">{t("mock_members_total")}</span>
        <div className="flex items-center gap-1">
          {[true, false, false].map((a, i) => (
            <div key={i} className={`rounded-full ${a ? "w-4 h-1.5 bg-indigo-400" : "w-1.5 h-1.5 bg-slate-600"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function RevenueWidget() {
  const { t } = useLocale();
  return (
    <div className="glass-card rounded-xl p-4 w-44 glow-cyan shadow-xl">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/25 flex items-center justify-center">
          <TrendingUp className="w-3 h-3 text-cyan-400" />
        </div>
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          {t("mock_revenue")}
        </span>
      </div>
      <p className="text-base font-bold text-white">IQD 4.25M</p>
      <p className="text-[10px] text-slate-500 mb-3">{t("mock_this_month")}</p>
      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-linear-to-r from-cyan-500 to-indigo-500" style={{ width: "72%" }} />
      </div>
      <p className="text-[9px] text-emerald-400 mt-1.5 font-medium">↑ +18% {t("mock_vs_last")}</p>
    </div>
  );
}

function RenewalToast() {
  const { t } = useLocale();
  return (
    <div className="glass-card rounded-xl p-3.5 w-52 glow-green shadow-xl border-emerald-500/20">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/25 flex items-center justify-center shrink-0">
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div>
          <p className="text-xs font-semibold text-white">{t("mock_renewed")}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">عبدالله محمد · {t("mock_plan")}</p>
        </div>
      </div>
      <div className="mt-2.5 h-0.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full w-[30%] bg-linear-to-r from-emerald-500 to-cyan-500 rounded-full" />
      </div>
    </div>
  );
}

/* ── Hero ─────────────────────────────── */

export function Hero() {
  const { t , locale } = useLocale();

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-28 pb-16">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-175 h-175 rounded-full animate-blob animate-glow-pulse"
          style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.20) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-40 -left-40 w-125 h-125 rounded-full animate-blob"
          style={{ background: "radial-gradient(ellipse, rgba(6,182,212,0.13) 0%, transparent 70%)", animationDelay: "4s" }} />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(168,85,247,0.07) 0%, transparent 70%)" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

        {/* Left: Copy */}
        <div className="animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/25 bg-indigo-500/10 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs font-medium text-indigo-300 tracking-wide">{t("hero_badge")}</span>
          </div>

          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.05] text-white mb-6">
            {t("hero_title1")}
            <br />
            <span className="gradient-text">{t("hero_title2")}</span>
          </h1>

          <p className="text-lg text-slate-400 leading-relaxed mb-10 max-w-lg">
            {t("hero_subtitle")}
          </p>

          <div className="flex flex-wrap gap-4 mb-12">
            <a href={REGISTER_URL}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-all shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5">
              {t("hero_cta_register")} 
              {locale === "en" ? (
                <ArrowRight className="w-4 h-4 inline-block ms-1" />
              ) : (
                <ArrowLeft className="w-4 h-4 inline-block ms-1" />
              )}
            </a>
            <a href="#features"
              className="flex items-center gap-2 glass hover:bg-white/6 text-slate-300 hover:text-white font-semibold px-7 py-3.5 rounded-xl transition-all">
              {t("hero_cta_features")}
            </a>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-slate-500">
            {[
              { icon: Shield,      color: "text-indigo-400", key: "hero_trust_secure"    as const },
              { icon: Users,       color: "text-emerald-400", key: "hero_trust_members"  as const },
              { icon: TrendingUp,  color: "text-cyan-400",    key: "hero_trust_analytics" as const },
            ].map(({ icon: Icon, color, key }) => (
              <div key={key} className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${color}`} />
                <span>{t(key)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Floating mockup */}
        <div className="relative hidden lg:block h-130">
          <div className="absolute inset-0 m-auto w-80 h-80 rounded-full pointer-events-none animate-spin-slow opacity-[0.07]"
            style={{ border: "1px dashed rgba(99,102,241,1)" }} />
          <div className="absolute top-6 left-0 z-20 animate-float-delayed">
            <RevenueWidget />
          </div>
          <div className="absolute right-0 top-10 z-10 animate-float">
            <MockDashboard />
          </div>
          <div className="absolute bottom-10 left-10 z-20 animate-float-sm">
            <RenewalToast />
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-slate-600 animate-bounce">
        <span className="text-[9px] uppercase tracking-widest font-medium">{t("hero_scroll")}</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    </section>
  );
}
