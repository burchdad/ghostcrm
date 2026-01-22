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

    // 🎯 ONLY CREATE AUTH USER - No org/subdomain until payment
    // Set redirect URL for email verification - ensure production URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                   (process.env.NODE_ENV === 'production' ? 'https://ghostcrm.ai' : 'http://localhost:3000');
    const redirectTo = `${siteUrl}/auth/callback`;

    console.log('[REGISTER] Site URL configuration:', {
      nodeEnv: process.env.NODE_ENV,
      nextPublicSiteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      computedSiteUrl: siteUrl,
      redirectTo: redirectTo
    });

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // 🎯 Require email verification
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        company_name: companyName,
        role: "unassigned", // 🎯 No role until payment
      },
    });

    if (createErr) {
      // normalize common duplicate user situations into 409
      const msg = createErr.message?.toLowerCase?.() ?? "";
      const isDup =
        createErr.status === 422 ||
        msg.includes("already") ||
        msg.includes("registered") ||
        msg.includes("duplicate");

      if (isDup) {
        return jsonError("An account with this email already exists.", 409, {
          suggestion: "Try signing in or use password reset.",
        });
      }

      // sanitize details in production
      if (process.env.NODE_ENV === "production") {
        return jsonError("Registration failed. Please try again.", 500);
      }
      return jsonError("Registration failed.", 500, { detail: createErr.message });
    }

    const authUserId = created?.user?.id;
    if (!authUserId) return jsonError("Registration failed. Please try again.", 500);

    // 🎯 SEND VERIFICATION EMAIL - Use our custom email service with Supabase verification link
    try {
      console.log('[REGISTER] Starting email verification process for:', email);
      console.log('[REGISTER] Environment check:', {
        hasSendgridKey: !!process.env.SENDGRID_API_KEY,
        sendgridFrom: process.env.SENDGRID_FROM,
        siteUrl: siteUrl,
        redirectTo: redirectTo
      });

      // First generate the verification link  
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
          redirectTo: redirectTo,
        }
      });

      console.log('[REGISTER] generateLink result:', {
        hasData: !!linkData,
        hasProps: !!linkData?.properties,
        hasAction: !!linkData?.properties?.action_link,
        error: linkError?.message,
        linkDataKeys: linkData ? Object.keys(linkData) : 'no data'
      });

      if (linkError) {
        console.error('[REGISTER] Email verification link generation failed:', linkError);
        // Don't fail registration if email fails - user can resend later
      } else if (linkData?.properties?.action_link) {
        console.log('[REGISTER] Got action link, sending email via EmailService...');
        
        // Send the verification email using our custom email service
        const { EmailService } = await import('@/lib/email-service');
        const emailService = EmailService.getInstance();
        
        console.log('[REGISTER] About to send verification email:', {
          email,
          firstName,
          hasActionLink: !!linkData.properties.action_link
        });

        const emailSent = await emailService.sendVerificationEmail(
          email,
          firstName,
          linkData.properties.action_link
        );

        console.log('[REGISTER] Email send result:', { emailSent });

        if (emailSent) {
          console.log('[REGISTER] Verification email sent successfully to:', email);
        } else {
          console.error('[REGISTER] Failed to send verification email, but link was generated');
        }
      } else {
        console.error('[REGISTER] No action link returned from generateLink - check Supabase Auth URL configuration');
        console.error('[REGISTER] LinkData structure:', JSON.stringify(linkData, null, 2));
      }
    } catch (emailSendError) {
      console.error('[REGISTER] Email verification sending failed:', emailSendError);
      // Continue - don't block registration on email failure
    }

    // 🎯 TRIGGERS STILL CREATE public.users + public.profiles (but no org fields)
    // Wait for trigger sync (optional - for immediate profile access)
    try {
      await waitForPublicUser(authUserId);
    } catch (triggerError) {
      console.warn("[REGISTER] Trigger sync failed (non-fatal):", triggerError);
      // Continue - not critical for registration success
    }

    // 🎯 CLEAN REGISTRATION RESPONSE - No org data until payment
    return NextResponse.json({
      success: true,
      message: "Account created successfully! Please check your email to verify your account.",
      user: {
        id: authUserId,
        email,
        role: "unassigned", // 🎯 No role until payment
        email_confirmed: false,
        organizationId: null, // 🎯 No org until payment
        tenantId: null, // 🎯 No tenant until payment
      },
      next_step: "verify_email", // 🎯 Next: email verification
      next_url: "/verify-email",
    });

  } catch (e: any) {
    console.error("[REGISTER] unexpected error:", e);
    return NextResponse.json(sanitizeErrorForClient(e), { status: 500 });
  }
}