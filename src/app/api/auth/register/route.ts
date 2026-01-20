// app/api/auth/register/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { limitKey } from "@/lib/rateLimitEdge";
import { withCORS } from "@/lib/cors";
import speakeasy from "speakeasy";
import crypto from "crypto";

type RegisterBody = {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  subdomain?: string;
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
      subdomain,
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
    
    // Validate subdomain if provided
    if (subdomain) {
      const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
      if (!subdomainRegex.test(subdomain) || subdomain.length < 3 || subdomain.length > 63) {
        console.log("❌ [REGISTER] Invalid subdomain format:", subdomain);
        return NextResponse.json(
          { error: "Invalid subdomain format. Must be 3-63 characters, lowercase letters, numbers, and hyphens only." },
          { status: 400 }
        );
      }
      
      // Check for reserved subdomains
      const reservedSubdomains = [
        'www', 'api', 'admin', 'app', 'mail', 'ftp', 'blog', 'support', 
        'help', 'docs', 'status', 'dev', 'staging', 'test', 'demo',
        'dashboard', 'login', 'register', 'auth', 'billing', 'account'
      ];
      
      if (reservedSubdomains.includes(subdomain.toLowerCase())) {
        console.log("❌ [REGISTER] Reserved subdomain:", subdomain);
        return NextResponse.json(
          { error: `'${subdomain}' is a reserved subdomain name. Please choose a different name.` },
          { status: 400 }
        );
      }
    }
    
    const emailNorm = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      console.log("❌ [REGISTER] Invalid email format:", emailNorm);
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // --- All registrations create company owners (simplified flow)

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

    // --- Check if user already exists in public.users (authoritative check)
    console.log("🔍 [REGISTER] Checking if user exists in public.users...");
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from("users")
      .select("id,email")
      .eq("email", emailNorm)
      .single();

    // If error is "no rows" (PGRST116), that's fine; else surface the error
    if (checkError && checkError.code !== "PGRST116") {
      console.error("❌ [REGISTER] Database error:", checkError);
      return NextResponse.json(
        { error: "Database connection error. Please try again." },
        { status: 500 }
      );
    }

    if (existingUser) {
      console.log("❌ [REGISTER] User already exists in public.users:", emailNorm);
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // 🔧 FIX: Create Supabase Auth user FIRST to get canonical user ID
    console.log("🔐 [REGISTER] Creating Supabase Auth user...");
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: emailNorm,
      password: password,
      email_confirm: true // mark confirmed to avoid verify step
    });

    // If user already exists (422), return 409 immediately
    if (createErr?.status === 422) {
      console.log("❌ [REGISTER] User already exists:", emailNorm);
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    if (createErr) {
      console.error("❌ [REGISTER] createUser failed:", createErr);
      return NextResponse.json(
        { error: "Authentication setup failed. Please try again." },
        { status: 500 }
      );
    }

    const authUserId = created?.user?.id;
    if (!authUserId) {
      console.error("❌ [REGISTER] No auth user ID returned");
      return NextResponse.json(
        { error: "Authentication setup failed. Please try again." },
        { status: 500 }
      );
    }

    console.log("✅ [REGISTER] Auth user established with ID:", authUserId);

    // --- Hash password for public.users
    console.log("🔐 [REGISTER] Hashing password…");
    const password_hash = await hash(password, 10);
    
    // --- Generate security fields for complete user setup
    console.log("🔧 [REGISTER] Generating security fields...");
    const totp_secret = speakeasy.generateSecret({
      name: `GhostCRM (${emailNorm})`,
      issuer: 'GhostCRM'
    }).base32;
    const jwt_token = crypto.randomUUID(); // Placeholder token field

    // 🔧 FIX: Insert into public.users using auth user ID (no tenant_id yet)
    console.log("💾 [REGISTER] Inserting user into public.users with auth ID…");
    const insertResult = await supabaseAdmin
      .from("users")
      .upsert({
        id: authUserId, // 🎯 KEY FIX: Use auth user ID to maintain consistency
        email: emailNorm,
        password_hash,
        role: "owner",
        first_name: firstName ?? "",
        last_name: lastName ?? "",
        company_name: companyName ?? "",
        totp_secret: totp_secret,
        webauthn_credentials: [], // Empty array for new users (jsonb column)
        jwt_token: jwt_token,
        organization_id: null, // Will be set after organization creation
        tenant_id: null // 🔧 FIX: Will be set to organization_id (not random UUID)
      }, { onConflict: "id" })
      .select("id,email,role,tenant_id,totp_secret,webauthn_credentials,jwt_token")
      .single();

    if (insertResult.error) {
      const { code, message } = insertResult.error;
      console.error("❌ [REGISTER] Full database error details:", {
        code,
        message,
        details: insertResult.error.details,
        hint: insertResult.error.hint
      });
      
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
    
    // Use user-provided subdomain or generate from company name
    let baseSubdomain = subdomain || (companyName 
      ? companyName.toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
          .substring(0, 20)
      : `org-${user.id.substring(0, 8)}`);
    
    // Ensure subdomain uniqueness
    let counter = 1;
    let finalSubdomain = baseSubdomain;
    
    while (true) {
      // Check both organizations and placeholder subdomains tables
      const [orgCheck, subdomainCheck] = await Promise.all([
        supabaseAdmin
          .from("organizations")
          .select("id")
          .eq("subdomain", finalSubdomain)
          .single(),
        supabaseAdmin
          .from("subdomains")
          .select("id")
          .eq("subdomain", finalSubdomain)
          .single()
      ]);
      
      if (!orgCheck.data && !subdomainCheck.data) break;
      
      finalSubdomain = `${baseSubdomain}-${counter}`;
      counter++;
      
      // Prevent infinite loop
      if (counter > 100) {
        finalSubdomain = `org-${user.id.substring(0, 8)}-${Date.now()}`;
        break;
      }
    }

    try {
      const orgResult = await supabaseAdmin
        .from("organizations")
        .insert({
          name: companyName || `${firstName}'s Organization`,
          subdomain: finalSubdomain,
          owner_id: authUserId, // 🔧 FIX: Use authUserId consistently
          status: "active",
        })
        .select("id")
        .single();

      if (orgResult.error) {
        console.error("❌ [REGISTER] Failed to create organization:", {
          code: orgResult.error.code,
          message: orgResult.error.message,
          details: orgResult.error.details,
          hint: orgResult.error.hint
        });
        throw new Error(`Organization creation failed: ${orgResult.error.message}`);
      }
      
      organizationId = orgResult.data.id;
      console.log("✅ [REGISTER] Organization created:", organizationId, "with subdomain:", finalSubdomain);

      // Create organization membership as owner
      const membershipResult = await supabaseAdmin
        .from("organization_memberships")
        .insert({
          organization_id: organizationId,
          user_id: authUserId, // 🔧 FIX: Use authUserId consistently
          role: "owner", // All registrations are owners
          status: "active",
        });

      if (membershipResult.error) {
        console.error("❌ [REGISTER] Failed to create membership:", membershipResult.error);
        throw new Error(`Membership creation failed: ${membershipResult.error.message}`);
      }
      
      console.log("✅ [REGISTER] Organization membership created");

      // 🚨 CRITICAL FIX #1: Create tenant membership (what get_user_tenant_ids() relies on)
      const { error: tenantMembershipErr } = await supabaseAdmin
        .from("tenant_memberships")
        .insert({
          user_id: authUserId,
          tenant_id: organizationId,
          role: "owner",
        });

      if (tenantMembershipErr) {
        console.error("❌ [REGISTER] Failed to create tenant_membership:", tenantMembershipErr);
        throw new Error(`Tenant membership failed: ${tenantMembershipErr.message}`);
      }
      
      console.log("✅ [REGISTER] Tenant membership created");

      // Update user record with organization info as owner
      const { error: updateError } = await supabaseAdmin
        .from("users")
        .update({ 
          organization_id: organizationId,
          tenant_id: organizationId, // 🔧 FIX: Set tenant_id to organization_id (not random UUID)
          role: "owner" // Always owner for registrations
        })
        .eq("id", authUserId); // 🔧 FIX: Use authUserId consistently
        
      if (updateError) {
        console.error("❌ [REGISTER] Failed to update user with organization:", updateError);
        throw new Error(`User update failed: ${updateError.message}`);
      }
      
      console.log("✅ [REGISTER] User updated with organization");
      
      // Create placeholder subdomain entry (inactive until payment)
      try {
        const { error: subdomainError } = await supabaseAdmin
          .from("subdomains")
          .insert({
            subdomain: finalSubdomain,
            organization_id: organizationId,
            status: 'pending', // 🔧 FIX: Use 'pending' instead of 'placeholder' to match check constraint
            organization_name: companyName || `${firstName}'s Organization`,
            owner_email: emailNorm
          });
          
        if (subdomainError) {
          console.error("❌ [REGISTER] Failed to create subdomain entry:", subdomainError);
          // Don't fail registration for this, but log the error
        } else {
          console.log("✅ [REGISTER] Subdomain entry created:", finalSubdomain, "(pending activation)");
        }
      } catch (subdomainError) {
        console.error("❌ [REGISTER] Subdomain creation error:", subdomainError);
      }
    } catch (orgError) {
      console.error("❌ [REGISTER] Organization setup failed:", orgError);
      
      // 🚨 CRITICAL FIX #2: Clean up both auth and public user records
      await supabaseAdmin
        .from("users")
        .delete()
        .eq("id", authUserId);
      
      // Also cleanup the auth user to prevent partial state on retry
      try {
        await supabaseAdmin.auth.admin.deleteUser(authUserId);
        console.log("✅ [REGISTER] Auth user cleaned up");
      } catch (e) {
        console.warn("⚠️ [REGISTER] Failed to cleanup auth user:", e);
      }
      
      return NextResponse.json(
        { error: "Account setup failed. Please try again with a different company name." },
        { status: 500 }
      );
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

    // --- Create Supabase Auth user and establish session
    console.log("🔐 [REGISTER] Auth user already created with ID:", authUserId);
    
    // Auth user was already created at the beginning of registration process
    console.log("✅ [REGISTER] Using existing Supabase Auth user");

    // Build a success response (no session cookies - client will call /login)
    const res = NextResponse.json({
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

    console.log("🎉 [REGISTER] Registration completed:", user.id);
    console.log("ℹ️ [REGISTER] Client should call /api/auth/login to establish session");
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
