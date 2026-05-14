"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, UserX, LogOut, X, Tag, Dumbbell } from "lucide-react";
import { createClient } from "../lib/supabase/client";
import { useLocale } from "../lib/i18n";

interface SidebarProps {
  gymName?: string;
  onClose?: () => void;
}

export function Sidebar({ gymName, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLocale();

  /* Grouped nav — group 0: overview, 1: members, 2: config */
  const navItems = [
    { href: "/dashboard",                label: t("nav_dashboard"),      icon: LayoutDashboard, exact: true,  group: 0 },
    { href: "/dashboard/players",        label: t("nav_all_players"),    icon: Users,           exact: false, group: 1 },
    { href: "/dashboard/expired",        label: t("nav_expired"),        icon: UserX,           exact: false, group: 1 },
    { href: "/dashboard/exercise-types", label: t("nav_exercise_types"), icon: Dumbbell,        exact: false, group: 2 },
    { href: "/dashboard/plans",          label: t("nav_plans"),          icon: Tag,             exact: false, group: 2 },
  ];

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const groups = [0, 1, 2];

  return (
    <aside
      className="w-56 shrink-0 flex flex-col h-screen sticky top-0 border-e border-border/30 transition-colors overflow-hidden"
      style={{ backgroundColor: "var(--color-sidebar)" }}
    >
      {/* Top atmospheric glow — teal */}
      <div
        className="absolute top-0 inset-x-0 h-56 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% -20%, rgba(0,182,204,0.13) 0%, transparent 70%)" }}
      />

      {/* Large faded Dumbbell — brand watermark */}
      <div className="absolute bottom-10 inset-x-0 flex justify-center pointer-events-none select-none">
        <Dumbbell
          className="w-48 h-48 -rotate-[20deg] opacity-[0.028]"
          style={{ color: "var(--color-primary)" }}
        />
      </div>

      {/* Logo / gym header */}
      <div className="relative flex items-center gap-3 px-4 py-4 border-b border-border/25">
        <div className="w-16 h-12 rounded-lg overflow-hidden ring-1 ring-white/8 shrink-0">
          <Image src="/logo.png" alt="fitnex" width={62} height={32} className="object-contain w-full h-full" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg text-primary font-bold truncate opacity-70 mt-0.5">
            {gymName ?? t("gym_admin_role")}
          </p>
        </div>
        <button
          onClick={onClose}
          className="md:hidden shrink-0 p-1 rounded-md text-muted hover:text-text transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation — grouped */}
      <nav className="relative flex-1 px-2 py-3 overflow-y-auto">
        {groups.map((groupIdx) => {
          const items = navItems.filter((n) => n.group === groupIdx);
          return (
            <div key={groupIdx}>
              {groupIdx > 0 && (
                <div className="h-px bg-border/20 mx-2 my-2" />
              )}
              <div className="space-y-0.5">
                {items.map(({ href, label, icon: Icon, exact }) => {
                  const active = exact ? pathname === href : pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => onClose?.()}
                      className={`group relative flex items-center gap-2.5 px-3 py-2.25 rounded-lg text-sm transition-all duration-150 overflow-hidden ${
                        active
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted hover:text-text hover:bg-primary/5"
                      }`}
                    >
                      {/* Left-edge active indicator */}
                      {active && (
                        <span className="absolute inset-s-0 inset-y-0 w-0.5 rounded-full bg-primary" />
                      )}
                      <Icon
                        className={`w-5 h-5 shrink-0 transition-colors ${
                          active ? "text-primary" : "text-faint group-hover:text-muted"
                        }`}
                      />
                      <span className="truncate">{label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="relative px-2 py-3 border-t border-border/25">
        <button
          onClick={handleLogout}
          className="group flex items-center gap-2.5 w-full px-3 py-2.25 rounded-lg text-[13px] font-medium text-muted hover:text-danger hover:bg-danger/10 transition-all duration-150"
        >
          <LogOut className="w-4 h-4 shrink-0 transition-colors group-hover:text-danger" />
          {t("sign_out")}
        </button>
      </div>
    </aside>
  );
}
