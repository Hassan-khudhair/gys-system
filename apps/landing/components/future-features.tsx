"use client";

import { useEffect, useRef } from "react";
import { DoorOpen, ScanFace, CalendarCheck, BellRing, Sparkles } from "lucide-react";
import { useLocale } from "@/lib/i18n";

const FEATURES = [
  {
    icon: DoorOpen,
    titleKey: "ff1_title" as const,
    descKey: "ff1_desc" as const,
    gradient: "from-violet-500/15 to-purple-600/5",
    border: "border-violet-500/20",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-400",
    glow: "hover:shadow-violet-500/10",
    line: "via-violet-500/30",
  },
  {
    icon: ScanFace,
    titleKey: "ff2_title" as const,
    descKey: "ff2_desc" as const,
    gradient: "from-cyan-500/15 to-teal-600/5",
    border: "border-cyan-500/20",
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
    glow: "hover:shadow-cyan-500/10",
    line: "via-cyan-500/30",
  },
  {
    icon: CalendarCheck,
    titleKey: "ff3_title" as const,
    descKey: "ff3_desc" as const,
    gradient: "from-emerald-500/15 to-green-600/5",
    border: "border-emerald-500/20",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    glow: "hover:shadow-emerald-500/10",
    line: "via-emerald-500/30",
  },
  {
    icon: BellRing,
    titleKey: "ff4_title" as const,
    descKey: "ff4_desc" as const,
    gradient: "from-amber-500/15 to-orange-600/5",
    border: "border-amber-500/20",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    glow: "hover:shadow-amber-500/10",
    line: "via-amber-500/30",
  },
] as const;

export function FutureFeatures() {
  const { t } = useLocale();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll<HTMLElement>(".reveal").forEach((el, i) => {
              const delay = parseInt(el.dataset.delay ?? "0", 10) * 80;
              setTimeout(() => el.classList.add("visible"), delay);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} id="future" className="relative py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#04040e]" />
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-indigo-950/8 to-transparent" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Ambient blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-192 h-64 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 reveal" data-delay="0">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold px-4 py-2 rounded-full mb-6 tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            {t("future_badge")}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t("future_title")}
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-base leading-relaxed">
            {t("future_subtitle")}
          </p>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ icon: Icon, titleKey, descKey, gradient, border, iconBg, iconColor, glow, line }, i) => (
            <div
              key={titleKey}
              className={`reveal group relative rounded-2xl border ${border} bg-linear-to-br ${gradient} p-6 shadow-xl ${glow} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden`}
              data-delay={String((i + 1) * 2)}
            >
              {/* Coming soon badge */}
              <div className="absolute top-4 end-4">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {t("future_coming_soon")}
                </span>
              </div>

              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl ${iconBg} border border-white/8 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
              </div>

              {/* Text */}
              <h3 className="text-base font-semibold text-white mb-2 leading-snug">
                {t(titleKey)}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {t(descKey)}
              </p>

              {/* Bottom accent line */}
              <div className={`absolute bottom-0 inset-x-0 h-px bg-linear-to-r from-transparent ${line} to-transparent`} />
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-slate-600 text-sm mt-12 reveal" data-delay="10">
          {t("future_note")}
        </p>
      </div>
    </section>
  );
}
