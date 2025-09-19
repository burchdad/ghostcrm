import { NextResponse } from "next/server";
import speakeasy from "speakeasy";

// In-memory user secrets (replace with DB in production)
const userSecrets: Record<string, string> = {};

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
  // Generate new TOTP secret
  const secret = speakeasy.generateSecret({ name: `GhostCRM (${email})` });
  userSecrets[email] = secret.base32;
  return NextResponse.json({ secret: secret.base32, otpauth_url: secret.otpauth_url });
}

export async function DELETE(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
  delete userSecrets[email];
  return NextResponse.json({ success: true });
}
