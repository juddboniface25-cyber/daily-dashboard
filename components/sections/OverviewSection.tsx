"use client";

import { format } from "date-fns";
import { Footprints, Flame, Moon, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, ResponsiveContainer } from "recharts";
import { useSteps } from "@/hooks/useSteps";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useFoodLog } from "@/hooks/useFoodLog";
import { useSleep } from "@/hooks/useSleep";
import { useLearning } from "@/hooks/useLearning";
import { useSupplements } from "@/hooks/useSupplements";
import { useHistory } from "@/hooks/useHistory";

// localStorage fallback (commented out — previously read supplements from localStorage)
// useEffect(() => {
//   const stored = localStorage.getItem(`supplements-${date}`);
//   if (stored) {
//     try {
//       const parsed: Record<string, boolean> = JSON.parse(stored);
//       setSupplementsTaken(Object.values(parsed).filter(Boolean).length);
//     } catch { setSupplementsTaken(0); }
//   } else { setSupplementsTaken(0); }
// }, [date]);

export default function OverviewSection({ date }: { date: string }) {
  const { data: stepData }                = useSteps(date);
  const { data: workoutsData }            = useWorkouts(date);
  const { data: foodData }                = useFoodLog(date);
  const { data: sleepData }               = useSleep(date);
  const { data: learningData }            = useLearning(date);
  const { checked: supplementsChecked }   = useSupplements(date);
  const { data: history }                 = useHistory(7);

  // Derive all values from hook data
  const steps             = stepData?.count ?? 0;
  const caloriesConsumed  = foodData.reduce((sum, e) => sum + (e.calories ?? 0), 0);
  const sleepHours        = sleepData?.total_hours ?? null;
  const learningMinutes   = learningData.reduce((sum, s) => sum + s.minutes, 0);
  const workoutCount      = workoutsData.length;
  const foodEntryCount    = foodData.length;
  const caloriesBurned    = workoutsData.reduce(
    (sum, w) => sum + (w.sets ?? 1) * (w.reps ?? 1) * (w.weight_lbs ?? 0) * 0.05,
    0
  );
  const supplementsTaken  = Object.values(supplementsChecked).filter(Boolean).length;
  const activeMinutes     = Math.round(steps / 100 + learningMinutes);

  const todayLabel = format(new Date(), "EEEE, MMMM d");

  const statCards = [
    {
      label: "Steps", value: steps, displayValue: steps.toLocaleString(), unit: "steps",
      goal: 10000, Icon: Footprints,
      iconBg: "bg-blue-100", iconColor: "text-blue-600", barColor: "bg-blue-500",
    },
    {
      label: "Calories", value: caloriesConsumed, displayValue: caloriesConsumed.toLocaleString(), unit: "cal",
      goal: 2500, Icon: Flame,
      iconBg: "bg-orange-100", iconColor: "text-orange-600", barColor: "bg-orange-500",
    },
    {
      label: "Sleep", value: sleepHours ?? 0, displayValue: sleepHours !== null ? String(sleepHours) : "—", unit: "hrs",
      goal: 8, Icon: Moon,
      iconBg: "bg-indigo-100", iconColor: "text-indigo-600", barColor: "bg-indigo-500",
    },
    {
      label: "Learning", value: learningMinutes, displayValue: String(learningMinutes), unit: "min",
      goal: 120, Icon: BookOpen,
      iconBg: "bg-green-100", iconColor: "text-green-600", barColor: "bg-green-500",
    },
  ];

  const sparklines = [
    {
      label: "Calories Consumed",
      display: `${caloriesConsumed.toLocaleString()} cal`,
      color: "#f97316",
      data: history.map((d) => ({ v: d.calories ?? 0 })),
    },
    {
      label: "Calories Burned",
      display: `${Math.round(caloriesBurned)} cal`,
      color: "#ef4444",
      data: history.map((d) => ({ v: d.calories_burned ?? 0 })),
    },
    {
      label: "Sleep Duration",
      display: sleepHours !== null ? `${sleepHours} hrs` : "— hrs",
      color: "#6366f1",
      data: history.map((d) => ({ v: d.sleep_hours ?? 0 })),
    },
    {
      label: "Study Time",
      display: `${learningMinutes} min`,
      color: "#22c55e",
      data: history.map((d) => ({ v: d.learning_minutes ?? 0 })),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Profile card */}
      <Card className="overflow-hidden">
        <div className="bg-[#1E3932] px-5 py-4 flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="h-11 w-11 rounded-full bg-white/20 flex items-center justify-center font-bold text-white text-base select-none">
              JD
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#00754A] border-2 border-[#1E3932]" />
          </div>
          <div>
            <p className="font-semibold text-sm leading-none mb-1 text-white">My Dashboard</p>
            <p className="text-xs text-white/70">{todayLabel}</p>
          </div>
        </div>
      </Card>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Left: 2×2 stat cards */}
        <div className="grid grid-cols-2 gap-3">
          {statCards.map(({ label, displayValue, unit, value, goal, Icon, iconBg, iconColor, barColor }) => {
            const progress = Math.min(goal > 0 ? (value / goal) * 100 : 0, 100);
            return (
              <Card key={label}>
                <CardContent className="p-4 space-y-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold leading-none">{displayValue}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{unit}</p>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all ${barColor}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Goal: {goal.toLocaleString()} {unit}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Right: sparkline panels */}
        <div className="space-y-3">
          {sparklines.map(({ label, display, color, data }) => (
            <Card key={label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground">{label}</p>
                  <p className="text-sm font-bold">{display}</p>
                </div>
                <ResponsiveContainer width="100%" height={36}>
                  <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barCategoryGap="20%">
                    <Bar dataKey="v" fill={color} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom strip */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 text-center">
            <div className="px-3 sm:border-r border-border">
              <p className="text-2xl font-bold">{workoutCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Workouts</p>
            </div>
            <div className="px-3 sm:border-r border-border">
              <p className="text-2xl font-bold">{foodEntryCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Food Entries</p>
            </div>
            <div className="px-3 sm:border-r border-border">
              <p className="text-2xl font-bold">{activeMinutes}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Active Min</p>
            </div>
            <div className="px-3">
              <p className="text-2xl font-bold">
                {supplementsTaken}
                <span className="text-sm font-normal text-muted-foreground">/7</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Supplements</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
