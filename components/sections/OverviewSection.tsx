"use client";

import { format } from "date-fns";
import { Flame, Moon, Brain, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, ResponsiveContainer } from "recharts";
import { useSteps } from "@/hooks/useSteps";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useFoodLog } from "@/hooks/useFoodLog";
import { useSleep } from "@/hooks/useSleep";
import { useLearning } from "@/hooks/useLearning";
import { useSupplements } from "@/hooks/useSupplements";
import { useHistory } from "@/hooks/useHistory";

function FootIcon({
  filled,
  atGoal,
  delay,
  isLeft,
}: {
  filled: boolean;
  atGoal: boolean;
  delay: number;
  isLeft: boolean;
}) {
  const fill = atGoal && filled ? "#4ade80" : filled ? "#60a5fa" : "#1e293b";
  return (
    <svg
      viewBox="0 0 20 32"
      style={{
        width: 22,
        height: 34,
        fill,
        transform: isLeft ? "scaleX(1)" : "scaleX(-1)",
        transition: "fill 0.5s",
        transitionDelay: `${delay}ms`,
        flexShrink: 0,
      }}
    >
      <ellipse cx="10" cy="24" rx="7" ry="8" />
      <circle cx="4" cy="14" r="2.5" />
      <circle cx="8" cy="10" r="2" />
      <circle cx="13" cy="9" r="2" />
      <circle cx="17" cy="12" r="1.8" />
    </svg>
  );
}

function FootstepTrail({ steps, goal = 12000 }: { steps: number; goal?: number }) {
  const totalFeet = 12;
  const stepsPerFoot = goal / totalFeet;
  const filledCount = Math.min(Math.floor(steps / stepsPerFoot), totalFeet);
  const atGoal = steps >= goal;

  const row1 = [0, 1, 2, 3, 4, 5];
  const row2 = [11, 10, 9, 8, 7, 6]; // right-to-left for winding trail

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Steps Today
        </p>
        <p className={`text-sm font-bold ${atGoal ? "text-green-400" : ""}`}>
          {steps.toLocaleString()} / {goal.toLocaleString()}
        </p>
      </div>
      <div className="space-y-2 py-1">
        <div className="flex justify-around items-end">
          {row1.map((i) => (
            <FootIcon key={i} filled={i < filledCount} atGoal={atGoal} delay={i * 60} isLeft={i % 2 === 0} />
          ))}
        </div>
        <div className="flex justify-around items-end">
          {row2.map((i) => (
            <FootIcon key={i} filled={i < filledCount} atGoal={atGoal} delay={i * 60} isLeft={i % 2 === 1} />
          ))}
        </div>
      </div>
      {atGoal ? (
        <p className="text-center text-xs font-semibold text-green-400">Goal reached!</p>
      ) : (
        <p className="text-center text-[11px] text-muted-foreground">
          {Math.max(0, goal - steps).toLocaleString()} steps to go
        </p>
      )}
    </div>
  );
}

