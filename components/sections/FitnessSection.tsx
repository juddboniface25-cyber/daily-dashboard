"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useSteps } from "@/hooks/useSteps";
import { useWorkouts } from "@/hooks/useWorkouts";

export default function FitnessSection({ date }: { date: string }) {
  const { data: stepData, loading: stepsLoading, error: stepsError, save: saveSteps } = useSteps(date);
  const { data: workouts, loading: workoutsLoading, error: workoutsError, add: addWorkout } = useWorkouts(date);

  const [steps, setSteps] = useState("");
  const [savingSteps, setSavingSteps] = useState(false);

  const [exercise, setExercise] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weightLbs, setWeightLbs] = useState("");
  const [savingWorkout, setSavingWorkout] = useState(false);

  async function handleSaveSteps() {
    if (!steps) return;
    setSavingSteps(true);
    await saveSteps(parseInt(steps, 10));
    setSteps("");
    setSavingSteps(false);
  }

  async function handleAddWorkout() {
    if (!exercise) return;
    setSavingWorkout(true);
    await addWorkout({
      date,
      exercise,
      sets: sets ? parseInt(sets, 10) : null,
      reps: reps ? parseInt(reps, 10) : null,
      weight_lbs: weightLbs ? parseFloat(weightLbs) : null,
    });
    setExercise("");
    setSets("");
    setReps("");
    setWeightLbs("");
    setSavingWorkout(false);
  }

  return (
    <div className="space-y-4">
      {/* Step Tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Step Tracker</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stepsError && (
            <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{stepsError}</p>
          )}
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label htmlFor="steps-input">Steps today</Label>
              <Input
                id="steps-input"
                type="number"
                min={0}
                placeholder="e.g. 8500"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveSteps()}
              />
            </div>
            <Button onClick={handleSaveSteps} disabled={!steps || savingSteps}>
              Save
            </Button>
          </div>

          {!stepsLoading && stepData && (
            <div className="border-t pt-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">
                  {stepData.count.toLocaleString()} steps logged
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workout Logger */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workout Logger</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {workoutsError && (
            <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{workoutsError}</p>
          )}
          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="exercise">Exercise</Label>
              <Input
                id="exercise"
                placeholder="e.g. Bench Press"
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label htmlFor="sets">Sets</Label>
                <Input
                  id="sets"
                  type="number"
                  min={0}
                  placeholder="3"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="reps">Reps</Label>
                <Input
                  id="reps"
                  type="number"
                  min={0}
                  placeholder="10"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="weight">Weight (lbs)</Label>
                <Input
                  id="weight"
                  type="number"
                  min={0}
                  placeholder="135"
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleAddWorkout}
            disabled={!exercise || savingWorkout}
            className="w-full"
          >
            Log Set
          </Button>

          {!workoutsLoading && workouts.length > 0 && (
            <ul className="space-y-2 border-t pt-3">
              {workouts.map((w) => (
                <li key={w.id} className="flex flex-wrap items-center gap-1.5 text-sm">
                  <span className="font-medium">{w.exercise}</span>
                  {w.sets != null && <Badge variant="outline">{w.sets} sets</Badge>}
                  {w.reps != null && <Badge variant="outline">{w.reps} reps</Badge>}
                  {w.weight_lbs != null && <Badge variant="secondary">{w.weight_lbs} lbs</Badge>}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
