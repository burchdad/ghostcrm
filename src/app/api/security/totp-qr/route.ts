import { NextResponse } from "next/server";
import qrcode from "qrcode";
import { queryDb } from "@/db/mssql";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  // Prefer the temp secret during setup; fall back to enabled secret
  const row = (await queryDb(
    "SELECT TOP 1 totp_temp_secret, totp_secret FROM users WHERE email=@param0",
    [email]
  ))?.[0];

  const secret = row?.totp_temp_secret || row?.totp_secret;
  if (!secret) return NextResponse.json({ error: "No TOTP secret available" }, { status: 404 });

  const otpauth = `otpauth://totp/GhostCRM:${encodeURIComponent(email)}?secret=${secret}&issuer=GhostCRM`;
  const png = await qrcode.toDataURL(otpauth); // data:image/png;base64,…
  const base64 = png.split(",")[1];
  return new NextResponse(Buffer.from(base64, "base64"), {
    status: 200,
    headers: { "Content-Type": "image/png", "Cache-Control": "no-store" },
  });
}
