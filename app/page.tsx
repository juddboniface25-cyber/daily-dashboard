"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Dumbbell, Heart, BrainCircuit, BookOpen, BarChart2, LayoutDashboard } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import DateNav from "@/components/DateNav";
import FitnessSection from "@/components/sections/FitnessSection";
import HealthSection from "@/components/sections/HealthSection";
import ProductivitySection from "@/components/sections/ProductivitySection";
import LearningSection from "@/components/sections/LearningSection";
import OverviewSection from "@/components/sections/OverviewSection";
import { useHistory, type HistoryDay } from "@/hooks/useHistory";

interface Streaks {
  fitness: number;
  health: number;
  productivity: number;
  learning: number;
}

function calcStreak(
  days: HistoryDay[],
  hasActivity: (d: HistoryDay) => boolean
): number {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  let streak = 0;
  let skippedToday = false;

  for (let i = days.length - 1; i >= 0; i--) {
    const day = days[i];
    if (!skippedToday && day.date === todayStr && !hasActivity(day)) {
      skippedToday = true;
      continue;
    }
    if (hasActivity(day)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

const TABS = [
  { value: "fitness",      label: "Fitness",      Icon: Dumbbell,    streakKey: "fitness"      as const },
  { value: "health",       label: "Health",       Icon: Heart,        streakKey: "health"       as const },
  { value: "productivity", label: "Productivity", Icon: BrainCircuit, streakKey: "productivity" as const },
  { value: "learning",     label: "Learning",     Icon: BookOpen,     streakKey: "learning"     as const },
] as const;

export default function Home() {
  const today = format(new Date(), "yyyy-MM-dd");
  const [date, setDate] = useState(today);
  const [overviewTick, setOverviewTick] = useState(0);
  const [streaks, setStreaks] = useState<Streaks>({
    fitness: 0, health: 0, productivity: 0, learning: 0,
  });

  // localStorage fallback for streaks (commented out — previously fetched from /api/history)
  // useEffect(() => {
  //   fetch("/api/history?days=60")
  //     .then((r) => r.json())
  //     .then((days) => {
  //       setStreaks({
  //         fitness:      calcStreak(days, (d) => d.steps != null || d.workouts > 0),
  //         health:       calcStreak(days, (d) => d.calories != null),
  //         productivity: calcStreak(days, (d) => d.sleep_hours != null),
  //         learning:     calcStreak(days, (d) => d.learning_minutes != null),
  //       });
  //     });
  // }, []);

  const { data: historyDays } = useHistory(60);

  useEffect(() => {
    if (historyDays.length === 0) return;
    setStreaks({
      fitness:      calcStreak(historyDays, (d) => d.steps != null || d.workouts > 0),
      health:       calcStreak(historyDays, (d) => d.calories != null),
      productivity: calcStreak(historyDays, (d) => d.sleep_hours != null),
      learning:     calcStreak(historyDays, (d) => d.learning_minutes != null),
    });
  }, [historyDays]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-[#006241]">
              Daily Dashboard
            </h1>
            <Link
              href="/history"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <BarChart2 className="h-3.5 w-3.5" />
              History
            </Link>
          </div>
          <DateNav date={date} onDateChange={setDate} />
        </div>

        {/* Main tabs */}
        <Tabs
          defaultValue="overview"
          onValueChange={(v) => { if (v === "overview") setOverviewTick((t) => t + 1); }}
        >
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="overview" className="flex items-center justify-center gap-1.5 py-2">
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline text-xs font-medium">Overview</span>
            </TabsTrigger>
            {TABS.map(({ value, label, Icon, streakKey }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex items-center justify-center gap-1.5 py-2"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline text-xs font-medium">
                  {label}
                </span>
                {streaks[streakKey] > 0 && (
                  <Badge
                    variant="secondary"
                    className="h-5 min-w-[1.25rem] px-1 text-xs leading-none"
                  >
                    {streaks[streakKey]}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-4">
            <TabsContent value="overview" className="m-0">
              <OverviewSection date={date} key={`overview-${date}-${overviewTick}`} />
            </TabsContent>
            <TabsContent value="fitness" className="m-0">
              <FitnessSection date={date} />
            </TabsContent>
            <TabsContent value="health" className="m-0">
              <HealthSection date={date} />
            </TabsContent>
            <TabsContent value="productivity" className="m-0">
              <ProductivitySection date={date} />
            </TabsContent>
            <TabsContent value="learning" className="m-0">
              <LearningSection date={date} />
            </TabsContent>
          </div>
        </Tabs>

      </div>
    </div>
  );
}
