"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface LearningSession {
  id: string;
  date: string;
  topic: string | null;
  minutes: number;
  created_at: string;
}

export function useLearning(date: string) {
  const [data, setData] = useState<LearningSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: rows, error: err } = await supabase
      .from("learning")
      .select("*")
      .eq("date", date)
      .order("created_at", { ascending: true });
    if (err) setError(err.message);
    else setData(rows ?? []);
    setLoading(false);
  }, [date]);

  useEffect(() => { load(); }, [load]);

  async function add(minutes: number, topic: string | null) {
    const tempId = crypto.randomUUID();
    const optimistic: LearningSession = { id: tempId, date, topic, minutes, created_at: new Date().toISOString() };
    setData((prev) => [...prev, optimistic]);
    const { data: row, error: err } = await supabase
      .from("learning")
      .insert({ date, topic, minutes })
      .select()
      .single();
    if (err) { setError(err.message); setData((prev) => prev.filter((s) => s.id !== tempId)); }
    else setData((prev) => prev.map((s) => (s.id === tempId ? row : s)));
  }

  return { data, loading, error, add };
}
