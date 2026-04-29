"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Building2, LogOut, Dumbbell, Clock } from "lucide-react";
import { createClient } from "../lib/supabase/client";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/gyms", label: "Gyms", icon: Building2, exact: false },
  { href: "/dashboard/applications", label: "Applications", icon: Clock, exact: false },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col h-screen sticky top-0 bg-[#1E293B] border-r border-[#334155]">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-[#334155]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#8B5CF6] rounded-xl flex items-center justify-center shadow-md shadow-[#8B5CF6]/30">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">Master Gym</p>
            <p className="text-[10px] text-[#8B5CF6] uppercase tracking-widest font-medium mt-0.5">
              Super Admin
            </p>
          </div>
        </div>
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
                  ? "bg-[#8B5CF6]/15 text-[#8B5CF6]"
                  : "text-[#94A3B8] hover:bg-[#263348] hover:text-[#F8FAFC]"
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 ${active ? "text-[#8B5CF6]" : ""}`}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-[#334155]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#94A3B8] hover:bg-[#EF4444]/10 hover:text-[#EF4444] transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
