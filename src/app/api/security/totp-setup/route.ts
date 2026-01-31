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
    if (!(await isAuthenticated(req))) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Get user data from JWT
    const user = await getUserFromRequest(req);
    if (!user || !user.id) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const speakeasy = (await import("speakeasy")).default;
    const secret = speakeasy.generateSecret({ length: 20 });

    await supabaseAdmin.from("user_security").upsert({ user_id: user.id, totp_secret: secret.base32 });
    const otpauth = `otpauth://totp/GhostCRM:${user.id}?secret=${secret.base32}&issuer=GhostCRM`;
    return NextResponse.json({ otpauth });
  } catch (error) {
    console.error('TOTP setup error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

