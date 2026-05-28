import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }
  const rows = db
    .prepare("SELECT * FROM food_log WHERE date = ? ORDER BY id")
    .all(date);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { date, meal, description, calories } = await req.json();
  if (!date || !description) {
    return NextResponse.json(
      { error: "date and description are required" },
      { status: 400 }
    );
  }
  const result = db
    .prepare(
      "INSERT INTO food_log (date, meal, description, calories) VALUES (?, ?, ?, ?)"
    )
    .run(date, meal ?? null, description, calories ?? null);
  return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
}
