import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }
  const rows = db
    .prepare("SELECT * FROM logs WHERE date = ? ORDER BY created_at")
    .all(date);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { date, category, key, value } = await req.json();
  if (!date || !category || !key || value === undefined) {
    return NextResponse.json(
      { error: "date, category, key, value are required" },
      { status: 400 }
    );
  }
  const result = db
    .prepare("INSERT INTO logs (date, category, key, value) VALUES (?, ?, ?, ?)")
    .run(date, category, key, String(value));
  return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
}
