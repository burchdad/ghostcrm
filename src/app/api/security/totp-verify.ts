import { NextResponse } from "next/server";
import speakeasy from "speakeasy";

// In-memory user secrets (replace with DB in production)
const userSecrets: Record<string, string> = {};

export async function POST(req: Request) {
  const { email, token } = await req.json();
  if (!email || !token) return NextResponse.json({ error: "Email and token required" }, { status: 400 });
  const secret = userSecrets[email];
  if (!secret) return NextResponse.json({ error: "No TOTP secret found for user" }, { status: 404 });
  const verified = speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1,
  });
  if (!verified) return NextResponse.json({ error: "Invalid TOTP code" }, { status: 401 });
  return NextResponse.json({ success: true });
}
