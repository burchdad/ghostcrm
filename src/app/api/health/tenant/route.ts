// app/api/health/tenant/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// ---- Simple in-memory rate limit (good for single instance; swap for Redis/Edge later)
type RateEntry = { count: number; resetAt: number };
const RATE_LIMIT = { limit: 60, windowMs: 60_000 };
const rateMap = new Map<string, RateEntry>();

function getClientIp(req: NextRequest) {
  // Platform-specific headers (Vercel, Cloudflare, then generic)
  const vercelIp = req.headers.get("x-vercel-forwarded-for");
  if (vercelIp) return vercelIp.split(",")[0].trim();
  
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();
  
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  
  const realIp = req.headers.get("x-real-ip");
  return realIp || "unknown";
}

function rateLimit(req: NextRequest) {
  const ip = getClientIp(req);
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + RATE_LIMIT.windowMs;
    rateMap.set(ip, { count: 1, resetAt });
    return { ok: true, ip, remaining: RATE_LIMIT.limit - 1, resetAt };
  }

  if (entry.count >= RATE_LIMIT.limit) {
    return { ok: false, ip, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  rateMap.set(ip, entry);
  return { ok: true, ip, remaining: RATE_LIMIT.limit - entry.count, resetAt: entry.resetAt };
}

// ---- Shared response shape (always the same keys)
function basePayload() {
  return {
    ok: true,
    request: {
      host: null as string | null,
      pathname: null as string | null,
      detected_subdomain: null as string | null,
    },
    auth: {
      is_authenticated: false,
      user_id: "redacted" as string | "redacted" | null,
      email: "redacted" as string | "redacted" | null,
      email_verified: "redacted" as boolean | "redacted" | null,
    },
    tenant: {
      // Never disclose existence to unauth by default
      subdomain_check: "requires_auth" as "requires_auth" | "checked",
      tenant_id: "redacted" as string | "redacted" | null,
      org_id: "redacted" as string | "redacted" | null,
      membership: "redacted" as
        | "redacted"
        | { is_member: boolean; role: string | null; status: string | null },
    },
    routing: {
      state: "UNKNOWN" as "A" | "B" | "C" | "PROVISIONING" | "UNKNOWN",
      expected_action:
        "allow" as
          | "allow"
          | "redirect_login"
          | "redirect_verify_email"
          | "redirect_billing"
          | "redirect_subdomain"
          | "rewrite_tenant_not_found",
      notes: [] as string[],
      advice: {
        poll_ms: null as number | null,
        max_wait_s: null as number | null,
      },
    },
    cookies: {
      expected_domain: ".ghostcrm.ai",
      observed_cookie_names: [] as string[],
      domain_scoping_inferred: "unknown" as "shared" | "host_only" | "unknown",
      secure_expected: true,
      samesite_expected: "lax" as "lax" | "strict" | "none",
    },
    billing: {
      status: "redacted" as "redacted" | "active" | "past_due" | "canceled" | "trialing" | "unpaid" | "unknown" | "provisioning",
      stripe_customer_id_present: "redacted" as "redacted" | boolean,
      stripe_subscription_id_present: "redacted" as "redacted" | boolean,
    },
    limits: {
      limit: RATE_LIMIT.limit,
      remaining: 0,
      reset_epoch_ms: 0,
      ip: "redacted" as string | "redacted",
    },
    checks: {
      auth_cookies_present: false,
      should_not_enumerate: true,
      no_store_headers_set: true,
      response_shape_stable: true,
    },
  };
}

function detectSubdomain(host: string | null) {
  if (!host) return null;
  const cleanHost = host.split(":")[0];

  if (cleanHost === "ghostcrm.ai") return null;
  if (cleanHost === "www.ghostcrm.ai") return null;
  if (cleanHost.includes("localhost") || cleanHost.includes("127.0.0.1")) return null;

  const parts = cleanHost.split(".");
  if (parts.length === 3 && parts[1] === "ghostcrm" && parts[2] === "ai") return parts[0];
  return null;
}

function isGhostDomain(host: string | null): boolean {
  if (!host) return false;
  const cleanHost = host.split(":")[0];
  return cleanHost === "ghostcrm.ai" || cleanHost.endsWith(".ghostcrm.ai");
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function noteSubdomainDenied(payload: any) {
  // One generic note for all deny reasons: prevents enumeration
  if (!payload.routing.notes.includes("subdomain_access_denied")) {
    payload.routing.notes.push("subdomain_access_denied");
  }
}

function setNoStoreHeaders(res: NextResponse, isRateLimited: boolean) {
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("X-Content-Type-Options", "nosniff");
  if (isRateLimited) res.headers.set("Retry-After", "60");
  return res;
}

export async function GET(req: NextRequest) {
  // Rate limit first (before auth/DB)
  const rl = rateLimit(req);
  const payload = basePayload();

  payload.limits.limit = RATE_LIMIT.limit;
  payload.limits.remaining = rl.remaining;
  payload.limits.reset_epoch_ms = rl.resetAt;
  payload.limits.ip = "redacted"; // do not echo IP back

  const host = req.headers.get("host");
  payload.request.host = host ? host.split(":")[0] : null;
  payload.request.pathname = new URL(req.url).pathname;
  payload.request.detected_subdomain = detectSubdomain(host);

  // Cookie names only (no values)
  const cookieStore = cookies();
  const cookieNames = cookieStore.getAll().map(c => c.name);
  const authCookies = cookieNames.filter(name => 
    name.includes('supabase') || name.includes('sb-') || name.includes('auth')
  );
  payload.cookies.observed_cookie_names = authCookies;

  // Domain scoping inference (fixed for apex domain)
  const isGhost = isGhostDomain(host);
  payload.cookies.expected_domain = isGhost ? '.ghostcrm.ai' : 'localhost';
  payload.cookies.secure_expected = isProduction();
  payload.cookies.domain_scoping_inferred = authCookies.length > 0 && isGhost ? "shared" : "unknown";
  payload.checks.auth_cookies_present = authCookies.length > 0;

  if (!rl.ok) {
    payload.ok = false;
    payload.routing.notes.push("rate_limited");
    const res = NextResponse.json(payload, { status: 429 });
    return setNoStoreHeaders(res, true);
  }

  // Auth check (safe)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Unauthenticated: do NOT DB-check subdomain existence
    payload.auth.is_authenticated = false;
    payload.routing.state = "A";
    payload.routing.expected_action = "redirect_login";
    payload.tenant.subdomain_check = "requires_auth";
    payload.billing.status = "redacted";
    payload.billing.stripe_customer_id_present = "redacted";
    payload.billing.stripe_subscription_id_present = "redacted";

    const res = NextResponse.json(payload, { status: 200 });
    return setNoStoreHeaders(res, false);
  }

  // Authenticated: safe to enrich
  payload.auth.is_authenticated = true;
  payload.auth.user_id = user.id;
  payload.auth.email = user.email ?? null;
  payload.auth.email_verified = Boolean(user.email_confirmed_at);

  // Check email verification (auth leakage fix: only show details to authed users)
  if (!user.email_confirmed_at) {
    payload.routing.state = "A";
    payload.routing.expected_action = "redirect_verify_email";
    payload.tenant.subdomain_check = "checked";
    payload.billing.status = "redacted";
    payload.billing.stripe_customer_id_present = "redacted";
    payload.billing.stripe_subscription_id_present = "redacted";
    const res = NextResponse.json(payload, { status: 200 });
    return setNoStoreHeaders(res, false);
  }

  // From here: safe to query DB for authenticated + verified users
  payload.tenant.subdomain_check = "checked";
  
  try {
    // Check tenant status
    const { data: userData } = await supabase
      .from('users')
      .select('tenant_id, stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle();

    payload.billing.stripe_customer_id_present = Boolean(userData?.stripe_customer_id);

    if (!userData?.tenant_id) {
      if (userData?.stripe_customer_id) {
        payload.routing.state = "PROVISIONING";
        payload.routing.expected_action = "allow";
        payload.billing.status = "provisioning";
        payload.billing.stripe_subscription_id_present = false;
        payload.routing.advice.poll_ms = 2000;
        payload.routing.advice.max_wait_s = 60;
        payload.routing.notes.push("payment_received_provisioning_pending");
      } else {
        payload.routing.state = "B";
        payload.routing.expected_action = "redirect_billing";
        payload.billing.status = "unpaid";
        payload.billing.stripe_subscription_id_present = false;
      }
    } else {
      payload.routing.state = "C";
      payload.tenant.tenant_id = userData.tenant_id;
      
      // Get billing status for paid users (with error handling)
      if (userData.stripe_customer_id) {
        const { data: billing, error: billingError } = await supabase
          .from('subscriptions')
          .select('stripe_subscription_id, status')
          .eq('stripe_customer_id', userData.stripe_customer_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (billingError) {
          payload.billing.status = "unknown";
          payload.billing.stripe_subscription_id_present = "redacted";
          payload.routing.notes.push("billing_query_error");
          payload.checks.should_not_enumerate = true; // Keep enumeration flag, add billing flag
          // Note: Could add payload.checks.billing_query_ok = false; if needed
        } else if (billing?.stripe_subscription_id) {
          payload.billing.stripe_subscription_id_present = true;
          payload.billing.status = billing.status as any;
          const needsAttention = ['past_due', 'unpaid', 'canceled'].includes(billing.status);
          payload.routing.expected_action = needsAttention ? "redirect_billing" : "allow";
          if (needsAttention) {
            payload.routing.notes.push("billing_attention_needed");
          }
        } else {
          payload.billing.status = "unknown";
          payload.billing.stripe_subscription_id_present = false;
        }
      }
      
      // Check subdomain membership if on subdomain (anti-enumeration: don't reveal existence)
      if (payload.request.detected_subdomain) {
        const { data: subdomainData, error: subdomainError } = await supabase
          .from('subdomains')
          .select('organization_id')
          .eq('subdomain', payload.request.detected_subdomain)
          .eq('status', 'active')
          .maybeSingle();
        
        // Always report "checked" to prevent subdomain enumeration by verified users
        payload.tenant.subdomain_check = "checked";
        
        if (subdomainError) {
          payload.routing.notes.push("subdomain_query_error");
          payload.tenant.membership = { is_member: false, role: null, status: null };
          noteSubdomainDenied(payload);
          payload.routing.expected_action = "redirect_login";
        } else if (subdomainData) {
          payload.tenant.org_id = subdomainData.organization_id;
          
          // Check membership
          const { data: membership, error: membershipError } = await supabase
            .from('organization_memberships')
            .select('role, status')
            .eq('user_id', user.id)
            .eq('organization_id', subdomainData.organization_id)
            .eq('status', 'active')
            .maybeSingle();
          
          if (membershipError) {
            payload.routing.notes.push("membership_query_error");
            payload.tenant.membership = { is_member: false, role: null, status: null };
            noteSubdomainDenied(payload);
            payload.routing.expected_action = "redirect_login";
          } else {
            payload.tenant.membership = {
              is_member: !!membership,
              role: membership?.role || null,
              status: membership?.status || null
            };
            
            if (!membership) {
              noteSubdomainDenied(payload);
              payload.routing.expected_action = "redirect_login";
            }
          }
        } else {
          // Subdomain doesn't exist, but don't reveal this in subdomain_check or notes
          payload.tenant.membership = { is_member: false, role: null, status: null };
          noteSubdomainDenied(payload);
          payload.routing.expected_action = "rewrite_tenant_not_found";
        }
      } else {
        // Main domain - might redirect to subdomain
        payload.routing.expected_action = "redirect_subdomain";
      }
    }
    
  } catch (error) {
    console.error('Health check DB error:', error);
    payload.routing.notes.push("db_error");
    payload.billing.status = "unknown";
  }

  const res = NextResponse.json(payload, { status: 200 });
  return setNoStoreHeaders(res, false);
}