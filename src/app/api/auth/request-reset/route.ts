export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { hash } from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
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

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id, email")
    .eq("email", email)
    .single();
  if (!user) return NextResponse.json({ success: true }); // do not leak account existence

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  await supabaseAdmin
    .from("password_resets")
    .insert({ email, token_hash: tokenHash, expires_at: expiresAt });

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
  const { data: row } = await supabaseAdmin
    .from("password_resets")
    .select("email, expires_at")
    .eq("email", email)
    .eq("token_hash", tokenHash)
    .single();
  if (!row || new Date(row.expires_at) < new Date()) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const passwordHash = await hash(newPassword, 10);
  await supabaseAdmin
    .from("users")
    .update({ password_hash: passwordHash })
    .eq("email", email);
  await supabaseAdmin
    .from("password_resets")
    .delete()
    .eq("email", email);

  return NextResponse.json({ success: true });
}
