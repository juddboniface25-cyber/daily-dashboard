"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHistory, type HistoryDay } from "@/hooks/useHistory";

interface ChartEntry extends HistoryDay {
  label: string;
}

function avg(values: (number | null)[]): number | null {
  const valid = values.filter((v): v is number => v != null);
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

const GRID_COLOR = "#e5e3de";
const TICK_COLOR = "#6b6b6b";
const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #d6dbde",
  borderRadius: "12px",
  color: "rgba(0,0,0,0.87)",
  fontSize: 12,
};
const AXIS_PROPS = {
  axisLine: false as const,
  tickLine: false as const,
  tick: { fontSize: 11, fill: TICK_COLOR },
};

function StepsChart({ data }: { data: ChartEntry[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Daily Steps
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
            <XAxis dataKey="label" interval={6} {...AXIS_PROPS} />
            <YAxis
              {...AXIS_PROPS}
              width={48}
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
              }
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(value) => [
                `${Number(value).toLocaleString()} steps`,
                "Steps",
              ]}
            />
            <Line
              type="monotone"
              dataKey="steps"
              stroke="#00754A"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function CaloriesChart({ data }: { data: ChartEntry[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Daily Calories
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
            <XAxis dataKey="label" interval={6} {...AXIS_PROPS} />
            <YAxis {...AXIS_PROPS} width={48} />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(value) => [
                `${Number(value).toLocaleString()} cal`,
                "Calories",
              ]}
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
            />
            <Bar
              dataKey="calories"
              fill="#006241"
              radius={[3, 3, 0, 0]}
              maxBarSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function LearningChart({ data }: { data: ChartEntry[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Daily Learning (min)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="learningGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00754A" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#00754A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
            <XAxis dataKey="label" interval={6} {...AXIS_PROPS} />
            <YAxis {...AXIS_PROPS} width={36} />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(value) => [`${value} min`, "Learning"]}
            />
            <Area
              type="monotone"
              dataKey="learning_minutes"
              stroke="#00754A"
              strokeWidth={2}
              fill="url(#learningGrad)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function StatCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{unit}</p>
      </CardContent>
    </Card>
  );
}

export default function HistoryPage() {
  const { data, loading } = useHistory(30);

  const chartData: ChartEntry[] = data.map((d) => ({
    ...d,
    label: format(parseISO(d.date), "M/d"),
  }));

  const avgSteps    = avg(data.map((d) => d.steps));
  const avgCalories = avg(data.map((d) => d.calories));
  const avgSleep    = avg(data.map((d) => d.sleep_hours));
  const avgLearning = avg(data.map((d) => d.learning_minutes));

  const fmt = (v: number | null, decimals = 0) =>
    v == null ? "—" : decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">

        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" aria-label="Back to dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold tracking-tight">30-Day History</h1>
        </div>

        {loading ? (
          <p className="py-24 text-center text-sm text-muted-foreground">
            Loading…
          </p>
        ) : (
          <>
            <div className="space-y-4">
              <StepsChart data={chartData} />
              <CaloriesChart data={chartData} />
              <LearningChart data={chartData} />
            </div>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                30-Day Averages
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Steps"    value={fmt(avgSteps)}       unit="per day" />
                <StatCard label="Calories" value={fmt(avgCalories)}    unit="per day" />
                <StatCard label="Sleep"    value={fmt(avgSleep, 1)}    unit="hrs / night" />
                <StatCard label="Learning" value={fmt(avgLearning)}    unit="min / day" />
              </div>
            </section>
          </>
        )}

      </div>
    </div>
  );
}
