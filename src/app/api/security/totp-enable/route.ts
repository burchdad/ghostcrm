import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromRequest, isAuthenticated } from "@/lib/auth/server";

// Create a service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // Check authentication using JWT
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Get user data from JWT
    const user = getUserFromRequest(req);
    if (!user || !user.id) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }
  const { code } = await req.json();
  const user = (await s.auth.getUser()).data.user?.id;
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const row = (await s.from("user_security").select("totp_secret").eq("user_id", user).single()).data;
  if (!row?.totp_secret) return NextResponse.json({ error: "no_setup" }, { status: 400 });

  const speakeasy = (await import("speakeasy")).default;
  const ok = speakeasy.totp.verify({ secret: row.totp_secret, encoding: "base32", token: String(code), window: 1 });
  if (!ok) return NextResponse.json({ error: "invalid_code" }, { status: 400 });

  return NextResponse.json({ success: true });
}

