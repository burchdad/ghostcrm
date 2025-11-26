export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { signJwtToken, hasJwtSecret } from "@/lib/jwt";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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
  ].filter(Boolean); // Remove undefined values
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";
  if (origin && !allowedOrigins.some(o => origin.startsWith(o))) {
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

  // Check JWT secret availability
  if (!hasJwtSecret()) {
    console.error("❌ [DB-LOGIN] JWT_SECRET not configured in environment");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  // Get tenant context from request headers (subdomain)
  const hostname = req.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];
  
  console.log('🏢 [DB-LOGIN] Hostname analysis:', {
    hostname,
    subdomain,
    isSubdomain: subdomain && subdomain !== 'localhost' && subdomain !== hostname,
    hostnameIncludesLocalhost: hostname.includes('localhost')
  });
  
  // Determine tenant/organization ID
  let tenantId = process.env.DEFAULT_ORG_ID || 'default-org'; // Default fallback
  let organizationId = process.env.DEFAULT_ORG_ID || 'default-org';
  
  // If we have a subdomain (not localhost), use it as tenant context
  // For burch-enterprises.localhost:3000, subdomain = 'burch-enterprises'
  if (subdomain && subdomain !== 'localhost' && subdomain !== hostname && hostname.includes('localhost')) {
    tenantId = subdomain;
    organizationId = subdomain;
    console.log('� [DB-LOGIN] Using subdomain as tenant context:', {
      hostname,
      subdomain,
      tenantId,
      organizationId
    });
  } else {
    console.log('🚨 [DB-LOGIN] No subdomain detected, using default org:', {
      hostname,
      subdomain,
      tenantId,
      organizationId
    });
  }

  const token = signJwtToken(
    { 
      userId: String(user.id), 
      email: user.email, 
      role: user.role, 
      organizationId: organizationId,
      tenantId: tenantId
    },
    rememberMe ? "30d" : "2h"
  );
  const isProd = process.env.NODE_ENV === "production";
  const res = NextResponse.json({ user: { id: user.id, email: user.email, role: user.role, org_id: organizationId } });
  
  // Build cookie options array
  const cookieOptions = [
    `ghostcrm_jwt=${token}`,
    "HttpOnly",
    isProd ? "Secure" : "", // Only secure in production
    "Path=/",
    "SameSite=Lax" // Changed from Strict to Lax for better redirect handling
  ].filter(Boolean);
  
  // Only add Max-Age if Remember Me is checked
  // Without Max-Age, cookie becomes a session cookie (expires on browser close)
  if (rememberMe) {
    cookieOptions.push(`Max-Age=${30 * 24 * 60 * 60}`); // 30 days
  }
  
  res.headers.set("Set-Cookie", cookieOptions.join("; "));
  // audit log
  const device = req.headers.get("user-agent") || "";
  await supabaseAdmin.from("audit_events").insert({
    org_id: organizationId,
    actor_id: user.id,
    entity: "user",
    entity_id: user.id,
    action: "login",
    diff: { email },
    meta: { ip, device }
  });
  return res;
}
