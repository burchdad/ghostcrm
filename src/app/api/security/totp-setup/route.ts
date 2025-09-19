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
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const speakeasy = (await import("speakeasy")).default;
  const secret = speakeasy.generateSecret({ length: 20 });
  await queryDb("UPDATE users SET totp_temp_secret=@param0 WHERE email=@param1", [secret.base32, email]);
  const otpauth = `otpauth://totp/GhostCRM:${encodeURIComponent(email)}?secret=${secret.base32}&issuer=GhostCRM`;
  return NextResponse.json({ otpauth });
}
