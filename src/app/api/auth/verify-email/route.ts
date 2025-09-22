export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { queryDb } from "@/db/mssql";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
  const token = crypto.randomBytes(32).toString("hex");
  await queryDb("UPDATE users SET email_verification_token = @param0 WHERE email = @param1", [token, email]);
  // TODO: Send email with verification link (e.g., /verify-email?token=...)
  return NextResponse.json({ success: true });
}

export async function PUT(req: Request) {
  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });
  const users = await queryDb("SELECT * FROM users WHERE email_verification_token = @param0", [token]);
  const user = users[0];
  if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  await queryDb("UPDATE users SET email_verified = 1, email_verification_token = NULL WHERE id = @param0", [user.id]);
  return NextResponse.json({ success: true });
}
