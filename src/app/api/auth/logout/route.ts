import { NextResponse } from "next/server";

export async function POST() {
  // CSRF origin check
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.NEXT_PUBLIC_DEPLOY_URL,
    "http://localhost:3000",
    "https://ghostcrm.com"
  ];
  const origin = (typeof Request !== "undefined" && Request.prototype.hasOwnProperty('headers')) ? (arguments[0]?.headers?.get("origin") || arguments[0]?.headers?.get("referer") || "") : "";
  if (!allowedOrigins.some(o => origin.startsWith(o))) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", "ghostcrm_jwt=; HttpOnly; Secure; Path=/; Max-Age=0; SameSite=Strict");
  return res;
}
