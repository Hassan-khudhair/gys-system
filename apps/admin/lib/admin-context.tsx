"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { createClient } from "./supabase/client";
import type { SubscriptionPlan, ExerciseTypeRecord } from "@gym/lib";

interface AdminCtx {
  gymId: string | null;
  plans: SubscriptionPlan[];
  plansLoading: boolean;
  reloadPlans: () => void;
  exerciseTypes: ExerciseTypeRecord[];
  exerciseTypesLoading: boolean;
  reloadExerciseTypes: () => void;
}

const Ctx = createContext<AdminCtx>({
  gymId: null,
  plans: [],
  plansLoading: false,
  reloadPlans: () => {},
  exerciseTypes: [],
  exerciseTypesLoading: false,
  reloadExerciseTypes: () => {},
});

export function AdminProvider({ gymId, children }: { gymId: string | null; children: ReactNode }) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [exerciseTypes, setExerciseTypes] = useState<ExerciseTypeRecord[]>([]);
  const [exerciseTypesLoading, setExerciseTypesLoading] = useState(false);

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

  const reloadExerciseTypes = useCallback(async () => {
    if (!gymId) return;
    setExerciseTypesLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("exercise_types")
      .select("*")
      .eq("gym_id", gymId)
      .order("name");
    setExerciseTypes(data ?? []);
    setExerciseTypesLoading(false);
  }, [gymId]);

  useEffect(() => { reloadPlans(); }, [reloadPlans]);
  useEffect(() => { reloadExerciseTypes(); }, [reloadExerciseTypes]);

  return (
    <Ctx.Provider value={{
      gymId, plans, plansLoading, reloadPlans,
      exerciseTypes, exerciseTypesLoading, reloadExerciseTypes,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAdmin() {
  return useContext(Ctx);
}
