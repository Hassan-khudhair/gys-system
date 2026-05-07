"use client";

import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { Reveal } from "./reveal";

const REGISTER_URL = process.env.NEXT_PUBLIC_ADMIN_REGISTER_URL ?? "#";
const LOGIN_URL    = process.env.NEXT_PUBLIC_ADMIN_LOGIN_URL    ?? "#";

export function Cta() {
  const { t , locale } = useLocale();

  const BENEFITS = [
    t("cta_b1"), t("cta_b2"), t("cta_b3"),
    t("cta_b4"), t("cta_b5"), t("cta_b6"),
  ];

  const STATS = [
    { value: t("cta_stat1_value"), label: t("cta_stat1_label") },
    { value: t("cta_stat2_value"), label: t("cta_stat2_label") },
    { value: t("cta_stat3_value"), label: t("cta_stat3_label") },
  ];

  return (
    <section id="apply" className="py-28 relative overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-150 h-150 rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.13) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-24 right-0 w-100 h-100 rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(6,182,212,0.08) 0%, transparent 70%)" }} />
      </div>
      <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-cyan-500/20 to-transparent" />

      <div className="relative max-w-6xl mx-auto px-6">

        {/* Header */}
        <Reveal className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/8 text-xs font-medium text-cyan-400 mb-6">
            ✦ {t("cta_badge")}
          </span>
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white tracking-tight leading-tight mb-5">
            {t("cta_title1")}{" "}
            <span className="gradient-text">{t("cta_title2")}</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t("cta_subtitle")}
          </p>
        </Reveal>

        {/* CTA Buttons */}
        <Reveal className="flex flex-wrap items-center justify-center gap-4 mb-16" delay={100}>
          <a href={REGISTER_URL}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 text-base">
            {t("cta_register_btn")} 
            {locale === "en" ? (
                <ArrowRight className="w-4 h-4 inline-block ms-1" />
            ) : (
                <ArrowLeft className="w-4 h-4 inline-block ms-1" />
            )}
          </a>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span>{t("cta_login_text")}</span>
            <a href={LOGIN_URL}
              className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-2">
              {t("cta_login_btn")}
            </a>
          </div>
        </Reveal>

        {/* Stats */}
        <Reveal delay={150}>
          <div className="glass-card rounded-2xl p-8 mb-8">
            <div className="grid md:grid-cols-3 gap-8 text-center mb-8 pb-8 border-b border-white/7">
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="text-3xl font-extrabold gradient-text">{s.value}</p>
                  <p className="text-sm text-slate-500 mt-1.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Benefits grid */}
            <p className="text-sm font-semibold text-slate-300 text-center mb-6">
              {t("cta_included")}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {BENEFITS.map((b) => (
                <div key={b} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-sm text-slate-400">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
