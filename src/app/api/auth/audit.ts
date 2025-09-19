import { NextResponse } from "next/server";
import { queryDb } from "@/db/mssql";

export async function POST(req: Request) {
  const { userId, eventType, eventDetails } = await req.json();
  if (!userId || !eventType) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  await queryDb("INSERT INTO audit_logs (user_id, event_type, event_details) VALUES (@param0, @param1, @param2)", [userId, eventType, JSON.stringify(eventDetails || {})]);
  return NextResponse.json({ success: true });
}

export async function GET(req: Request) {
  const { userId } = Object.fromEntries(new URL(req.url).searchParams);
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  const logs = await queryDb("SELECT * FROM audit_logs WHERE user_id = @param0 ORDER BY created_at DESC", [userId]);
  return NextResponse.json({ logs });
}
