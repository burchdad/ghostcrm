import { NextResponse } from "next/server";
import { queryDb } from "@/db/mssql";

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
  const { email, code } = await req.json();
  if (!email || !code) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const row = (await queryDb("SELECT TOP 1 totp_temp_secret FROM users WHERE email=@param0", [email]))?.[0];
  if (!row?.totp_temp_secret) return NextResponse.json({ error: "No TOTP setup in progress" }, { status: 400 });

  const speakeasy = (await import("speakeasy")).default;
  const ok = speakeasy.totp.verify({ secret: row.totp_temp_secret, encoding: "base32", token: String(code), window: 1 });
  if (!ok) return NextResponse.json({ error: "Invalid code" }, { status: 400 });

  await queryDb("UPDATE users SET totp_secret=@param0, totp_temp_secret=NULL WHERE email=@param1", [row.totp_temp_secret, email]);
  return NextResponse.json({ success: true });
}
