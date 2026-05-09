"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { AdminProvider } from "../lib/admin-context";

interface Props {
  children: React.ReactNode;
  gymName?: string;
  adminName?: string;
  email?: string;
  gymId?: string | null;
}

export function DashboardShell({ children, gymName, adminName, email, gymId = null }: Props) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AdminProvider gymId={gymId}>
      <div className="flex h-full min-h-screen bg-bg">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className={`
          fixed inset-y-0 inset-s-0 z-50 transition-transform duration-300 ease-in-out
          md:static md:translate-x-0 md:z-auto
          ${isSidebarOpen ? "translate-x-0" : "max-md:ltr:-translate-x-full max-md:rtl:translate-x-full"}
        `}>
          <Sidebar gymName={gymName} onClose={() => setIsSidebarOpen(false)} />
        </div>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header
            gymName={gymName}
            adminName={adminName}
            email={email}
            onMenuClick={() => setIsSidebarOpen(true)}
          />
          <main className="relative flex-1 overflow-y-auto" data-main-scroll>
            {/* Logo watermark — sticky anchor keeps it centered in the viewport as content scrolls */}
            <div
              aria-hidden="true"
              className="sticky top-0 h-0 overflow-visible pointer-events-none select-none"
              style={{ zIndex: 0 }}
            >
              <div
                className="absolute left-1/2"
                style={{ top: "calc(50vh - 28px)", transform: "translate(-50%, -50%)" }}
              >
                <img
                  src="/logo.png"
                  alt=""
                  style={{
                    width: "min(540px, 62vw)",
                    height: "min(540px, 62vw)",
                    objectFit: "contain",
                    opacity: 0.06,
                    filter: "blur(1px)",
                    maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
                    WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
                  }}
                />
              </div>
            </div>
            {/* Sentinel: header watches this to detect scroll */}
            <div id="dashboard-scroll-sentinel" aria-hidden="true" className="h-px" />
            {children}
          </main>
        </div>
      </div>
    </AdminProvider>
  );
}
