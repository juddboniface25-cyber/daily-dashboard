"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Check, Sun, Moon } from "lucide-react";
import { useFoodLog } from "@/hooks/useFoodLog";
import { useSupplements } from "@/hooks/useSupplements";

const MEALS = ["breakfast", "lunch", "dinner", "snack"] as const;
type Meal = (typeof MEALS)[number];

export const MORNING_SUPPLEMENTS = ["Creatine", "K2 + D3", "Fish Oil", "Multivitamin"] as const;
export const NIGHT_SUPPLEMENTS   = ["Magnesium", "L-Theanine", "Ashwagandha"] as const;

export function SupplementGroup({
  title,
  Icon,
  items,
  checked,
  onToggle,
}: {
  title: string;
  Icon: React.ElementType;
  items: readonly string[];
  checked: Record<string, boolean>;
  onToggle: (name: string) => void;
}) {
  const takenCount = items.filter((s) => !!checked[s]).length;
  const allDone = takenCount === items.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </span>
        <div className="ml-auto flex items-center gap-2">
          {allDone ? (
            <span className="text-xs font-medium text-[#006241] flex items-center gap-1">
              <Check className="h-3 w-3" />
              All done
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              {takenCount} / {items.length}
            </span>
          )}
        </div>
      </div>

      <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-1 rounded-full transition-all duration-300 ${
            allDone ? "bg-[#00754A]" : "bg-primary"
          }`}
          style={{ width: `${(takenCount / items.length) * 100}%` }}
        />
      </div>

      <div className="space-y-0.5">
        {items.map((name) => (
          <label
            key={name}
            className="flex items-center gap-3 cursor-pointer px-2 py-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <input
              type="checkbox"
              checked={!!checked[name]}
              onChange={() => onToggle(name)}
              className="h-4 w-4 accent-[#00754A] cursor-pointer shrink-0"
            />
            <span
              className={`text-sm flex-1 transition-colors ${
                checked[name] ? "line-through text-muted-foreground" : "text-foreground"
              }`}
            >
              {name}
            </span>
            {checked[name] && (
              <Badge variant="secondary" className="text-xs shrink-0">
                taken
              </Badge>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function HealthSection({ date }: { date: string }) {
  const { data: entries, loading: foodLoading, error: foodError, add: addFood } = useFoodLog(date);
  const { checked, error: suppError, toggle: toggleSupplement } = useSupplements(date);

  // localStorage fallback (commented out — previously: localStorage.getItem(`supplements-${date}`))
  // useEffect(() => {
  //   const stored = localStorage.getItem(`supplements-${date}`);
  //   if (stored) { try { setChecked(JSON.parse(stored)); } catch { setChecked({}); } }
  //   else { setChecked({}); }
  // }, [date]);
  // function toggleSupplement(name: string) {
  //   const next = { ...checked, [name]: !checked[name] };
  //   setChecked(next);
  //   localStorage.setItem(`supplements-${date}`, JSON.stringify(next));
  // }

  const [meal, setMeal] = useState<Meal>("breakfast");
  const [description, setDescription] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveEntry() {
    if (!description) return;
    setSaving(true);
    await addFood({
      date,
      meal: meal ?? null,
      description,
      calories: calories ? parseInt(calories, 10) : null,
      protein_g: protein ? parseInt(protein, 10) : null,
      carbs_g: carbs ? parseInt(carbs, 10) : null,
    });
    setDescription("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setSaving(false);
  }

  const grouped = MEALS.reduce<Record<Meal, typeof entries>>(
    (acc, m) => ({ ...acc, [m]: entries.filter((e) => e.meal === m) }),
    { breakfast: [], lunch: [], dinner: [], snack: [] }
  );

  const totalCalories = entries.reduce((sum, e) => sum + (e.calories ?? 0), 0);
  const totalProtein  = entries.reduce((sum, e) => sum + (e.protein_g ?? 0), 0);
  const totalCarbs    = entries.reduce((sum, e) => sum + (e.carbs_g ?? 0), 0);
  const hasEntries = entries.length > 0;

  return (
    <div className="space-y-4">
      {/* Food Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Food Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {foodError && (
            <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{foodError}</p>
          )}
          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="meal-select">Meal</Label>
              <select
                id="meal-select"
                value={meal}
                onChange={(e) => setMeal(e.target.value as Meal)}
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 transition-colors"
              >
                {MEALS.map((m) => (
                  <option key={m} value={m}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="food-desc">Description</Label>
              <Input
                id="food-desc"
                placeholder="e.g. Chicken breast with rice"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveEntry()}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label htmlFor="food-cal">Calories</Label>
                <Input
                  id="food-cal"
                  type="number"
                  min={0}
                  placeholder="450"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="food-protein">Protein (g)</Label>
                <Input
                  id="food-protein"
                  type="number"
                  min={0}
                  placeholder="40"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="food-carbs">Carbs (g)</Label>
                <Input
                  id="food-carbs"
                  type="number"
                  min={0}
                  placeholder="50"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Button onClick={saveEntry} disabled={!description || saving} className="w-full">
            Add Entry
          </Button>

          {!foodLoading && hasEntries && (
            <div className="space-y-4 border-t pt-3">
              {MEALS.map((m) =>
                grouped[m].length === 0 ? null : (
                  <div key={m}>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {m}
                    </p>
                    <ul className="space-y-1">
                      {grouped[m].map((entry) => (
                        <li key={entry.id} className="flex items-center justify-between gap-2 text-sm">
                          <span className="flex-1 truncate">{entry.description}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            {entry.protein_g != null && entry.protein_g > 0 && (
                              <Badge variant="outline" className="text-[10px] px-1.5 text-blue-400 border-blue-800">{entry.protein_g}g P</Badge>
                            )}
                            {entry.carbs_g != null && entry.carbs_g > 0 && (
                              <Badge variant="outline" className="text-[10px] px-1.5 text-green-400 border-green-800">{entry.carbs_g}g C</Badge>
                            )}
                            {entry.calories != null && (
                              <Badge variant="secondary">{entry.calories} cal</Badge>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              )}
              <div className="flex items-center justify-between border-t pt-3 font-semibold gap-2">
                <span className="text-sm">Total</span>
                <div className="flex items-center gap-1.5">
                  {totalProtein > 0 && (
                    <Badge variant="outline" className="text-blue-400 border-blue-800">{totalProtein}g P</Badge>
                  )}
                  {totalCarbs > 0 && (
                    <Badge variant="outline" className="text-green-400 border-green-800">{totalCarbs}g C</Badge>
                  )}
                  <Badge>{totalCalories.toLocaleString()} cal</Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supplements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-[#006241]" />
            Supplements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {suppError && (
            <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{suppError}</p>
          )}
          <SupplementGroup
            title="Morning"
            Icon={Sun}
            items={MORNING_SUPPLEMENTS}
            checked={checked}
            onToggle={toggleSupplement}
          />
          <div className="border-t" />
          <SupplementGroup
            title="Night"
            Icon={Moon}
            items={NIGHT_SUPPLEMENTS}
            checked={checked}
            onToggle={toggleSupplement}
          />
        </CardContent>
      </Card>
    </div>
  );
}
