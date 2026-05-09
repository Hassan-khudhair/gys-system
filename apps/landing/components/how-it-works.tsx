"use client";

import { ArrowLeft, ArrowRight, ClipboardList, ShieldCheck, Zap } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { Reveal } from "./reveal";

const REGISTER_URL = process.env.NEXT_PUBLIC_ADMIN_REGISTER_URL ?? "#";

const CARD_CLS: Record<string, string> = {
  indigo: "border-[#00748e]/20 bg-[#00748e]/8",
  purple: "border-[#078fa7]/20 bg-[#078fa7]/8",
  cyan:   "border-cyan-500/20   bg-cyan-500/8",
};
const ICON_CLS: Record<string, string> = {
  indigo: "bg-[#00748e]/20 border-[#00748e]/30 text-[#00b6cc]",
  purple: "bg-[#078fa7]/20 border-[#078fa7]/30 text-[#078fa7]",
  cyan:   "bg-cyan-500/20   border-cyan-500/30   text-cyan-400",
};
const NUM_CLS: Record<string, string> = {
  indigo: "text-[#00748e]/30",
  purple: "text-[#078fa7]/30",
  cyan:   "text-cyan-500/30",
};

export function HowItWorks() {
  const { t , locale } = useLocale();

  const STEPS = [
    { icon: ClipboardList, number: "01", color: "indigo",
      titleKey: "s1_title" as const, descKey: "s1_desc" as const, detailKey: "s1_detail" as const },
    { icon: ShieldCheck,   number: "02", color: "purple",
      titleKey: "s2_title" as const, descKey: "s2_desc" as const, detailKey: "s2_detail" as const },
    { icon: Zap,           number: "03", color: "cyan",
      titleKey: "s3_title" as const, descKey: "s3_desc" as const, detailKey: "s3_detail" as const },
  ];

  return (
    <section id="how" className="py-28 relative">
      <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-[#078fa7]/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="text-center mb-20">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#078fa7]/20 bg-[#078fa7]/8 text-xs font-medium text-[#078fa7] mb-5">
            ✦ {t("how_badge")}
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-5">
            {t("how_title")}{" "}
            <span className="gradient-text">{t("how_title_gradient")}</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            {t("how_subtitle")}
          </p>
        </Reveal>

        <div className="relative grid md:grid-cols-3 gap-8">
          {/* Connector line */}
          <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-px bg-linear-to-r from-[#00748e]/40 via-[#078fa7]/40 to-[#00b6cc]/40" />

          {STEPS.map((s, i) => (
            <Reveal key={s.number} delay={i * 120}>
              <div className={`relative border rounded-2xl p-8 flex flex-col items-center text-center ${CARD_CLS[s.color]}`}>
                <span className={`absolute top-4 right-5 text-7xl font-black select-none ${NUM_CLS[s.color]}`}>
                  {s.number}
                </span>
                <div className={`relative z-10 w-14 h-14 rounded-2xl border flex items-center justify-center mb-6 ${ICON_CLS[s.color]}`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <h3 className="relative z-10 text-base font-bold text-white mb-3">{t(s.titleKey)}</h3>
                <p className="relative z-10 text-sm text-slate-400 leading-relaxed mb-4">{t(s.descKey)}</p>
                <span className="relative z-10 text-xs font-semibold text-slate-500 italic">{t(s.detailKey)}</span>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="text-center mt-16" delay={300}>
          <a href={REGISTER_URL}
            className="inline-flex items-center gap-2 bg-[#00748e] hover:bg-[#078fa7] text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-xl shadow-[#00748e]/20 hover:shadow-[#078fa7]/35 hover:-translate-y-0.5 text-sm">
            {t("how_cta")}
            {locale === "en" ? (
                <ArrowRight className="w-4 h-4 inline-block ms-1" />
            ) : (
                <ArrowLeft className="w-4 h-4 inline-block ms-1" />
            )}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
