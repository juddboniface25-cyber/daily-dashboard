"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface StepEntry {
  id: string;
  date: string;
  count: number;
  created_at: string;
}

export function useSteps(date: string) {
  const [data, setData] = useState<StepEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: row, error: err } = await supabase
      .from("steps")
      .select("*")
      .eq("date", date)
      .maybeSingle();
    if (err) setError(err.message);
    else setData(row);
    setLoading(false);
  }, [date]);

  useEffect(() => { load(); }, [load]);

  async function save(count: number) {
    setData((prev) => ({ ...(prev ?? { id: "", created_at: "" }), date, count }));
    const { data: row, error: err } = await supabase
      .from("steps")
      .upsert({ date, count }, { onConflict: "date" })
      .select()
      .single();
    if (err) { setError(err.message); load(); }
    else setData(row);
  }

  return { data, loading, error, save };
}
