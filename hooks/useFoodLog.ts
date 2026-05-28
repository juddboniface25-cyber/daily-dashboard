"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface FoodEntry {
  id: string;
  date: string;
  meal: string | null;
  description: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  created_at: string;
}

export function useFoodLog(date: string) {
  const [data, setData] = useState<FoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: rows, error: err } = await supabase
      .from("food_log")
      .select("*")
      .eq("date", date)
      .order("created_at", { ascending: true });
    if (err) setError(err.message);
    else setData(rows ?? []);
    setLoading(false);
  }, [date]);

  useEffect(() => { load(); }, [load]);

  async function add(entry: Omit<FoodEntry, "id" | "created_at">) {
    const tempId = crypto.randomUUID();
    const optimistic: FoodEntry = { ...entry, id: tempId, created_at: new Date().toISOString() };
    setData((prev) => [...prev, optimistic]);
    const { data: row, error: err } = await supabase
      .from("food_log")
      .insert(entry)
      .select()
      .single();
    if (err) { setError(err.message); setData((prev) => prev.filter((f) => f.id !== tempId)); }
    else setData((prev) => prev.map((f) => (f.id === tempId ? row : f)));
  }

  return { data, loading, error, add };
}
