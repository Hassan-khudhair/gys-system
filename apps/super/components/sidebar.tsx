"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Building2, LogOut, Clock, X } from "lucide-react";
import { createClient } from "../lib/supabase/client";
import { useLocale } from "../lib/i18n";

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLocale();

  const navItems = [
    { href: "/dashboard",               label: t("nav_dashboard"),    icon: LayoutDashboard, exact: true },
    { href: "/dashboard/gyms",          label: t("nav_gyms"),         icon: Building2,       exact: false },
    { href: "/dashboard/applications",  label: t("nav_applications"), icon: Clock,           exact: false },
  ];

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-56 shrink-0 flex flex-col h-screen sticky top-0 bg-bg border-e border-border transition-colors">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow-md shadow-primary/20 shrink-0 flex items-center justify-center">
            <Image src="/logo.png" alt="Mr. Gym" width={40} height={40} className="object-contain w-full h-full" />
          </div>
          <div>
            <p className="text-sm font-bold text-text leading-tight">Mr. Gym</p>
            <p className="text-[10px] text-primary uppercase tracking-widest font-medium mt-0.5">
              {t("super_admin_role")}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="md:hidden text-muted hover:text-text p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted hover:bg-surface-2 hover:text-text"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? "text-primary" : ""}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:bg-danger/10 hover:text-danger transition-all"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {t("sign_out")}
        </button>
      </div>
    </aside>
  );
}
