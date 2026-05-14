"use client";

import Image from "next/image";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";
import { AdminProvider } from "../lib/admin-context";

interface Props {
  children: React.ReactNode;
  gymName?: string;
  adminName?: string;
  email?: string;
  gymId?: string | null;
}

export function DashboardShell({ children, gymName, adminName, email, gymId = null }: Props) {
  return (
    <AdminProvider gymId={gymId}>
      <div className="flex h-full min-h-screen bg-bg">

        {/* Sidebar — desktop only */}
        <div className="hidden md:flex">
          <Sidebar gymName={gymName} />
        </div>

        {/* Main content column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header
            gymName={gymName}
            adminName={adminName}
            email={email}
          />
          <main
            className="relative flex-1 overflow-y-auto pb-[calc(3.75rem+env(safe-area-inset-bottom))] md:pb-0"
            data-main-scroll
          >
            {/* Logo watermark */}
            <div
              aria-hidden="true"
              className="sticky top-0 h-0 overflow-visible pointer-events-none select-none"
              style={{ zIndex: 0 }}
            >
              <div
                className="absolute left-1/2"
                style={{ top: "calc(30vh - 28px)", transform: "translate(-50%, -50%)" }}
              >
                <Image
                  src="/logo.png"
                  alt=""
                  width={800}
                  height={800}
                  style={{
                    width: "min(800px, 80vw)",
                    height: "min(800px, 80vw)",
                    objectFit: "contain",
                    opacity: 0.06,
                    filter: "blur(1px)",
                    maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
                    WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
                  }}
                />
              </div>
            </div>
            <div id="dashboard-scroll-sentinel" aria-hidden="true" className="h-px" />
            {children}
          </main>
        </div>

        {/* Mobile bottom navigation */}
        <MobileNav />
      </div>
    </AdminProvider>
  );
}
