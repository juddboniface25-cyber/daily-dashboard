"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useLearning } from "@/hooks/useLearning";

export default function LearningSection({ date }: { date: string }) {
  const { data: sessions, loading, error, add } = useLearning(date);

  const [topic, setTopic] = useState("");
  const [minutes, setMinutes] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveSession() {
    if (!minutes) return;
    setSaving(true);
    await add(parseInt(minutes, 10), topic.trim() || null);
    setTopic("");
    setMinutes("");
    setSaving(false);
  }

  const totalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Learning Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
          )}
          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="topic">Topic / Task</Label>
              <Input
                id="topic"
                placeholder="e.g. React hooks"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="minutes">Minutes</Label>
              <Input
                id="minutes"
                type="number"
                min={1}
                placeholder="e.g. 30"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveSession()}
              />
            </div>
          </div>

          <Button
            onClick={saveSession}
            disabled={!minutes || saving}
            className="w-full"
          >
            Log Session
          </Button>

          {!loading && sessions.length > 0 && (
            <div className="space-y-2 border-t pt-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className={session.topic ? "" : "italic text-muted-foreground"}>
                    {session.topic ?? "No topic"}
                  </span>
                  <Badge variant="secondary">{session.minutes} min</Badge>
                </div>
              ))}
              <div className="flex items-center justify-between border-t pt-3 font-semibold">
                <span className="text-sm">Total</span>
                <Badge>{totalMinutes} min</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
