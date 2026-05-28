import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { format, subDays } from "date-fns";

interface DayEntry {
  date: string;
  steps: number | null;
  calories: number | null;
  workouts: number;
  sleep_hours: number | null;
  learning_minutes: number | null;
  calories_burned: number;
}

function parseTimeMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

function sleepHours(bedtime: string, wakeup: string): number {
  const bed = parseTimeMinutes(bedtime);
  const wake = parseTimeMinutes(wakeup);
  // wakeup earlier than bedtime means they crossed midnight
  const minutes = wake < bed ? 24 * 60 - bed + wake : wake - bed;
  return Math.round((minutes / 60) * 10) / 10;
}

export function GET(req: NextRequest) {
  const daysParam = req.nextUrl.searchParams.get("days");
  const days = Math.min(Math.max(parseInt(daysParam ?? "30", 10) || 30, 1), 365);

  const today = new Date();
  const startDate = format(subDays(today, days - 1), "yyyy-MM-dd");

  // Seed every date slot so gaps still appear in charts
  const result: Record<string, DayEntry> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = format(subDays(today, i), "yyyy-MM-dd");
    result[d] = { date: d, steps: null, calories: null, workouts: 0, sleep_hours: null, learning_minutes: null, calories_burned: 0 };
  }

  // Steps (one row per date — latest value wins if multiple exist)
  for (const row of db
    .prepare("SELECT date, CAST(value AS REAL) as v FROM logs WHERE key = 'steps' AND date >= ?")
    .all(startDate) as { date: string; v: number }[]) {
    if (result[row.date]) result[row.date].steps = row.v;
  }

  // Calories from food_log
  for (const row of db
    .prepare("SELECT date, SUM(calories) as v FROM food_log WHERE date >= ? GROUP BY date")
    .all(startDate) as { date: string; v: number }[]) {
    if (result[row.date]) result[row.date].calories = row.v;
  }

  // Workout set count
  for (const row of db
    .prepare("SELECT date, COUNT(*) as v FROM workouts WHERE date >= ? GROUP BY date")
    .all(startDate) as { date: string; v: number }[]) {
    if (result[row.date]) result[row.date].workouts = row.v;
  }

  // Learning minutes (sum of all sessions per day)
  for (const row of db
    .prepare("SELECT date, SUM(CAST(value AS REAL)) as v FROM logs WHERE key = 'learning_minutes' AND date >= ? GROUP BY date")
    .all(startDate) as { date: string; v: number }[]) {
    if (result[row.date]) result[row.date].learning_minutes = row.v;
  }

  // Calories burned from workouts (sets × reps × weight_lbs × 0.05)
  for (const row of db
    .prepare(
      "SELECT date, SUM(COALESCE(sets,1) * COALESCE(reps,1) * COALESCE(weight_lbs,0) * 0.05) as v FROM workouts WHERE date >= ? GROUP BY date"
    )
    .all(startDate) as { date: string; v: number }[]) {
    if (result[row.date]) result[row.date].calories_burned = row.v;
  }

  // Sleep hours — derived from wakeup_time + bedtime logs
  const wakeupByDate: Record<string, string> = {};
  const bedtimeByDate: Record<string, string> = {};
  for (const row of db
    .prepare("SELECT date, value FROM logs WHERE key = 'wakeup_time' AND date >= ?")
    .all(startDate) as { date: string; value: string }[]) {
    wakeupByDate[row.date] = row.value;
  }
  for (const row of db
    .prepare("SELECT date, value FROM logs WHERE key = 'bedtime' AND date >= ?")
    .all(startDate) as { date: string; value: string }[]) {
    bedtimeByDate[row.date] = row.value;
  }
  for (const date of Object.keys(result)) {
    const w = wakeupByDate[date];
    const b = bedtimeByDate[date];
    if (w && b) result[date].sleep_hours = sleepHours(b, w);
  }

  return NextResponse.json(Object.values(result));
}
