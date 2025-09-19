import { NextResponse } from "next/server";
import crypto from "crypto";
import { queryDb } from "@/db/mssql";

// In-memory store for demo; use DB in production
const resetTokens: Record<string, { token: string; expires: number }> = {};

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
  const users = await queryDb("SELECT * FROM users WHERE email = @param0", [email]);
  const user = users[0];
  if (!user) return NextResponse.json({ error: "No account found for this email." }, { status: 404 });
  // Generate secure token
  const token = crypto.randomBytes(32).toString("hex");
  const expires = Date.now() + 1000 * 60 * 30; // 30 min expiry
  resetTokens[email] = { token, expires };
  // TODO: Send email with reset link (e.g., /reset-password?token=...)
  // For demo, just return success
  return NextResponse.json({ success: true });
}

export async function PUT(req: Request) {
  const { email, token, newPassword } = await req.json();
  if (!email || !token || !newPassword) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const entry = resetTokens[email];
  if (!entry || entry.token !== token || entry.expires < Date.now()) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }
  // Update password
  await queryDb("UPDATE users SET password_hash = @param0 WHERE email = @param1", [newPassword, email]);
  delete resetTokens[email];
  return NextResponse.json({ success: true });
}
