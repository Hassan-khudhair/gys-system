"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface Props {
  gymName?: string;
  adminName?: string;
  email?: string;
  children: React.ReactNode;
}

export function DashboardShell({ gymName, adminName, email, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-full min-h-screen">
      <Sidebar gymName={gymName} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header gymName={gymName} adminName={adminName} email={email} onMenuClick={() => setSidebarOpen(true)} />
        {children}
      </div>
    </div>
  );
}
