import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }
  const rows = db
    .prepare("SELECT * FROM workouts WHERE date = ? ORDER BY id")
    .all(date);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { date, exercise, sets, reps, weight_lbs, notes } = await req.json();
  if (!date || !exercise) {
    return NextResponse.json(
      { error: "date and exercise are required" },
      { status: 400 }
    );
  }
  const result = db
    .prepare(
      "INSERT INTO workouts (date, exercise, sets, reps, weight_lbs, notes) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(
      date,
      exercise,
      sets ?? null,
      reps ?? null,
      weight_lbs ?? null,
      notes ?? null
    );
  return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
}
