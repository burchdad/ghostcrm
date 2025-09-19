import { NextResponse } from "next/server";
import { queryDb } from "@/db/mssql";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
  const users = await queryDb("SELECT * FROM users WHERE email = @param0", [email]);
  const user = users[0];
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  // Lock account for 30 minutes
  const until = new Date(Date.now() + 30 * 60 * 1000);
  await queryDb("UPDATE users SET lockout_until = @param0 WHERE id = @param1", [until, user.id]);
  return NextResponse.json({ success: true });
}

export async function PUT(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
  await queryDb("UPDATE users SET lockout_until = NULL, failed_attempts = 0 WHERE email = @param0", [email]);
  return NextResponse.json({ success: true });
}
