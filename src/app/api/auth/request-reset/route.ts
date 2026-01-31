// app/api/auth/password/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { hash } from "bcryptjs";
import { createSafeSupabaseClient } from "@/lib/supabase-safe";
import { supaFromReq } from "@/lib/supa-ssr";

/**
 * Lightweight admin client factory. Falls back to null if misconfigured.
 */
function getSupabaseAdmin() {
  try {
    return createSafeSupabaseClient();
  } catch {
    return null;
  }
}

/**
 * POST -> Send password reset email (Supabase magic link flow)
 * Body: { email }
 */
export async function POST(req: NextRequest) {
  try {
    const { email }: { email?: string } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Service temporarily unavailable" },
        { status: 503 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const { error } = await admin.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/reset-password`,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Failed to send password reset email" },
      { status: 500 }
    );
  }
}

/**
 * PUT -> Authenticated password change
 * Body: { newPassword }
 * Requires the requester to be authenticated (uses supaFromReq).
 */
export async function PUT(req: NextRequest) {
  try {
    const { s, res } = supaFromReq(req);
    const { newPassword }: { newPassword?: string } = await req.json();

    if (!newPassword) {
      return NextResponse.json(
        { error: "New password is required" },
        { status: 400 }
      );
    }

    // Ensure caller is authenticated
    const {
      data: { user },
      error: authError,
    } = await s.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { error } = await s.auth.updateUser({ password: newPassword });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { headers: res.headers });
  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    );
  }
}

/**
 * PATCH -> Token-based reset confirmation (custom flow)
 * Body: { email, token, newPassword }
 * Verifies token via password_resets(email, token_hash, expires_at), updates password, deletes token row.
 */
export async function PATCH(req: NextRequest) {
  try {
    const { email, token, newPassword }: { email?: string; token?: string; newPassword?: string } =
      await req.json();

    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { error: "Email, token, and new password are required" },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Service temporarily unavailable" },
        { status: 503 }
      );
    }

    const tokenHash = createHash("sha256").update(token).digest("hex");

    // Validate token row
    const { data: row, error: rowError } = await admin
      .from("password_resets")
      .select("email, expires_at")
      .eq("email", email)
      .eq("token_hash", tokenHash)
      .single();

    if (rowError || !row) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }
    if (row.expires_at && new Date(row.expires_at) < new Date()) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    // Hash and set new password (custom users table with password_hash)
    const passwordHash = await hash(newPassword, 10);

    const { error: updErr } = await admin
      .from("users")
      .update({ password_hash: passwordHash })
      .eq("email", email);

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }

    // Invalidate the token
    await admin.from("password_resets").delete().eq("email", email);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password reset confirmation error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}

