// app/api/auth/register/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { limitKey } from "@/lib/rateLimitEdge";
import { withCORS } from "@/lib/cors";

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

    // --- Constrain role (no owner via open registration)
    const allowedRoles = ["sales_rep", "manager", "admin"] as const;
    const userRole = (allowedRoles as readonly string[]).includes(role || "")
      ? (role as (typeof allowedRoles)[number])
      : "sales_rep";

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

    console.log("💾 [REGISTER] Inserting new user into database…");
    const insertResult = await supabaseAdmin
      .from("users")
      .insert({
        email: emailNorm,
        password_hash,
        role: userRole,
        first_name: firstName ?? "",
        last_name: lastName ?? "",
        company_name: companyName ?? "",
      })
      .select("id,email,role")
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

    // --- Create organization/tenant for admin and manager roles
    let organizationId: string | null = null;
    if (userRole === "admin" || userRole === "manager") {
      console.log("🏢 [REGISTER] Creating organization for", userRole, "role...");
      
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

          // Create organization membership
          const membershipResult = await supabaseAdmin
            .from("organization_memberships")
            .insert({
              organization_id: organizationId,
              user_id: user.id,
              role: userRole === "admin" ? "admin" : "member",
              status: "active",
            });

          if (membershipResult.error) {
            console.error("❌ [REGISTER] Failed to create membership:", membershipResult.error);
          } else {
            console.log("✅ [REGISTER] Organization membership created");
          }

          // Update user with organization_id
          await supabaseAdmin
            .from("users")
            .update({ organization_id: organizationId })
            .eq("id", user.id);
        }
      } catch (orgError) {
        console.error("❌ [REGISTER] Organization creation error:", orgError);
        // Continue with registration even if org creation fails
      }
    } else {
      console.log("ℹ️ [REGISTER] Sales rep role - no organization created");
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
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.warn("⚠️ [REGISTER] Missing JWT_SECRET; using ephemeral fallback");
    }
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role || userRole,
        organizationId: organizationId,
        tenantId: organizationId, // For backward compatibility
      },
      JWT_SECRET || "ephemeral-dev-secret", // never use fallback in prod
      { expiresIn: "24h" }
    );

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
        role: userRole === "admin" ? "admin" : "member"
      } : null,
      trial_mode: true,
    });

    res.cookies.set("ghostcrm_jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24h
      path: "/",
    });

    console.log("🎉 [REGISTER] Registration completed:", user.id);
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
