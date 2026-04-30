"use client";

import { useState, useRef, useEffect } from "react";
import { User, Sun, Moon, Globe, X, Dumbbell, Menu } from "lucide-react";
import { useLocale } from "../lib/i18n";
import { useTheme } from "../lib/theme";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  adminName?: string;
  email?: string;
  onMenuClick?: () => void;
}

export function Header({ title, subtitle, adminName, email, onMenuClick }: HeaderProps) {
  const { t, locale, setLocale } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const [showInfo, setShowInfo] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

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
    <header className="h-16 px-4 md:px-6 border-b border-border flex items-center justify-between bg-surface/80 backdrop-blur-sm sticky top-0 z-10 transition-colors">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          {title && <h1 className="text-sm md:text-base font-semibold text-text truncate max-w-[150px] md:max-w-none">{title}</h1>}
          {subtitle && <p className="text-[10px] md:text-xs text-muted mt-0.5 truncate max-w-[150px] md:max-w-none">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? t("light") : t("dark")}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Language toggle */}
        <button
          onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
          title={t("language")}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors text-xs font-medium"
        >
          <Globe className="w-3.5 h-3.5" />
          {locale === "ar" ? "EN" : "عر"}
        </button>

        {/* User info button */}
        <div className="relative" ref={dialogRef}>
          <button
            onClick={() => setShowInfo((p) => !p)}
            className="flex items-center gap-2 bg-surface-2 border border-border rounded-lg px-3 py-1.5 hover:border-primary/40 transition-colors"
          >
            <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="hidden sm:inline text-sm text-muted">{adminName ?? t("super_admin_role")}</span>
          </button>

          {showInfo && (
            <div className="absolute inset-e-0 top-full mt-2 w-72 bg-surface border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center">
                    <Dumbbell className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-text">{t("account_info")}</span>
                </div>
                <button onClick={() => setShowInfo(false)} className="text-muted hover:text-text">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-4 py-3 space-y-3">
                {adminName && (
                  <div>
                    <p className="text-xs text-muted mb-0.5">{t("account_name")}</p>
                    <p className="text-sm font-medium text-text">{adminName}</p>
                  </div>
                )}
                {email && (
                  <div>
                    <p className="text-xs text-muted mb-0.5">{t("email_field")}</p>
                    <p className="text-sm font-medium text-text break-all">{email}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted mb-0.5">{t("super_admin_role")}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                    <User className="w-3 h-3" />
                    {t("super_admin_role")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
