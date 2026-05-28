import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }
  const rows = db
    .prepare("SELECT * FROM habits WHERE date = ? ORDER BY id")
    .all(date);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { date, habit, completed } = await req.json();
  if (!date || !habit || completed === undefined) {
    return NextResponse.json(
      { error: "date, habit, completed are required" },
      { status: 400 }
    );
  }

  const completedInt = completed ? 1 : 0;

  const upsert = db.transaction(() => {
    const existing = db
      .prepare("SELECT id FROM habits WHERE date = ? AND habit = ?")
      .get(date, habit) as { id: number } | undefined;
    if (existing) {
      db.prepare(
        "UPDATE habits SET completed = ? WHERE date = ? AND habit = ?"
      ).run(completedInt, date, habit);
      return existing.id;
    }
    const result = db
      .prepare("INSERT INTO habits (date, habit, completed) VALUES (?, ?, ?)")
      .run(date, habit, completedInt);
    return result.lastInsertRowid;
  });

  const id = upsert();
  return NextResponse.json({ id }, { status: 201 });
}
