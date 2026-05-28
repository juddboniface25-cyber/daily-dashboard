"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export const WORKOUT_TYPES = ["Push", "Pull", "Legs", "Upper", "Lower", "Rest"] as const;
export type WorkoutType = (typeof WORKOUT_TYPES)[number];

export function useWorkoutType(date: string) {
  const [type, setTypeState] = useState<WorkoutType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: row, error: err } = await supabase
      .from("workout_days")
      .select("workout_type")
      .eq("date", date)
      .maybeSingle();
    if (err) setError(err.message);
    else setTypeState((row?.workout_type as WorkoutType | null) ?? null);
    setLoading(false);
  }, [date]);

  useEffect(() => { load(); }, [load]);

  // Pass null to clear the day's workout type.
  async function setType(workout_type: WorkoutType | null) {
    setTypeState(workout_type);
    const { error: err } = await supabase
      .from("workout_days")
      .upsert({ date, workout_type }, { onConflict: "date" });
    if (err) { setError(err.message); load(); }
  }

  return { type, loading, error, setType };
}
