"use client";

import {
  Users, Tag, AlertTriangle, TrendingUp,
  Building2, RefreshCw, Globe, Moon,
} from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { Reveal } from "./reveal";

const ICON_CLS: Record<string, string> = {
  indigo:  "bg-[#00748e]/15 border-[#00748e]/20 text-[#00b6cc]",
  purple:  "bg-[#078fa7]/15 border-[#078fa7]/20 text-[#078fa7]",
  amber:   "bg-amber-500/15  border-amber-500/20  text-amber-400",
  cyan:    "bg-cyan-500/15   border-cyan-500/20   text-cyan-400",
  blue:    "bg-blue-500/15   border-blue-500/20   text-blue-400",
  emerald: "bg-emerald-500/15 border-emerald-500/20 text-emerald-400",
  violet:  "bg-[#00748e]/15 border-[#00748e]/20 text-[#00b6cc]",
  slate:   "bg-slate-500/15  border-slate-500/20  text-slate-400",
};

export function Features() {
  const { t } = useLocale();

  const FEATURES = [
    { icon: Users,     color: "indigo",  titleKey: "f1_title" as const, descKey: "f1_desc" as const },
    { icon: Tag,       color: "purple",  titleKey: "f2_title" as const, descKey: "f2_desc" as const },
    { icon: AlertTriangle, color: "amber", titleKey: "f3_title" as const, descKey: "f3_desc" as const },
    { icon: TrendingUp, color: "cyan",   titleKey: "f4_title" as const, descKey: "f4_desc" as const },
    { icon: Building2, color: "blue",    titleKey: "f5_title" as const, descKey: "f5_desc" as const },
    { icon: RefreshCw, color: "emerald", titleKey: "f6_title" as const, descKey: "f6_desc" as const },
    { icon: Globe,     color: "violet",  titleKey: "f7_title" as const, descKey: "f7_desc" as const },
    { icon: Moon,      color: "slate",   titleKey: "f8_title" as const, descKey: "f8_desc" as const },
  ];

  return (
    <section id="features" className="py-28 relative">
      <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-[#00748e]/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00748e]/20 bg-[#00748e]/8 text-xs font-medium text-[#00b6cc] mb-5">
            ✦ {t("features_badge")}
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-5">
            {t("features_title")}
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t("features_subtitle")}
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <Reveal key={f.titleKey} delay={i * 60} direction="scale">
              <div className="feature-card h-full">
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-5 ${ICON_CLS[f.color]}`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-2 leading-snug">{t(f.titleKey)}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{t(f.descKey)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
