"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { createClient } from "./supabase/client";
import type { SubscriptionPlan } from "@gym/lib";

interface AdminCtx {
  gymId: string | null;
  plans: SubscriptionPlan[];
  plansLoading: boolean;
  reloadPlans: () => void;
}

const Ctx = createContext<AdminCtx>({
  gymId: null,
  plans: [],
  plansLoading: false,
  reloadPlans: () => {},
});

export function AdminProvider({ gymId, children }: { gymId: string | null; children: ReactNode }) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);

  const reloadPlans = useCallback(async () => {
    if (!gymId) return;
    setPlansLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("gym_id", gymId)
      .order("exercise_type")
      .order("duration_months");
    setPlans(data ?? []);
    setPlansLoading(false);
  }, [gymId]);

  // Fetch once when gymId is available
  useEffect(() => { reloadPlans(); }, [reloadPlans]);

  return (
    <Ctx.Provider value={{ gymId, plans, plansLoading, reloadPlans }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAdmin() {
  return useContext(Ctx);
}
