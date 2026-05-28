"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface SleepEntry {
  id: string;
  date: string;
  wake_time: string | null;
  bedtime: string | null;
  total_hours: number | null;
  created_at: string;
}

function parseTimeMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function computeSleepHours(bedtime: string, wakeup: string): number {
  const bed = parseTimeMinutes(bedtime);
  const wake = parseTimeMinutes(wakeup);
  const minutes = wake < bed ? 24 * 60 - bed + wake : wake - bed;
  return Math.round((minutes / 60) * 10) / 10;
}

export function useSleep(date: string) {
  const [data, setData] = useState<SleepEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: row, error: err } = await supabase
      .from("sleep")
      .select("*")
      .eq("date", date)
      .maybeSingle();
    if (err) setError(err.message);
    else setData(row);
    setLoading(false);
  }, [date]);

  useEffect(() => { load(); }, [load]);

  async function saveWakeTime(wake_time: string) {
    const bedtime = data?.bedtime ?? null;
    const total_hours = bedtime ? computeSleepHours(bedtime, wake_time) : null;
    setData((prev) => ({ ...(prev ?? { id: "", created_at: "" }), date, wake_time, bedtime, total_hours }));
    const { error: err } = await supabase
      .from("sleep")
      .upsert({ date, wake_time, bedtime, total_hours }, { onConflict: "date" });
    if (err) { setError(err.message); load(); }
    else load();
  }

  async function saveBedtime(bedtime: string) {
    const wake_time = data?.wake_time ?? null;
    const total_hours = wake_time ? computeSleepHours(bedtime, wake_time) : null;
    setData((prev) => ({ ...(prev ?? { id: "", created_at: "" }), date, wake_time, bedtime, total_hours }));
    const { error: err } = await supabase
      .from("sleep")
      .upsert({ date, wake_time, bedtime, total_hours }, { onConflict: "date" });
    if (err) { setError(err.message); load(); }
    else load();
  }

  return { data, loading, error, saveWakeTime, saveBedtime };
}
