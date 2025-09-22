import { NextResponse } from "next/server";
import { queryDb } from "@/db/mssql";

export async function GET(req: Request) {
  const { userId } = Object.fromEntries(new URL(req.url).searchParams);
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  const user = (await queryDb("SELECT * FROM users WHERE id = @param0", [userId]))[0];
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({
    email: user.email,
    totpEnabled: !!user.totp_secret,
    webauthnCredentials: user.webauthn_credentials ? JSON.parse(user.webauthn_credentials) : [],
  });
}

export async function PUT(req: Request) {
  const { userId, totpSecret, webauthnCredentials } = await req.json();
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  await queryDb(
    "UPDATE users SET totp_secret = @param0, webauthn_credentials = @param1 WHERE id = @param2",
    [totpSecret || null, JSON.stringify(webauthnCredentials || []), userId]
  );
  return NextResponse.json({ success: true });
}
