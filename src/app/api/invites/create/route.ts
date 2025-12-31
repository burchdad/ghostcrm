import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromRequest, isAuthenticated } from "@/lib/auth/server";
import crypto from "node:crypto";

// Create a service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';
export async function POST(req: NextRequest) {
  try {
    // Check authentication using JWT
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Get user data from JWT
    const user = getUserFromRequest(req);
    if (!user || !user.organizationId) {
      return NextResponse.json({ error: "User organization not found" }, { status: 401 });
    }

    const organizationId = user.organizationId;
    const { email, role } = await req.json();

    const token = crypto.randomBytes(24).toString("base64url");
    const { data, error } = await supabaseAdmin.from("invites").insert({ org_id: organizationId, email, role: role ?? "rep", token }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // (Optional) email the invite link with SendGrid
    const link = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/join?token=${data.token}`;
    console.log("Invite link:", link);
    return NextResponse.json({ ok: true, link });
  } catch (error) {
    console.error('Invites create error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

