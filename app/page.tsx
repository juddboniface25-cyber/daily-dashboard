"use client";

import { useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { BarChart2 } from "lucide-react";
import DateNav from "@/components/DateNav";
import Sidebar, { type PageKey } from "@/components/Sidebar";
import FitnessSection from "@/components/sections/FitnessSection";
import HealthSection from "@/components/sections/HealthSection";
import ProductivitySection from "@/components/sections/ProductivitySection";
import LearningSection from "@/components/sections/LearningSection";
import OverviewSection from "@/components/sections/OverviewSection";
import { useWorkoutType } from "@/hooks/useWorkoutType";

const PAGE_TITLES: Record<Exclude<PageKey, "overview">, string> = {
  fitness: "Fitness",
  health: "Health",
  productivity: "Productivity",
  learning: "Learning",
};

export default function Home() {
  const today = format(new Date(), "yyyy-MM-dd");
  const [date, setDate] = useState(today);
  const [activePage, setActivePage] = useState<PageKey>("overview");

  const { type: workoutType } = useWorkoutType(date);

  const dateLabel = format(parseISO(date), "EEEE, MMMM d");

  return (
    <div className="flex h-screen overflow-hidden bg-[color:var(--color-background-tertiary)] text-foreground">
      <Sidebar activePage={activePage} onSelect={setActivePage} />

      <main className="flex-1 overflow-y-auto p-4 pb-20 md:pb-4">
        {/* Top bar */}
        <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[15px] font-medium leading-tight text-[#006241]">
              Good morning, Judd
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{dateLabel}</p>
          </div>
          <div className="flex items-center gap-3">
            {workoutType && (
              <span
                className="rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{ backgroundColor: "#EEF2FF", color: "#4F46E5" }}
              >
                {workoutType}
              </span>
            )}
            <DateNav date={date} onDateChange={setDate} />
            <Link
              href="/history"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <BarChart2 className="h-3.5 w-3.5" />
              History
            </Link>
          </div>
        </header>

        {/* Page body */}
        {activePage === "overview" ? (
          <OverviewSection date={date} key={`overview-${date}`} />
        ) : (
          <div className="mx-auto max-w-[800px]">
            <h2 className="mb-3 text-lg font-semibold">{PAGE_TITLES[activePage]}</h2>
            {activePage === "fitness" && <FitnessSection date={date} />}
            {activePage === "health" && <HealthSection date={date} />}
            {activePage === "productivity" && <ProductivitySection date={date} />}
            {activePage === "learning" && <LearningSection date={date} />}
          </div>
        )}
      </main>
    </div>
  );
}
