"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { User, Sun, Moon, Globe, X, Dumbbell } from "lucide-react";
import { useLocale } from "../lib/i18n";
import { useTheme } from "../lib/theme";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  gymName?: string;
  adminName?: string;
  email?: string;
}

export function Header({ title, subtitle, gymName, adminName, email }: HeaderProps) {
  const { t, locale, setLocale } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const [showInfo, setShowInfo] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const main = document.querySelector("[data-main-scroll]") as HTMLElement | null;
    if (!main) return;
    const onScroll = () => setScrolled(main.scrollTop > 10);
    main.addEventListener("scroll", onScroll, { passive: true });
    return () => main.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        setShowInfo(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header
      className={`h-14 px-4 md:px-6 flex items-center justify-between sticky top-0 z-10 transition-all duration-300 ${
        scrolled
          ? "bg-bg/90 backdrop-blur-md border-b border-border/40 shadow-sm shadow-black/15"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      {/* ── Start side ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Logo — mobile only (desktop has it in the sidebar) */}
        <div className="md:hidden flex items-center">
          <div className="w-14 h-9 rounded-lg overflow-hidden ring-1 ring-primary/20">
            <Image
              src="/logo.png"
              alt="FitNex"
              width={56}
              height={36}
              className="object-contain w-full h-full"
              priority
            />
          </div>
        </div>

        {/* Optional page title — all screens */}
        {(title || subtitle) && (
          <div>
            {title    && <h1 className="text-sm font-semibold text-text truncate max-w-[150px] md:max-w-none">{title}</h1>}
            {subtitle && <p className="text-[10px] text-muted truncate max-w-[150px] md:max-w-none">{subtitle}</p>}
          </div>
        )}
      </div>

      {/* ── End side ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-1">
        {/* Theme toggle — desktop only */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? t("light") : t("dark")}
          className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg text-muted hover:text-text hover:bg-surface-2/60 transition-colors"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Language toggle — desktop only */}
        <button
          onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
          title={t("language")}
          className="hidden md:flex h-8 px-2.5 items-center gap-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-2/60 transition-colors text-xs font-medium"
        >
          <Globe className="w-3.5 h-3.5" />
          {locale === "ar" ? "EN" : "عر"}
        </button>

        {/* User info button — all screens */}
        <div className="relative ms-1" ref={dialogRef}>
          <button
            onClick={() => setShowInfo((p) => !p)}
            className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-all border ${
              showInfo
                ? "bg-surface border-border/60"
                : "bg-transparent border-transparent hover:bg-surface-2/60 hover:border-border/30"
            }`}
          >
            <div className="w-6 h-6 bg-primary/20 border border-primary/25 rounded-full flex items-center justify-center shrink-0">
              <User className="w-3 h-3 text-primary" />
            </div>
            <span className="hidden sm:inline text-[13px] text-muted font-medium">
              {adminName ?? t("gym_admin_role")}
            </span>
          </button>

          {/* ── Dropdown ───────────────────────────────────────────── */}
          {showInfo && (
            <div className="absolute inset-e-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] bg-surface border border-border/60 rounded-xl shadow-2xl shadow-black/30 z-50 overflow-hidden">
              {/* Header row */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-primary/15 border border-primary/20 rounded-lg flex items-center justify-center shrink-0">
                    <Dumbbell className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-[13px] font-semibold text-text">{t("account_info")}</span>
                </div>
                <button
                  onClick={() => setShowInfo(false)}
                  className="p-1 rounded-md text-muted hover:text-text transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User info */}
              <div className="px-4 py-3.5 space-y-3">
                {gymName && (
                  <div>
                    <p className="text-[10px] font-semibold text-faint uppercase tracking-wider mb-1">{t("gym_name_label")}</p>
                    <p className="text-[13px] font-medium text-text">{gymName}</p>
                  </div>
                )}
                {adminName && (
                  <div>
                    <p className="text-[10px] font-semibold text-faint uppercase tracking-wider mb-1">{t("account_name")}</p>
                    <p className="text-[13px] font-medium text-text">{adminName}</p>
                  </div>
                )}
                {email && (
                  <div>
                    <p className="text-[10px] font-semibold text-faint uppercase tracking-wider mb-1">{t("email_field")}</p>
                    <p className="text-[13px] font-medium text-text break-all">{email}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-semibold text-faint uppercase tracking-wider mb-1.5">{t("gym_admin_role")}</p>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
                    <User className="w-3 h-3" />
                    {t("gym_admin_role")}
                  </span>
                </div>
              </div>

              {/* ── Theme + Language controls — shown inside dropdown on mobile, also visible on desktop ── */}
              <div className="border-t border-border/40 px-4 py-3 space-y-1">
                {/* Theme row */}
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-2/70 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    {theme === "dark"
                      ? <Sun className="w-4 h-4 text-warning" />
                      : <Moon className="w-4 h-4 text-primary" />}
                    <span className="text-[13px] text-text font-medium">
                      {theme === "dark" ? t("light") : t("dark")}
                    </span>
                  </div>
                  {/* Pill toggle */}
                  <div
                    className="relative w-8 h-4 rounded-full transition-colors duration-200 shrink-0"
                    style={{ background: theme === "dark" ? "rgba(0,116,142,0.25)" : "var(--color-primary)" }}
                  >
                    <span
                      className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all duration-200"
                      style={{ insetInlineStart: theme === "dark" ? "2px" : "calc(100% - 14px)" }}
                    />
                  </div>
                </button>

                {/* Language row */}
                <button
                  onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-2/70 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-muted" />
                    <span className="text-[13px] text-text font-medium">{t("language")}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                        locale === "en"
                          ? "bg-primary/10 border-primary/25 text-primary"
                          : "border-border/40 text-faint"
                      }`}
                    >
                      EN
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                        locale === "ar"
                          ? "bg-primary/10 border-primary/25 text-primary"
                          : "border-border/40 text-faint"
                      }`}
                    >
                      عر
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
