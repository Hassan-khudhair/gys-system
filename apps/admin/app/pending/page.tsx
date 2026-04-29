"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { Dumbbell, Clock, XCircle, Loader2, LogOut } from "lucide-react";
import type { GymApplication } from "@gym/lib";

export default function PendingPage() {
  const router = useRouter();
  const [application, setApplication] = useState<GymApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      // If user is already approved (has gym_admin role), go to dashboard
      if (user.user_metadata?.role === "gym_admin") {
        router.replace("/dashboard");
        return;
      }

      // Fetch their application
      const { data } = await supabase
        .from("gym_applications")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!data) {
        router.replace("/register");
        return;
      }

      setApplication(data);
      setLoading(false);
    }

    check();
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <Loader2 className="w-6 h-6 text-[#F59E0B] animate-spin" />
      </div>
    );
  }

  const isRejected = application?.status === "rejected";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-[#F59E0B] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#F59E0B]/30">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Master Gym</h1>
        </div>

        <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-8 text-center">
          {isRejected ? (
            <>
              <div className="w-14 h-14 bg-[#EF4444]/15 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-7 h-7 text-[#EF4444]" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Application Rejected</h2>
              <p className="text-[#94A3B8] text-sm mb-4">
                Unfortunately your gym application was not approved.
              </p>
              {application?.rejection_reason && (
                <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg px-4 py-3 text-sm text-[#EF4444] text-left mb-4">
                  <p className="font-medium mb-1">Reason:</p>
                  <p>{application.rejection_reason}</p>
                </div>
              )}
              <p className="text-[#94A3B8] text-xs">
                Contact us at{" "}
                <a href="mailto:support@mastergym.com" className="text-[#F59E0B] hover:underline">
                  support@mastergym.com
                </a>{" "}
                for more information.
              </p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 bg-[#F59E0B]/15 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7 text-[#F59E0B]" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Application Under Review</h2>
              <p className="text-[#94A3B8] text-sm leading-relaxed mb-5">
                Your gym <span className="text-white font-medium">{application?.gym_name}</span> is
                being reviewed by our team. You will have access to the admin panel once approved.
              </p>
              <div className="bg-[#263348] rounded-xl px-4 py-3 text-left space-y-1.5 mb-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#94A3B8]">Gym</span>
                  <span className="text-white font-medium">{application?.gym_name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#94A3B8]">Status</span>
                  <span className="text-[#F59E0B] font-medium">Pending Approval</span>
                </div>
              </div>
              <p className="text-[#475569] text-xs">
                Usually approved within 24 hours. Check back later.
              </p>
            </>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 mx-auto mt-5 text-sm text-[#94A3B8] hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
