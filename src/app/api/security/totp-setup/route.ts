
import { NextRequest, NextResponse } from "next/server";
import { supaFromReq } from "@/lib/supa-ssr";

export async function POST(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const user = (await s.auth.getUser()).data.user?.id;
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const speakeasy = (await import("speakeasy")).default;
  const secret = speakeasy.generateSecret({ length: 20 });

  await s.from("user_security").upsert({ user_id: user, totp_secret: secret.base32 });
  const otpauth = `otpauth://totp/GhostCRM:${user}?secret=${secret.base32}&issuer=GhostCRM`;
  return NextResponse.json({ otpauth }, { headers: res.headers });
}
