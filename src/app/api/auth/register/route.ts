// app/api/auth/register/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { limitKey } from "@/lib/rateLimitEdge";
import { withCORS } from "@/lib/cors";

type RegisterBody = {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  subdomain?: string;
};

function jsonError(message: string, status = 400, extra?: Record<string, any>) {
  return NextResponse.json({ error: message, ...(extra ?? {}) }, { status });
}

function normalizeEmail(email: string) {
  return String(email).trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Your DB-side regex is stricter; keep route-side validation aligned.
function validateSubdomainOrThrow(subdomain: string) {
  const s = subdomain.trim().toLowerCase();
  const re = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/; // 3-63, no leading/trailing hyphen
  if (!re.test(s)) {
    throw new Error(
      "Invalid subdomain format. Use 3–63 chars: lowercase letters, numbers, hyphens; cannot start/end with hyphen."
    );
  }

  const reserved = new Set([
    "www", "api", "admin", "app", "mail", "ftp", "blog", "support",
    "help", "docs", "status", "dev", "staging", "test", "demo",
    "dashboard", "login", "register", "auth", "billing", "account",
  ]);
  if (reserved.has(s)) {
    throw new Error(`'${s}' is a reserved subdomain name. Please choose a different name.`);
  }

  return s;
}

function defaultOrgName(body: RegisterBody) {
  const fn = (body.firstName ?? "").trim();
  const cn = (body.companyName ?? "").trim();
  if (cn) return cn;
  if (fn) return `${fn}'s Organization`;
  return "My Organization";
}

function generateBaseSubdomain(body: RegisterBody, authUserId: string) {
  const provided = (body.subdomain ?? "").trim();
  if (provided) return validateSubdomainOrThrow(provided);

  const cn = (body.companyName ?? "").trim().toLowerCase();
  if (cn) {
    const base = cn
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 20);
    // if company name becomes empty, fall back
    if (base.length >= 3) return base;
  }

  return `org-${authUserId.slice(0, 8)}`; // already valid format
}

