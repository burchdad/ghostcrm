import { NextRequest, NextResponse } from "next/server";
import { supaFromReq } from "@/lib/supa-ssr";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { hash } from "bcryptjs";

// Runtime configuration to use Node.js runtime instead of Edge
export const runtime = 'nodejs';

// Helper function to get admin client
function getSupabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const { error } = await s.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/reset-password`,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true }, { headers: res.headers });
}

export async function PUT(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const { newPassword } = await req.json();
  const { error } = await s.auth.updateUser({ password: newPassword });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true }, { headers: res.headers });
}

// Example PATCH handler for password reset confirmation
export async function PATCH(req: NextRequest) {
  const { email, token, newPassword } = await req.json();
  const supabaseAdmin = getSupabaseAdmin();
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const { data: row } = await supabaseAdmin
    .from("password_resets")
    .select("email, expires_at")
    .eq("email", email)
    .eq("token_hash", tokenHash)
    .single();
  if (!row || new Date(row.expires_at) < new Date()) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const passwordHash = await hash(newPassword, 10);
  await supabaseAdmin
    .from("users")
    .update({ password_hash: passwordHash })
    .eq("email", email);
  await supabaseAdmin
    .from("password_resets")
    .delete()
    .eq("email", email);

  return NextResponse.json({ success: true });
}
