
import { NextRequest, NextResponse } from "next/server";
import { supaFromReq } from "@/lib/supa-ssr";

export async function POST(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const { code } = await req.json();
  const user = (await s.auth.getUser()).data.user?.id;
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const row = (await s.from("user_security").select("totp_secret").eq("user_id", user).single()).data;
  if (!row?.totp_secret) return NextResponse.json({ error: "no_setup" }, { status: 400 });

  const speakeasy = (await import("speakeasy")).default;
  const ok = speakeasy.totp.verify({ secret: row.totp_secret, encoding: "base32", token: String(code), window: 1 });
  if (!ok) return NextResponse.json({ error: "invalid_code" }, { status: 400 });

  return NextResponse.json({ success: true }, { headers: res.headers });
}

