// Fix existing user role from admin to owner
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { userEmail } = await req.json();
    
    if (!userEmail) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    console.log("🔧 [FIX-ROLE] Fixing role for user:", userEmail);

    // Find the user
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, email, role, organization_id")
      .eq("email", userEmail)
      .single();

    if (userError || !user) {
      console.error("❌ [FIX-ROLE] User not found:", userError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has an organization (meaning they created one)
    if (user.organization_id && user.role === "admin") {
      console.log("🔄 [FIX-ROLE] Updating user role from admin to owner...");
      
      // Update user role
      const { error: updateUserError } = await supabaseAdmin
        .from("users")
        .update({ role: "owner" })
        .eq("id", user.id);

      if (updateUserError) {
        console.error("❌ [FIX-ROLE] Failed to update user role:", updateUserError);
        return NextResponse.json({ error: "Failed to update user role" }, { status: 500 });
      }

      // Update organization membership role
      const { error: updateMembershipError } = await supabaseAdmin
        .from("organization_memberships")
        .update({ role: "owner" })
        .eq("user_id", user.id)
        .eq("organization_id", user.organization_id);

      if (updateMembershipError) {
        console.error("❌ [FIX-ROLE] Failed to update membership role:", updateMembershipError);
        // Don't fail the request since user role was updated
      }

      console.log("✅ [FIX-ROLE] Successfully updated user role to owner");
      
      return NextResponse.json({ 
        message: "User role updated to owner",
        user: {
          id: user.id,
          email: user.email,
          oldRole: "admin",
          newRole: "owner",
          organizationId: user.organization_id
        }
      });
    } else {
      return NextResponse.json({ 
        message: "No role update needed",
        user: {
          email: user.email,
          role: user.role,
          hasOrganization: !!user.organization_id
        }
      });
    }

  } catch (error) {
    console.error("❌ [FIX-ROLE] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}