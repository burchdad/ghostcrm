export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Get JWT secret with runtime validation
function getJWTSecret() {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET must be set");
  }
  return JWT_SECRET;
}

// simple in-memory limiter; replace with Redis if needed
const attempts: Record<string, { c: number; t: number }> = {};
const MAX = 5, WIN = 10 * 60 * 1000;

export async function POST(req: Request) {
  // CSRF origin check
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.NEXT_PUBLIC_DEPLOY_URL,
    "http://localhost:3000",
    "https://ghostcrm.com"
  ];
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";
  if (!allowedOrigins.some(o => origin.startsWith(o))) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  const { email, password, totp, rememberMe } = await req.json();
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "unknown";
  const key = `${ip}:${email}`;
  const now = Date.now();
  const a = attempts[key];
  if (!a || now - a.t > WIN) attempts[key] = { c: 1, t: now };
  else { a.c++; a.t = now; if (a.c > MAX) return NextResponse.json({ error: "Too many attempts. Try later." }, { status: 429 }); }

  // Query user from Supabase
  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("id, email, password_hash, role, totp_secret")
    .eq("email", email)
    .single();
  if (!user || userError) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const valid = await compare(password, user.password_hash);
  if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  // If user has TOTP enabled, require it
  if (user.totp_secret) {
    if (!totp) return NextResponse.json({ error: "TOTP code required" }, { status: 401 });
    const speakeasy = (await import("speakeasy")).default;
    const ok = speakeasy.totp.verify({ secret: user.totp_secret, encoding: "base32", token: String(totp), window: 1 });
    if (!ok) return NextResponse.json({ error: "Invalid TOTP code" }, { status: 401 });
  }

  const orgId = process.env.DEFAULT_ORG_ID!; // TEMP until Supabase Auth
  const token = jwt.sign(
    { sub: String(user.id), email: user.email, role: user.role, org_id: orgId },
    getJWTSecret(),
    { expiresIn: rememberMe ? "30d" : "2h" }
  );
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 2 * 60 * 60; // 30 days or 2 hours in seconds
  const res = NextResponse.json({ user: { id: user.id, email: user.email, role: user.role, org_id: orgId } });
  res.headers.set("Set-Cookie", `ghostcrm_jwt=${token}; HttpOnly; Secure; Path=/; Max-Age=${maxAge}; SameSite=Strict`);
  // audit log
  const device = req.headers.get("user-agent") || "";
  await supabaseAdmin.from("audit_events").insert({
    org_id: orgId,
    actor_id: user.id,
    entity: "user",
    entity_id: user.id,
    action: "login",
    diff: { email },
    meta: { ip, device }
  });
  return res;
}
