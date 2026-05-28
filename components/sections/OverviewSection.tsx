"use client";

import { Flame, Moon, Brain, Zap, Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSteps } from "@/hooks/useSteps";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useFoodLog } from "@/hooks/useFoodLog";
import { useSleep } from "@/hooks/useSleep";
import { useLearning } from "@/hooks/useLearning";
import { useSupplements } from "@/hooks/useSupplements";
import {
  SupplementGroup,
  MORNING_SUPPLEMENTS,
  NIGHT_SUPPLEMENTS,
} from "@/components/sections/HealthSection";

// Shared bento cell: white card with subtle border + 14px padding.
const CELL =
  "rounded-lg border-[0.5px] border-[color:var(--color-border-tertiary)] bg-[color:var(--color-background-primary)] p-[14px]";

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
    <div className="space-y-2">
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
    </div>
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
    <div className="space-y-2">
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
    </div>
  );
}

export default function OverviewSection({ date }: { date: string }) {
  const { data: stepData }                              = useSteps(date);
  const { data: workoutsData }                          = useWorkouts(date);
  const { data: foodData }                              = useFoodLog(date);
  const { data: sleepData }                             = useSleep(date);
  const { data: learningData }                          = useLearning(date);
  const { checked: supplementsChecked, toggle: toggleSupplement } = useSupplements(date);

  const steps            = stepData?.count ?? 0;
  const caloriesConsumed = foodData.reduce((sum, e) => sum + (e.calories ?? 0), 0);
  const totalProtein     = foodData.reduce((sum, e) => sum + (e.protein_g ?? 0), 0);
  const totalCarbs       = foodData.reduce((sum, e) => sum + (e.carbs_g ?? 0), 0);
  const sleepHours       = sleepData?.total_hours ?? null;
  const learningMinutes  = learningData.reduce((sum, s) => sum + s.minutes, 0);
  const caloriesBurned   = workoutsData.reduce(
    (sum, w) => sum + (w.sets ?? 1) * (w.reps ?? 1) * (w.weight_lbs ?? 0) * 0.05,
    0
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-min gap-[10px]">
      {/* Steps — span 2 */}
      <div className={`${CELL} col-span-2`}>
        <FootstepTrail steps={steps} goal={12000} />
      </div>

      {/* Sleep — span 1 */}
      <div className={`${CELL} col-span-1`}>
        <SleepCard hours={sleepHours} goal={8} />
      </div>

      {/* Study — span 1 */}
      <div className={`${CELL} col-span-1`}>
        <LearningCard minutes={learningMinutes} goal={120} />
      </div>

      {/* Macros — span 2 */}
      <div className={`${CELL} col-span-2`}>
        <MacroBar calories={caloriesConsumed} protein={totalProtein} carbs={totalCarbs} />
      </div>

      {/* Calorie Balance — span 2 */}
      <div className={`${CELL} col-span-2`}>
        <BalanceScale consumed={caloriesConsumed} burned={caloriesBurned} />
      </div>

      {/* Workout Summary — span 2 cols, 2 rows */}
      <div className={`${CELL} col-span-2 md:row-span-2`}>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Workout Summary
        </p>
        {workoutsData.length > 0 ? (
          <ul className="space-y-2">
            {workoutsData.map((w) => (
              <li key={w.id} className="flex flex-wrap items-center gap-1.5 text-sm">
                <span className="font-medium">{w.exercise}</span>
                {w.sets != null && <Badge variant="outline">{w.sets} sets</Badge>}
                {w.reps != null && <Badge variant="outline">{w.reps} reps</Badge>}
                {w.weight_lbs != null && <Badge variant="secondary">{w.weight_lbs} lbs</Badge>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No sets logged yet today.</p>
        )}
      </div>

      {/* Supplements — span 2 */}
      <div className={`${CELL} col-span-2`}>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Supplements
        </p>
        <div className="space-y-3">
          <SupplementGroup
            title="Morning"
            Icon={Sun}
            items={MORNING_SUPPLEMENTS}
            checked={supplementsChecked}
            onToggle={toggleSupplement}
          />
          <div className="border-t" />
          <SupplementGroup
            title="Night"
            Icon={Moon}
            items={NIGHT_SUPPLEMENTS}
            checked={supplementsChecked}
            onToggle={toggleSupplement}
          />
        </div>
      </div>
    </div>
  );
}
