import { NextResponse } from "next/server";
import { queryDb } from "@/db/mssql";


export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  const { email, token } = await req.json();
  if (!email || !token) return NextResponse.json({ error: "Email and token required" }, { status: 400 });

  const row = (await queryDb("SELECT TOP 1 totp_temp_secret FROM users WHERE email=@param0", [email]))?.[0];
  const temp = row?.totp_temp_secret;
  if (!temp) return NextResponse.json({ error: "No TOTP enrollment in progress" }, { status: 404 });

  const speakeasy = (await import("speakeasy")).default;
  const ok = speakeasy.totp.verify({ secret: temp, encoding: "base32", token: String(token), window: 1 });
  if (!ok) return NextResponse.json({ error: "Invalid TOTP code" }, { status: 400 });

  await queryDb("UPDATE users SET totp_secret=@param0, totp_temp_secret=NULL WHERE email=@param1", [temp, email]);
  return NextResponse.json({ success: true });
}

