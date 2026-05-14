"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, UserX, Dumbbell, Tag } from "lucide-react";
import { useLocale } from "../lib/i18n";

interface NavItem {
  href: string;
  labelKey: "nav_mob_players" | "nav_mob_expired" | "nav_mob_types" | "nav_mob_plans";
  icon: React.ElementType;
}

const LEFT_ITEMS: NavItem[] = [
  { href: "/dashboard/players", labelKey: "nav_mob_players", icon: Users },
  { href: "/dashboard/expired", labelKey: "nav_mob_expired", icon: UserX },
];

const RIGHT_ITEMS: NavItem[] = [
  { href: "/dashboard/exercise-types", labelKey: "nav_mob_types",   icon: Dumbbell },
  { href: "/dashboard/plans",          labelKey: "nav_mob_plans",   icon: Tag },
];

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useLocale();

  const homeActive = pathname === "/dashboard";

  function isActive(href: string) {
    return pathname.startsWith(href);
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 flex items-stretch"
      style={{
        height: "calc(3.75rem + env(safe-area-inset-bottom))",
        background: "var(--mob-nav-bg, rgba(3,13,16,0.88))",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderTop: "1px solid rgba(15,47,58,0.7)",
        boxShadow: "0 -8px 32px rgba(0,0,0,0.35)",
      }}
    >
      <div
        className="flex items-center w-full"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Left items */}
        {LEFT_ITEMS.map(({ href, labelKey, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 min-h-0 transition-all duration-150 active:scale-95"
            >
              <div
                className="w-6 h-6 flex items-center justify-center transition-colors duration-150"
                style={{ color: active ? "var(--color-primary)" : "var(--color-faint)" }}
              >
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.75} />
              </div>
              <span
                className="text-[9.5px] font-medium leading-none truncate max-w-[4rem] transition-colors duration-150"
                style={{ color: active ? "var(--color-primary)" : "var(--color-faint)" }}
              >
                {t(labelKey)}
              </span>
            </Link>
          );
        })}

        {/* Centre home button — elevated FAB-style */}
        <Link
          href="/dashboard"
          className="flex-1 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform duration-150"
          style={{ marginTop: "-16px" }}
        >
          <div
            className="w-13 h-13 rounded-2xl flex items-center justify-center transition-all duration-200"
            style={{
              width: "52px",
              height: "52px",
              background: homeActive
                ? "var(--color-primary)"
                : "rgba(0,116,142,0.15)",
              border: homeActive
                ? "none"
                : "1px solid rgba(0,116,142,0.3)",
              boxShadow: homeActive
                ? "0 4px 20px rgba(0,116,142,0.45), 0 1px 4px rgba(0,0,0,0.3)"
                : "0 2px 8px rgba(0,0,0,0.25)",
            }}
          >
            <LayoutDashboard
              className="w-5 h-5"
              style={{ color: homeActive ? "#fff" : "var(--color-primary)" }}
              strokeWidth={2}
            />
          </div>
          <span
            className="text-[9.5px] font-medium leading-none transition-colors duration-150"
            style={{ color: homeActive ? "var(--color-primary)" : "var(--color-faint)" }}
          >
            {t("nav_mob_home")}
          </span>
        </Link>

        {/* Right items */}
        {RIGHT_ITEMS.map(({ href, labelKey, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 min-h-0 transition-all duration-150 active:scale-95"
            >
              <div
                className="w-6 h-6 flex items-center justify-center transition-colors duration-150"
                style={{ color: active ? "var(--color-primary)" : "var(--color-faint)" }}
              >
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.75} />
              </div>
              <span
                className="text-[9.5px] font-medium leading-none truncate max-w-[4rem] transition-colors duration-150"
                style={{ color: active ? "var(--color-primary)" : "var(--color-faint)" }}
              >
                {t(labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
