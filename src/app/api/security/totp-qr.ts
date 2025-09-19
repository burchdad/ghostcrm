import { NextResponse } from "next/server";
import speakeasy from "speakeasy";
import qrcode from "qrcode";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email") || "user@example.com";
  // In production, fetch or generate user-specific secret and store it securely
  const secret = speakeasy.generateSecret({ name: `GhostCRM (${email})` });
  const otpauth_url = secret.otpauth_url;
  const qr = await qrcode.toDataURL(otpauth_url);
  // Optionally, persist secret for user in DB here
  return new NextResponse(Buffer.from(qr.split(",")[1], "base64"), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store"
    }
  });
}