// Wait for trigger-created public.users row
async function waitForPublicUser(authUserId: string, maxRetries = 8, delayMs = 250) {
  for (let i = 0; i < maxRetries; i++) {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id,email")
      .eq("id", authUserId)
      .maybeSingle();

    if (data?.id) return data;

    // Ignore "no rows" style errors; only break early on real failures
    if (error && error.code && error.code !== "PGRST116") {
      // keep retrying a couple times, but don't spin forever
      if (i >= 2) throw new Error("Database error while waiting for user sync trigger.");
    }

    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error("User sync trigger did not create public user record in time.");
}

function sanitizeErrorForClient(e: any) {
  const msg = e?.message ? String(e.message) : "Registration failed";
  // Don't leak internals in prod
  if (process.env.NODE_ENV === "production") {
    // Map a few common cases safely
    if (msg.toLowerCase().includes("reserved subdomain")) return { error: msg };
    if (msg.toLowerCase().includes("invalid subdomain")) return { error: msg };
    if (msg.toLowerCase().includes("invalid email")) return { error: "Invalid email format" };
    if (msg.toLowerCase().includes("already exists")) return { error: "An account with this email already exists" };
    if (msg.toLowerCase().includes("subdomain") && msg.toLowerCase().includes("unique")) {
      return { error: "Registration temporarily unavailable. Please try again in a moment." };
    }
    return { error: "Registration failed. Please try again." };
  }
  return { error: msg };
}

export const POST = withCORS(registerHandler);

async function registerHandler(req: Request) {
  try {
    const body: RegisterBody = await req.json().catch(() => ({}));

    const emailRaw = body.email ?? "";
    const password = body.password ?? "";
    const firstName = (body.firstName ?? "").trim();
    const lastName = (body.lastName ?? "").trim();
    const companyName = (body.companyName ?? "").trim();

    // --- Rate limit by client IP
    const clientIP =
      req.headers.get("x-forwarded-for") ??
      req.headers.get("x-real-ip") ??
      "unknown";
    const rateKey = `register:${clientIP}`;
    const rate = await limitKey(rateKey);
    if (!rate.allowed) {
      return jsonError("Too many registration attempts. Please try again later.", 429);
    }

    // --- Validate basics
    const email = normalizeEmail(emailRaw);
    if (!email || !password) return jsonError("Missing email or password", 400);
    if (!isValidEmail(email)) return jsonError("Invalid email format", 400);
    if (password.length < 8) return jsonError("Password must be at least 8 characters", 400);

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return jsonError("Database configuration error. Please contact support.", 500);
    }

    // 🎯 CREATE AUTH USER + ORGANIZATION + PENDING SUBDOMAIN
    // Set redirect URL for email verification - use existing NEXT_PUBLIC_BASE_URL
    const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   process.env.NEXT_PUBLIC_SITE_URL || 
                   (process.env.NODE_ENV === 'production' ? 'https://ghostcrm.ai' : 'http://localhost:3000');
    const redirectTo = `${siteUrl}/auth/callback`;

    console.log('[REGISTER] Site URL configuration:', {
      nodeEnv: process.env.NODE_ENV,
      nextPublicBaseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      nextPublicSiteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      computedSiteUrl: siteUrl,
      redirectTo: redirectTo
    });

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // 🎯 Allow immediate login - verification happens post-login
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        company_name: companyName,
        role: "tenant-owner", // 🎯 They're creating their org, so they're the owner
        email_verification_pending: true, // 🎯 Flag for post-login verification
      },
    });

    if (createErr) {
      console.log('[REGISTER] Auth creation error:', createErr);
      
      // normalize common duplicate user situations into 409
      const msg = createErr.message?.toLowerCase?.() ?? "";
      const isDup =
        createErr.status === 422 ||
        createErr.code === '23505' || // PostgreSQL unique violation
        msg.includes("already") ||
        msg.includes("registered") ||
        msg.includes("duplicate") ||
        msg.includes("email_already_taken");

      if (isDup) {
        return jsonError("An account with this email already exists.", 409, {
          suggestion: "Try signing in or use password reset.",
          code: "EMAIL_ALREADY_EXISTS"
        });
      }

      // Rate limiting error
      if (msg.includes("rate") || msg.includes("limit")) {
        return jsonError("Too many registration attempts. Please try again later.", 429);
      }

      // sanitize details in production
      if (process.env.NODE_ENV === "production") {
        return jsonError("Registration failed. Please try again.", 500);
      }
      return jsonError("Registration failed.", 500, { detail: createErr.message });
    }

    const authUserId = created?.user?.id;
    if (!authUserId) return jsonError("Registration failed. Please try again.", 500);

    // 🎯 CREATE ORGANIZATION + PENDING SUBDOMAIN
    let organizationId: string | null = null;
    let subdomainName: string | null = null;
    
    try {
      console.log('[REGISTER] Creating organization and pending subdomain for user:', authUserId);
      
      // Generate subdomain name
      subdomainName = generateBaseSubdomain(body, authUserId);
      console.log('[REGISTER] Generated subdomain:', subdomainName);
      
      // Check if subdomain already exists in BOTH tables
      const [subdomainCheck, organizationCheck] = await Promise.all([
        supabaseAdmin
          .from('subdomains')
          .select('subdomain')
          .eq('subdomain', subdomainName)
          .single(),
        supabaseAdmin
          .from('organizations')
          .select('subdomain')
          .eq('subdomain', subdomainName)
          .single()
      ]);
        
      if (subdomainCheck.data || organizationCheck.data) {
        // Generate a unique subdomain by appending random chars
        let attempts = 0;
        let isUnique = false;
        
        while (!isUnique && attempts < 10) {
          const randomSuffix = Math.random().toString(36).substring(2, 6);
          const candidateSubdomain = `${subdomainName}-${randomSuffix}`;
          
          const [newSubdomainCheck, newOrganizationCheck] = await Promise.all([
            supabaseAdmin
              .from('subdomains')
              .select('subdomain')
              .eq('subdomain', candidateSubdomain)
              .single(),
            supabaseAdmin
              .from('organizations')
              .select('subdomain')
              .eq('subdomain', candidateSubdomain)
              .single()
          ]);
          
          if (!newSubdomainCheck.data && !newOrganizationCheck.data) {
            subdomainName = candidateSubdomain;
            isUnique = true;
            console.log('[REGISTER] Generated unique subdomain:', subdomainName);
          }
          
          attempts++;
        }
        
        if (!isUnique) {
          // Fallback to timestamp-based naming
          subdomainName = `org-${authUserId.slice(0, 8)}-${Date.now()}`;
          console.log('[REGISTER] Using timestamp fallback subdomain:', subdomainName);
        }
      }
      
      // Create organization record
      const orgName = defaultOrgName(body);
      const { data: newOrg, error: orgError } = await supabaseAdmin
        .from('organizations')
        .insert({
          name: orgName,
          subdomain: subdomainName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();
        
      if (orgError || !newOrg) {
        console.error('[REGISTER] Failed to create organization:', orgError);
        
        // Check if it's a subdomain uniqueness violation
        const isSubdomainConflict = orgError?.code === '23505' && 
          (orgError?.message?.includes('subdomain') || orgError?.message?.includes('organizations_subdomain_key'));
        
        if (isSubdomainConflict) {
          // Retry with a timestamp-based unique subdomain
          const fallbackSubdomain = `org-${authUserId.slice(0, 8)}-${Date.now()}`;
          console.log('[REGISTER] Subdomain conflict, retrying with fallback:', fallbackSubdomain);
          
          const { data: retryOrg, error: retryError } = await supabaseAdmin
            .from('organizations')
            .insert({
              name: orgName,
              subdomain: fallbackSubdomain,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select('id')
            .single();
            
          if (retryError || !retryOrg) {
            console.error('[REGISTER] Retry failed:', retryError);
            throw new Error('Failed to create organization with unique subdomain');
          }
          
          organizationId = retryOrg.id;
          subdomainName = fallbackSubdomain;
          console.log('[REGISTER] Retry succeeded:', { id: organizationId, subdomain: subdomainName });
        } else {
          throw new Error('Failed to create organization');
        }
      } else {
        organizationId = newOrg.id;
        console.log('[REGISTER] Created organization:', { id: organizationId, name: orgName, subdomain: subdomainName });
      }
      
      // Create pending subdomain record
      const { error: subdomainError } = await supabaseAdmin
        .from('subdomains')
        .insert({
          subdomain: subdomainName,
          organization_id: organizationId,
          organization_name: orgName,
          owner_email: email,
          status: 'pending', // 🎯 KEY: This is what the webhook will look for!
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (subdomainError) {
        console.error('[REGISTER] Failed to create subdomain record:', subdomainError);
        
        // Check if it's a subdomain uniqueness violation
        const isSubdomainConflict = subdomainError?.code === '23505' && 
          subdomainError?.message?.includes('subdomain');
        
        if (isSubdomainConflict) {
          console.warn('[REGISTER] Subdomain record already exists, continuing with organization creation');
          // Don't fail registration - the important part (organization) is created
        } else {
          throw new Error('Failed to create subdomain record');
        }
      } else {
        console.log('[REGISTER] Created pending subdomain record:', { subdomain: subdomainName, status: 'pending' });
      }
      
      // Update user record with organization_id
      const { error: userUpdateError } = await supabaseAdmin
        .from('users')
        .update({ 
          organization_id: organizationId,
          updated_at: new Date().toISOString()
        })
        .eq('id', authUserId);
        
      if (userUpdateError) {
        console.warn('[REGISTER] Failed to update user with organization_id:', userUpdateError);
        // Don't fail registration for this
      }
      
    } catch (orgCreationError) {
      console.error('[REGISTER] Organization/subdomain creation failed:', orgCreationError);
      // Don't fail the entire registration - user can still go through checkout
      // The webhook will handle organization creation as fallback
    }

    // 🎯 NO IMMEDIATE VERIFICATION - Verizon-style post-login setup approach
    // Users will verify contact info AFTER login through PostLoginSetupModal
    console.log('[REGISTER] Account created - verification will happen post-login');

    // 🎯 TRIGGERS STILL CREATE public.users + public.profiles (but no org fields)
    // Wait for trigger sync (optional - for immediate profile access)
    try {
      await waitForPublicUser(authUserId);
    } catch (triggerError) {
      console.warn("[REGISTER] Trigger sync failed (non-fatal):", triggerError);
      // Continue - not critical for registration success
    }

    // 🎯 ENHANCED REGISTRATION RESPONSE - Include organization and subdomain info
    return NextResponse.json({
      success: true,
      message: "Account created successfully! Please select your plan.",
      user: {
        id: authUserId,
        email,
        role: "tenant-owner", // 🎯 They're the owner from registration
        email_confirmed: false,
        organizationId: organizationId, // 🎯 Now created during registration
        tenantId: organizationId, // 🎯 Same as organizationId
      },
      organization: organizationId ? {
        id: organizationId,
        name: defaultOrgName(body),
        subdomain: subdomainName
      } : null,
      subdomain: subdomainName ? {
        name: subdomainName,
        status: 'pending', // 🎯 Ready for webhook activation!
        url: `https://${subdomainName}.ghostcrm.ai`
      } : null,
      next_step: "select_plan", // ✅ Always go to billing for plan selection
      next_url: "/billing",
    });

  } catch (e: any) {
    console.error("[REGISTER] unexpected error:", e);
    return NextResponse.json(sanitizeErrorForClient(e), { status: 500 });
  }
}