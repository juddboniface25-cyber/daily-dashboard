"use client";

import { useState, useEffect, useCallback } from "react";
import { format, subDays } from "date-fns";
import { supabase } from "@/lib/supabase";

export interface HistoryDay {
  date: string;
  steps: number | null;
  calories: number | null;
  workouts: number;
  sleep_hours: number | null;
  learning_minutes: number | null;
  calories_burned: number;
}

export function useHistory(days: number) {
  const [data, setData] = useState<HistoryDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const today = new Date();
    const startDate = format(subDays(today, days - 1), "yyyy-MM-dd");

    // Seed every date slot so gaps still appear in charts
    const result: Record<string, HistoryDay> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = format(subDays(today, i), "yyyy-MM-dd");
      result[d] = { date: d, steps: null, calories: null, workouts: 0, sleep_hours: null, learning_minutes: null, calories_burned: 0 };
    }

    const [stepsRes, foodRes, workoutsRes, sleepRes, learningRes] = await Promise.all([
      supabase.from("steps").select("date, count").gte("date", startDate),
      supabase.from("food_log").select("date, calories").gte("date", startDate),
      supabase.from("workouts").select("date, sets, reps, weight_lbs").gte("date", startDate),
      supabase.from("sleep").select("date, total_hours").gte("date", startDate),
      supabase.from("learning").select("date, minutes").gte("date", startDate),
    ]);

    const firstError = [stepsRes, foodRes, workoutsRes, sleepRes, learningRes].find((r) => r.error)?.error;
    if (firstError) { setError(firstError.message); setLoading(false); return; }

    for (const row of stepsRes.data ?? []) {
      if (result[row.date]) result[row.date].steps = row.count;
    }

    const calByDate: Record<string, number> = {};
    for (const row of foodRes.data ?? []) {
      calByDate[row.date] = (calByDate[row.date] ?? 0) + (row.calories ?? 0);
    }
    for (const [d, v] of Object.entries(calByDate)) {
      if (result[d]) result[d].calories = v || null;
    }

    for (const row of workoutsRes.data ?? []) {
      if (result[row.date]) {
        result[row.date].workouts++;
        result[row.date].calories_burned +=
          (row.sets ?? 1) * (row.reps ?? 1) * (row.weight_lbs ?? 0) * 0.05;
      }
    }

    for (const row of sleepRes.data ?? []) {
      if (result[row.date]) result[row.date].sleep_hours = row.total_hours;
    }

    const learnByDate: Record<string, number> = {};
    for (const row of learningRes.data ?? []) {
      learnByDate[row.date] = (learnByDate[row.date] ?? 0) + (row.minutes ?? 0);
    }
    for (const [d, v] of Object.entries(learnByDate)) {
      if (result[d]) result[d].learning_minutes = v || null;
    }

    setData(Object.values(result));
    setLoading(false);
  }, [days]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error };
}
