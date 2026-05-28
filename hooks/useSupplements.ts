"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function useSupplements(date: string) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: rows, error: err } = await supabase
      .from("supplements")
      .select("name, taken")
      .eq("date", date);
    if (err) setError(err.message);
    else {
      const map: Record<string, boolean> = {};
      for (const row of rows ?? []) map[row.name] = row.taken ?? false;
      setChecked(map);
    }
    setLoading(false);
  }, [date]);

  useEffect(() => { load(); }, [load]);

  async function toggle(name: string) {
    const next = !checked[name];
    setChecked((prev) => ({ ...prev, [name]: next }));
    const { error: err } = await supabase
      .from("supplements")
      .upsert({ date, name, taken: next }, { onConflict: "date,name" });
    if (err) { setError(err.message); load(); }
  }

  return { checked, loading, error, toggle };
}
