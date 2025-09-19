import { NextResponse } from "next/server";
import crypto from "crypto";
import { hash } from "bcryptjs";
import { queryDb } from "@/db/mssql";
import sg from "@sendgrid/mail";

if (process.env.SENDGRID_API_KEY) sg.setApiKey(process.env.SENDGRID_API_KEY);

// Use DB-backed table `password_resets` (email, token_hash, expires_at)
export async function POST(req: Request) {
  // CSRF origin check
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.NEXT_PUBLIC_DEPLOY_URL,
    "http://localhost:3000",
    "https://ghostcrm.com"
  ];
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";
  if (!allowedOrigins.some(o => origin.startsWith(o))) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const users = await queryDb("SELECT TOP 1 id, email FROM users WHERE email = @param0", [email]);
  const user = users?.[0];
  if (!user) return NextResponse.json({ success: true }); // do not leak account existence

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  await queryDb(
    "INSERT INTO password_resets (email, token_hash, expires_at) VALUES (@param0,@param1,@param2)",
    [email, tokenHash, expiresAt]
  );

  const resetUrl = `${process.env.APP_BASE_URL || ""}/reset-password?email=${encodeURIComponent(email)}&token=${token}`;
  if (process.env.SENDGRID_API_KEY) {
    try {
      await sg.send({
        to: email,
        from: process.env.SENDGRID_FROM || "no-reply@ghostcrm.local",
        subject: "Reset your GhostCRM password",
        text: `Reset link (30 min): ${resetUrl}`,
      });
    } catch {}
  }

  return NextResponse.json({ success: true });
}

export async function PUT(req: Request) {
  const { email, token, newPassword } = await req.json();
  if (!email || !token || !newPassword) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const rows = await queryDb(
    "SELECT TOP 1 email, expires_at FROM password_resets WHERE email = @param0 AND token_hash = @param1",
    [email, tokenHash]
  );
  const row = rows?.[0];
  if (!row || new Date(row.expires_at) < new Date()) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const passwordHash = await hash(newPassword, 10);
  await queryDb("UPDATE users SET password_hash = @param0 WHERE email = @param1", [passwordHash, email]);
  await queryDb("DELETE FROM password_resets WHERE email = @param0", [email]);

  return NextResponse.json({ success: true });
}
