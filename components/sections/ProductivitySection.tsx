"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useSleep } from "@/hooks/useSleep";

export default function ProductivitySection({ date }: { date: string }) {
  const { data: sleepData, loading, error, saveWakeTime, saveBedtime } = useSleep(date);

  const [wakeupInput, setWakeupInput] = useState("");
  const [bedtimeInput, setBedtimeInput] = useState("");
  const [savingWakeup, setSavingWakeup] = useState(false);
  const [savingBedtime, setSavingBedtime] = useState(false);

  // localStorage fallback (commented out — previously used /api/logs with key=wakeup_time / bedtime)
  // const fetchData = useCallback(async () => {
  //   const res = await fetch(`/api/logs?date=${date}`);
  //   const logs = await res.json();
  //   setSavedWakeup(latestValue(logs, "wakeup_time"));
  //   setSavedBedtime(latestValue(logs, "bedtime"));
  // }, [date]);

  async function handleSaveWakeup() {
    if (!wakeupInput) return;
    setSavingWakeup(true);
    await saveWakeTime(wakeupInput);
    setWakeupInput("");
    setSavingWakeup(false);
  }

  async function handleSaveBedtime() {
    if (!bedtimeInput) return;
    setSavingBedtime(true);
    await saveBedtime(bedtimeInput);
    setBedtimeInput("");
    setSavingBedtime(false);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sleep Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {error && (
            <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* Wake up time */}
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <Label htmlFor="wakeup">Wake up time</Label>
                <Input
                  id="wakeup"
                  type="time"
                  value={wakeupInput}
                  onChange={(e) => setWakeupInput(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSaveWakeup}
                disabled={!wakeupInput || savingWakeup}
              >
                Save
              </Button>
            </div>
            {!loading && sleepData?.wake_time && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                Logged: <Badge variant="secondary">{sleepData.wake_time}</Badge>
              </div>
            )}
          </div>

          {/* Bedtime */}
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <Label htmlFor="bedtime">Bedtime</Label>
                <Input
                  id="bedtime"
                  type="time"
                  value={bedtimeInput}
                  onChange={(e) => setBedtimeInput(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSaveBedtime}
                disabled={!bedtimeInput || savingBedtime}
              >
                Save
              </Button>
            </div>
            {!loading && sleepData?.bedtime && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                Logged: <Badge variant="secondary">{sleepData.bedtime}</Badge>
              </div>
            )}
          </div>

          {/* Sleep total */}
          {!loading && sleepData?.total_hours != null && (
            <div className="flex items-center justify-between rounded-md bg-muted px-4 py-3">
              <span className="text-sm font-medium">Total sleep</span>
              <Badge variant="secondary" className="text-sm">
                {sleepData.total_hours} hrs
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
