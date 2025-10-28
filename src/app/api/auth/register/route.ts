// app/api/auth/register/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { signJwtToken, hasJwtSecret } from "@/lib/jwt";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { limitKey } from "@/lib/rateLimitEdge";
import { withCORS } from "@/lib/cors";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import speakeasy from "speakeasy";

type RegisterBody = {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  role?: string;
};

async function registerHandler(req: Request) {
  console.log("🚀 [REGISTER] Starting registration process...");

  try {
    const {
      email,
      password,
      firstName,
      lastName,
      companyName,
      role,
    }: RegisterBody = await req.json();

    // --- Rate limit by client IP
    const clientIP =
      req.headers.get("x-forwarded-for") ??
      req.headers.get("x-real-ip") ??
      "unknown";
    const rateKey = `register:${clientIP}`;
    const rateResult = await limitKey(rateKey);
    if (!rateResult.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    // --- Validate inputs
    if (!email || !password) {
      console.log("❌ [REGISTER] Missing email or password");
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 }
      );
    }
    const emailNorm = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      console.log("❌ [REGISTER] Invalid email format:", emailNorm);
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // --- All registrations create company owners
    const userRole = "owner"; // Simplified: only owners can register
    
    // All registered users create organizations
    const isCreatingOrganization = true;

    // --- Validate Supabase env
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      console.error("❌ [REGISTER] Missing Supabase configuration");
      return NextResponse.json(
        { error: "Database configuration error. Please contact support." },
        { status: 500 }
      );
    }

    // --- Check if user exists
    console.log("🔍 [REGISTER] Checking if user already exists…");
    let existing = null as { id: string; email: string } | null;
    try {
      const result = await supabaseAdmin
        .from("users")
        .select("id,email")
        .eq("email", emailNorm)
        .single();
      existing = result.data ?? null;

      // If error is "no rows" (PGRST116), that's fine; else surface the error
      if (result.error && result.error.code !== "PGRST116") {
        console.error("❌ [REGISTER] Database error:", result.error);
        return NextResponse.json(
          { error: "Database connection error. Please try again." },
          { status: 500 }
        );
      }
    } catch (err) {
      console.error("❌ [REGISTER] Supabase query failed:", err);
      return NextResponse.json(
        { error: "Database connection error. Please try again." },
        { status: 500 }
      );
    }

    if (existing) {
      console.log("❌ [REGISTER] User already exists:", emailNorm);
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // --- Hash and insert
    console.log("🔐 [REGISTER] Hashing password…");
    const password_hash = await hash(password, 10);
    
    // --- Generate security fields for complete user setup
    console.log("� [REGISTER] Generating security fields...");
    const tenant_id = crypto.randomUUID();
    const totp_secret = speakeasy.generateSecret({
      name: `GhostCRM (${emailNorm})`,
      issuer: 'GhostCRM'
    }).base32;
    const jwt_token = crypto.randomUUID(); // Placeholder token field

    console.log("�💾 [REGISTER] Inserting new user into database…");
    const insertResult = await supabaseAdmin
      .from("users")
      .insert({
        email: emailNorm,
        password_hash,
        role: userRole,
        first_name: firstName ?? "",
        last_name: lastName ?? "",
        company_name: companyName ?? "",
        tenant_id: tenant_id,
        totp_secret: totp_secret,
        webauthn_credentials: JSON.stringify([]), // Empty array for new users
        jwt_token: jwt_token,
        organization_id: null // Will be set after organization creation
      })
      .select("id,email,role,tenant_id,totp_secret,webauthn_credentials,jwt_token")
      .single();

    if (insertResult.error) {
      const { code, message } = insertResult.error;
      if (code === "23505" || /duplicate/i.test(message)) {
        console.log("❌ [REGISTER] Duplicate email on insert:", emailNorm);
        return NextResponse.json({ error: "Email already registered" }, { status: 409 });
      }
      console.log("❌ [REGISTER] Database error on insert:", insertResult.error);
      return NextResponse.json(
        { error: "db_error", detail: message },
        { status: 500 }
      );
    }

    const user = insertResult.data!;
    console.log("✅ [REGISTER] User created successfully:", user.id);

    // --- Create organization/tenant for all registrations
    let organizationId: string | null = null;
    console.log("🏢 [REGISTER] Creating organization for company owner...");
    
    // Generate a subdomain from company name
    const subdomain = companyName 
      ? companyName.toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
          .substring(0, 30)
      : `org-${user.id.substring(0, 8)}`;

    try {
      const orgResult = await supabaseAdmin
        .from("organizations")
        .insert({
          name: companyName || `${firstName}'s Organization`,
          subdomain: subdomain,
          owner_id: user.id,
          status: "active",
          onboarding_completed: false,
        })
        .select("id")
        .single();

      if (orgResult.error) {
        console.error("❌ [REGISTER] Failed to create organization:", orgResult.error);
        // Don't fail registration, just log the error
      } else {
        organizationId = orgResult.data.id;
        console.log("✅ [REGISTER] Organization created:", organizationId);

        // Create organization membership as owner
        const membershipResult = await supabaseAdmin
          .from("organization_memberships")
          .insert({
            organization_id: organizationId,
            user_id: user.id,
            role: "owner", // All registrations are owners
            status: "active",
          });

          if (membershipResult.error) {
            console.error("❌ [REGISTER] Failed to create membership:", membershipResult.error);
          } else {
            console.log("✅ [REGISTER] Organization membership created");
          }

        if (membershipResult.error) {
          console.error("❌ [REGISTER] Failed to create membership:", membershipResult.error);
        } else {
          console.log("✅ [REGISTER] Organization membership created");
        }

        // Update user record with organization info as owner
        await supabaseAdmin
          .from("users")
          .update({ 
            organization_id: organizationId,
            role: "owner" // Always owner for registrations
          })
          .eq("id", user.id);
      }
    } catch (orgError) {
      console.error("❌ [REGISTER] Organization creation error:", orgError);
      // Continue with registration even if org creation fails
    }

    // --- Audit (best effort; ignore failures)
    try {
      await supabaseAdmin.from("audit_events").insert({
        org_id: process.env.DEFAULT_ORG_ID ?? null,
        actor_id: user.id,
        entity: "user",
        entity_id: user.id,
        action: "register",
        diff: { email: emailNorm },
      });
    } catch (auditErr) {
      console.warn("⚠️ [REGISTER] Audit log failed:", auditErr);
    }

    // --- Welcome email (optional, fail-soft)
    try {
      if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM) {
        const sg = (await import("@sendgrid/mail")).default;
        sg.setApiKey(process.env.SENDGRID_API_KEY);
        await sg.send({
          to: emailNorm,
          from: process.env.SENDGRID_FROM,
          subject: "Welcome to GhostCRM",
          text: "Your account has been created.",
        });
        console.log("✅ [REGISTER] Welcome email sent");
      } else {
        console.log("ℹ️ [REGISTER] No SendGrid config; skipping email");
      }
    } catch (e) {
      console.warn("⚠️ [REGISTER] SendGrid error:", (e as any)?.message || e);
    }

    // --- Create JWT (auto-login)
    if (!hasJwtSecret()) {
      console.error("❌ [REGISTER] JWT_SECRET not configured in environment");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }
    
    const token = signJwtToken({
      userId: user.id,
      email: user.email,
      role: user.role || userRole,
      organizationId: organizationId,
      tenantId: organizationId, // For backward compatibility
    });

    // --- Create Supabase Auth user and establish session
    console.log("🔐 [REGISTER] Creating Supabase Auth user...");
    
    // Create Supabase Auth user if not already existing
    const { data: adminUser, error: adminErr } = await supabaseAdmin.auth.admin.createUser({
      email: emailNorm,
      password: password, // use the plaintext password the user posted
      email_confirm: true // mark confirmed to avoid verify step
    });
    
    if (adminErr && adminErr.status !== 422 /* user already exists */) {
      console.warn("⚠️ [REGISTER] createUser failed:", adminErr);
    } else {
      console.log("✅ [REGISTER] Supabase Auth user created/exists");
    }

    // Build a response that we can attach Supabase cookies to
    let res = NextResponse.json({
      success: true,
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        organizationId: organizationId 
      },
      organization: organizationId ? {
        id: organizationId,
        name: companyName || `${firstName}'s Organization`,
        role: "owner" // All registrations are owners
      } : null,
      trial_mode: true,
    });

    // --- Attach Supabase session cookies by signing the user in server-side
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log("🍪 [REGISTER] Setting up Supabase session cookies...");
      
      const cookieStore = cookies();
      const supa = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          cookies: {
            getAll: () => cookieStore.getAll(),
            setAll: (cs) => cs.forEach((c) => res.cookies.set(c)),
          },
        }
      );

      // Sign in to create sb-* cookies
      const { error: signInErr } = await supa.auth.signInWithPassword({
        email: emailNorm,
        password: password,
      });
      
      if (signInErr) {
        console.warn("⚠️ [REGISTER] signInWithPassword failed:", signInErr.message);
      } else {
        console.log("✅ [REGISTER] Supabase session established");
      }
    }

    // --- Keep your ghostcrm_jwt too
    console.log("🍪 [REGISTRATION] Setting JWT cookie:", {
      tokenLength: token.length,
      tokenPreview: token.substring(0, 50) + "...",
      environment: process.env.NODE_ENV,
      isSecure: process.env.NODE_ENV === "production",
      cookieSettings: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
        path: "/"
      }
    });
    
    res.cookies.set("ghostcrm_jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24h
      path: "/",
    });

    console.log("� [REGISTER] JWT cookie set:", {
      tokenLength: token.length,
      domain: req.headers.get('host'),
      secure: process.env.NODE_ENV === "production",
      hasJwtSecret: !!process.env.JWT_SECRET
    });

    console.log("�🎉 [REGISTER] Registration completed:", user.id);
    return res;
  } catch (e: any) {
    console.error("💥 [REGISTER] Unexpected error:", e);
    return NextResponse.json(
      { error: "server_error", detail: e?.message || String(e) },
      { status: 500 }
    );
  }
}

// CORS-wrapped POST handler
export const POST = withCORS(registerHandler);
