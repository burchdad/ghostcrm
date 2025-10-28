// Cleanup script for duplicate users
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    console.log("🔧 [CLEANUP] Finding duplicate users for:", email);

    // Find all users with this email
    const { data: users, error: usersError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: true });

    if (usersError) {
      console.error("❌ [CLEANUP] Error finding users:", usersError);
      return NextResponse.json({ error: "Failed to find users" }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ error: "No users found" }, { status: 404 });
    }

    if (users.length === 1) {
      return NextResponse.json({ 
        message: "No duplicates found",
        user: users[0]
      });
    }

    console.log(`🔧 [CLEANUP] Found ${users.length} duplicate users`);

    // Keep the first user (oldest), remove the others
    const keepUser = users[0];
    const duplicateUsers = users.slice(1);

    console.log("🔧 [CLEANUP] Keeping user:", keepUser.id);
    console.log("🔧 [CLEANUP] Removing duplicates:", duplicateUsers.map(u => u.id));

    // Delete duplicate users and their organizations
    for (const duplicateUser of duplicateUsers) {
      console.log("🗑️ [CLEANUP] Deleting user:", duplicateUser.id);
      
      // Delete organization memberships
      if (duplicateUser.organization_id) {
        await supabaseAdmin
          .from("organization_memberships")
          .delete()
          .eq("user_id", duplicateUser.id);

        // Delete the organization if this user was the owner
        await supabaseAdmin
          .from("organizations")
          .delete()
          .eq("id", duplicateUser.organization_id);
      }

      // Delete the user
      await supabaseAdmin
        .from("users")
        .delete()
        .eq("id", duplicateUser.id);
    }

    console.log("✅ [CLEANUP] Cleanup completed successfully");

    return NextResponse.json({
      message: "Duplicate users cleaned up successfully",
      keptUser: {
        id: keepUser.id,
        email: keepUser.email,
        role: keepUser.role,
        organizationId: keepUser.organization_id
      },
      removedUsers: duplicateUsers.length
    });

  } catch (error) {
    console.error("❌ [CLEANUP] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}