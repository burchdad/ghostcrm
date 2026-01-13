import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { getUserFromRequest, isAuthenticated } from "@/lib/auth/server";

export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest) {
  try {
    // Check authentication using JWT
    if (!(await isAuthenticated(req))) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Get user data from JWT
    const user = await getUserFromRequest(req);
    if (!user || !user.organizationId) {
      return NextResponse.json({ error: "User organization not found" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin.from("telecom_providers").select("id, slug, name").order("name");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Telecom providers error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

