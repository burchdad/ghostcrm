// Fix user organization assignment
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

    console.log("🔧 [ORG-FIX] Fixing organization for user:", email);

    // Find the user
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (userError || !user) {
      console.error("❌ [ORG-FIX] User not found:", userError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("🔍 [ORG-FIX] Current user org:", user.organization_id);

    // If user already has an organization, check if it exists
    if (user.organization_id) {
      const { data: existingOrg } = await supabaseAdmin
        .from("organizations")
        .select("*")
        .eq("id", user.organization_id)
        .single();

      if (existingOrg) {
        return NextResponse.json({
          message: "User already has valid organization",
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            organizationId: user.organization_id,
            organizationName: existingOrg.name
          }
        });
      }
    }

    // Create a new organization for this user
    console.log("🏢 [ORG-FIX] Creating new organization...");
    
    // Generate unique subdomain
    const baseSubdomain = (user.company_name || "company")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 20);
    
    let subdomain = baseSubdomain;
    let counter = 1;
    
    // Find available subdomain
    while (true) {
      const { data: existingSubdomain } = await supabaseAdmin
        .from("organizations")
        .select("id")
        .eq("subdomain", subdomain)
        .single();
      
      if (!existingSubdomain) break;
      
      subdomain = `${baseSubdomain}-${counter}`;
      counter++;
    }

    console.log("🔧 [ORG-FIX] Using subdomain:", subdomain);

    // Create organization
    const { data: newOrg, error: orgError } = await supabaseAdmin
      .from("organizations")
      .insert({
        name: user.company_name || `${user.first_name}'s Organization`,
        subdomain: subdomain,
        owner_id: user.id,
        status: "active",
        onboarding_completed: false
      })
      .select("*")
      .single();

    if (orgError) {
      console.error("❌ [ORG-FIX] Failed to create organization:", orgError);
      return NextResponse.json({ error: "Failed to create organization" }, { status: 500 });
    }

    console.log("✅ [ORG-FIX] Organization created:", newOrg.id);

    // Update user with organization
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ organization_id: newOrg.id })
      .eq("id", user.id);

    if (updateError) {
      console.error("❌ [ORG-FIX] Failed to update user:", updateError);
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }

    // Create organization membership
    const { error: membershipError } = await supabaseAdmin
      .from("organization_memberships")
      .insert({
        organization_id: newOrg.id,
        user_id: user.id,
        role: "owner",
        status: "active"
      });

    if (membershipError) {
      console.error("❌ [ORG-FIX] Failed to create membership:", membershipError);
      // Don't fail the request since user and org are created
    }

    console.log("✅ [ORG-FIX] Organization setup completed");

    return NextResponse.json({
      message: "Organization created and user updated successfully",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: newOrg.id,
        organizationName: newOrg.name,
        subdomain: newOrg.subdomain
      }
    });

  } catch (error) {
    console.error("❌ [ORG-FIX] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}