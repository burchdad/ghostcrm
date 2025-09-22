
import { NextRequest, NextResponse } from "next/server";
import qrcode from "qrcode";
import { supaFromReq } from "@/lib/supa-ssr";

export async function GET(req: NextRequest) {
  const { s } = supaFromReq(req);
  const user = (await s.auth.getUser()).data.user?.id;
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sec = (await s.from("user_security").select("totp_secret").eq("user_id", user).single()).data;
  if (!sec?.totp_secret) return NextResponse.json({ error: "no_secret" }, { status: 404 });

  const otpauth = `otpauth://totp/GhostCRM:${user}?secret=${sec.totp_secret}&issuer=GhostCRM`;
  const png = await qrcode.toDataURL(otpauth);
  const b64 = png.split(",")[1];
  return new NextResponse(Buffer.from(b64, "base64"), { status: 200, headers: { "Content-Type": "image/png" } });
}
