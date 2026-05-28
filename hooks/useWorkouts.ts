"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface WorkoutEntry {
  id: string;
  date: string;
  exercise: string;
  sets: number | null;
  reps: number | null;
  weight_lbs: number | null;
  created_at: string;
}

export function useWorkouts(date: string) {
  const [data, setData] = useState<WorkoutEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: rows, error: err } = await supabase
      .from("workouts")
      .select("*")
      .eq("date", date)
      .order("created_at", { ascending: true });
    if (err) setError(err.message);
    else setData(rows ?? []);
    setLoading(false);
  }, [date]);

  useEffect(() => { load(); }, [load]);

  async function add(entry: Omit<WorkoutEntry, "id" | "created_at">) {
    const tempId = crypto.randomUUID();
    const optimistic: WorkoutEntry = { ...entry, id: tempId, created_at: new Date().toISOString() };
    setData((prev) => [...prev, optimistic]);
    const { data: row, error: err } = await supabase
      .from("workouts")
      .insert(entry)
      .select()
      .single();
    if (err) { setError(err.message); setData((prev) => prev.filter((w) => w.id !== tempId)); }
    else setData((prev) => prev.map((w) => (w.id === tempId ? row : w)));
  }

  return { data, loading, error, add };
}