function MacroBar({
  calories,
  protein,
  carbs,
}: {
  calories: number;
  protein: number;
  carbs: number;
}) {
  const bars = [
    {
      label: "Calories",
      value: calories,
      goal: 2500,
      unit: "kcal",
      normal: "bg-orange-500",
      over: "bg-red-500",
      textNormal: "text-orange-400",
      textOver: "text-red-400",
    },
    {
      label: "Protein",
      value: protein,
      goal: 180,
      unit: "g",
      normal: "bg-blue-500",
      over: "bg-red-500",
      textNormal: "text-blue-400",
      textOver: "text-red-400",
    },
    {
      label: "Carbs",
      value: carbs,
      goal: 250,
      unit: "g",
      normal: "bg-green-500",
      over: "bg-red-500",
      textNormal: "text-green-400",
      textOver: "text-red-400",
    },
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Nutrition
      </p>
      {bars.map(({ label, value, goal, unit, normal, over, textNormal, textOver }) => {
        const pct = Math.min((value / goal) * 100, 100);
        const exceeded = value > goal;
        return (
          <div key={label} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{label}</span>
              <span className={exceeded ? textOver : textNormal}>
                {value.toLocaleString()} / {goal.toLocaleString()} {unit}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${exceeded ? over : normal}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BalanceScale({ consumed, burned }: { consumed: number; burned: number }) {
  const net = consumed - burned;
  const tilt = Math.max(-20, Math.min(20, (net / 2000) * 20));
  const isDeficit = net < -50;
  const isSurplus = net > 50;
  const netColor = isDeficit ? "text-green-400" : isSurplus ? "text-amber-400" : "text-blue-400";
  const netLabel = isDeficit
    ? `${Math.abs(Math.round(net)).toLocaleString()} cal deficit`
    : isSurplus
    ? `${Math.round(net).toLocaleString()} cal surplus`
    : "Balanced";

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Energy Balance
      </p>
      <div className="flex items-end justify-center py-3 relative" style={{ height: 80 }}>
        {/* Pivot post */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-6 bg-muted-foreground/30 rounded-full z-10" />
        {/* Beam */}
        <div
          className="relative flex items-center w-full max-w-[220px] transition-transform duration-700 ease-in-out"
          style={{ transform: `rotate(${tilt}deg)`, transformOrigin: "50% 100%" }}
        >
          <div className="flex flex-col items-center gap-1">
            <Flame className="h-5 w-5 text-orange-400" />
            <span className="text-xs font-bold text-orange-400">{consumed.toLocaleString()}</span>
          </div>
          <div className="flex-1 h-px bg-muted-foreground/40 mx-2" />
          <div className="flex flex-col items-center gap-1">
            <Zap className="h-5 w-5 text-red-400" />
            <span className="text-xs font-bold text-red-400">{Math.round(burned).toLocaleString()}</span>
          </div>
        </div>
      </div>
      <p className={`text-center text-sm font-semibold ${netColor}`}>{netLabel}</p>
    </div>
  );
}

// Stars scattered around the moon at varied distances, each twinkling on its
// own staggered cycle so they never all pulse together.
const SLEEP_STARS = [
  { top: "4%", left: "18%", size: 9, delay: "0s" },
  { top: "12%", left: "78%", size: 7, delay: "0.4s" },
  { top: "40%", left: "90%", size: 6, delay: "0.8s" },
  { top: "72%", left: "10%", size: 8, delay: "1.2s" },
  { top: "82%", left: "70%", size: 6, delay: "1.6s" },
  { top: "30%", left: "2%", size: 7, delay: "2s" },
];

function SleepCard({
  hours,
  goal,
}: {
  hours: number | null;
  goal: number;
}) {
  const value = hours ?? 0;
  const progress = Math.min(goal > 0 ? (value / goal) * 100 : 0, 100);
  const goalMet = value >= goal;

  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        {/* Animated moon + twinkling stars */}
        <div className="relative h-14 w-full flex items-center justify-center">
          {SLEEP_STARS.map((s, i) => (
            <span
              key={i}
              className="absolute text-amber-400 select-none pointer-events-none leading-none"
              style={{
                top: s.top,
                left: s.left,
                fontSize: s.size,
                animation: "twinkle 2.4s ease-in-out infinite",
                animationDelay: s.delay,
              }}
            >
              ★
            </span>
          ))}
          <Moon
            className="h-7 w-7 text-indigo-600 relative z-10"
            style={
              goalMet
                ? { animation: "moon-glow 2.5s ease-in-out infinite" }
                : undefined
            }
          />
        </div>
        <div>
          <p className="text-xl font-bold leading-none">
            {hours !== null ? hours : "—"}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">hrs</p>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-1.5 rounded-full transition-all bg-indigo-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground">Goal: {goal} hrs</p>
      </CardContent>
    </Card>
  );
}

function LearningCard({
  minutes,
  goal,
}: {
  minutes: number;
  goal: number;
}) {
  const progress = Math.min(goal > 0 ? (minutes / goal) * 100 : 0, 100);

  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        {/* Animated brain + radiating glow rings */}
        <div className="relative h-14 w-full flex items-center justify-center">
          <span
            className="absolute h-10 w-10 rounded-full bg-green-500/40 pointer-events-none"
            style={{ animation: "brain-pulse 2s ease-out infinite" }}
          />
          <span
            className="absolute h-10 w-10 rounded-full bg-green-500/40 pointer-events-none"
            style={{ animation: "brain-pulse 2s ease-out infinite", animationDelay: "1s" }}
          />
          <Brain className="h-7 w-7 text-green-600 relative z-10" />
        </div>
        <div>
          <p className="text-xl font-bold leading-none">{minutes}</p>
          <p className="text-[11px] text-muted-foreground mt-1">min</p>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-1.5 rounded-full transition-all bg-green-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground">Goal: {goal} min</p>
      </CardContent>
    </Card>
  );
}

export default function OverviewSection({ date }: { date: string }) {
  const { data: stepData }              = useSteps(date);
  const { data: workoutsData }          = useWorkouts(date);
  const { data: foodData }              = useFoodLog(date);
  const { data: sleepData }             = useSleep(date);
  const { data: learningData }          = useLearning(date);
  const { checked: supplementsChecked } = useSupplements(date);
  const { data: history }               = useHistory(7);

  const steps            = stepData?.count ?? 0;
  const caloriesConsumed = foodData.reduce((sum, e) => sum + (e.calories ?? 0), 0);
  const totalProtein     = foodData.reduce((sum, e) => sum + (e.protein_g ?? 0), 0);
  const totalCarbs       = foodData.reduce((sum, e) => sum + (e.carbs_g ?? 0), 0);
  const sleepHours       = sleepData?.total_hours ?? null;
  const learningMinutes  = learningData.reduce((sum, s) => sum + s.minutes, 0);
  const workoutCount     = workoutsData.length;
  const foodEntryCount   = foodData.length;
  const caloriesBurned   = workoutsData.reduce(
    (sum, w) => sum + (w.sets ?? 1) * (w.reps ?? 1) * (w.weight_lbs ?? 0) * 0.05,
    0
  );
  const supplementsTaken = Object.values(supplementsChecked).filter(Boolean).length;
  const activeMinutes    = Math.round(steps / 100 + learningMinutes);

  const todayLabel = format(new Date(), "EEEE, MMMM d");

  const sparklines = [
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

      {/* Footstep Trail + Macro Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <FootstepTrail steps={steps} goal={12000} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <MacroBar calories={caloriesConsumed} protein={totalProtein} carbs={totalCarbs} />
          </CardContent>
        </Card>
      </div>

      {/* Balance Scale */}
      <Card>
        <CardContent className="p-4">
          <BalanceScale consumed={caloriesConsumed} burned={caloriesBurned} />
        </CardContent>
      </Card>

      {/* Sleep + Learning stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <SleepCard hours={sleepHours} goal={8} />
        <LearningCard minutes={learningMinutes} goal={120} />
      </div>

      {/* Sleep + Study sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
