import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromRequest, isAuthenticated } from "@/lib/auth/server";

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
    const { filename } = await req.json();

    if (!organizationId) {
      return NextResponse.json({ error: "no_membership" }, { status: 403 });
    }

    const key = `org/${organizationId}/${Date.now()}_${filename}`;
    const { data, error } = await supabaseAdmin.storage.from("attachments").createSignedUploadUrl(key);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ key, url: data.signedUrl });
  } catch (error) {
    console.error('Storage sign-upload error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

