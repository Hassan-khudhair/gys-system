"use client";

import { User } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="h-16 px-6 border-b border-[#334155] flex items-center justify-between bg-[#1E293B]/50 backdrop-blur-sm sticky top-0 z-10">
      <div>
        <h1 className="text-base font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-[#94A3B8] mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2 bg-[#263348] border border-[#334155] rounded-lg px-3 py-1.5">
        <div className="w-6 h-6 bg-[#8B5CF6]/20 rounded-full flex items-center justify-center">
          <User className="w-3.5 h-3.5 text-[#8B5CF6]" />
        </div>
        <span className="text-sm text-[#94A3B8]">Super Admin</span>
      </div>
    </header>
  );
}
