// app/api/onboarding/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supaFromReq } from "@/lib/supa-ssr";

// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OrgRow = {
  id: string;
  name: string;
  subdomain: string | null;
  onboarding_completed?: boolean | null;
  created_at?: string | null;
  status?: string | null;
};

export async function GET(req: NextRequest) {
  const { s, res } = supaFromReq(req);

  try {
    console.log("🔍 [ONBOARDING_STATUS] Checking user onboarding status");

    // Authenticate
    const {
      data: { user },
      error: authError,
    } = await s.auth.getUser();

    if (authError || !user) {
      console.error("❌ [ONBOARDING_STATUS] Authentication failed:", authError?.message);
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    console.log("🔍 [ONBOARDING_STATUS] Using authenticated user:", user.email);

    // 1) Try: organization where the user is the owner
    let organizationData: OrgRow | null = null;
    let isCompleted = false;
    let completedAt: string | null = null;

    const { data: ownerOrg, error: ownerOrgError } = await s
      .from("organizations")
      .select("id, name, subdomain, onboarding_completed, created_at, status")
      .eq("owner_id", user.id)
      .single<OrgRow>();

    if (ownerOrgError && ownerOrgError.code !== "PGRST116") {
      console.error("❌ [ONBOARDING_STATUS] Organization owner query failed:", ownerOrgError);
      return NextResponse.json(
        { error: "Failed to fetch organization data" },
        { status: 500 }
      );
    }

    if (ownerOrg) {
      organizationData = ownerOrg;
      isCompleted = Boolean(ownerOrg.onboarding_completed);
      completedAt = ownerOrg.created_at ?? null;
      console.log("✅ [ONBOARDING_STATUS] Owner organization found:", ownerOrg.name);
    }

    // 2) Fallback: find an active membership if no owner org
    if (!organizationData) {
      const { data: membership, error: membershipError } = await s
        .from("organization_memberships")
        .select("organization_id, status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (!membershipError && membership?.organization_id) {
        const { data: memberOrg, error: orgError } = await s
          .from("organizations")
          .select("id, name, subdomain, onboarding_completed, created_at, status")
          .eq("id", membership.organization_id)
          .single<OrgRow>();

        if (!orgError && memberOrg) {
          organizationData = memberOrg;
          isCompleted = Boolean(memberOrg.onboarding_completed);
          completedAt = memberOrg.created_at ?? null;
          console.log("✅ [ONBOARDING_STATUS] Found organization via membership:", memberOrg.name);
        } else {
          console.log("❌ [ONBOARDING_STATUS] Organization not found by membership id");
        }
      } else {
        console.log("ℹ️ [ONBOARDING_STATUS] No active membership found for user");
      }
    }

    // No org at all ⇒ onboarding not completed
    if (!organizationData) {
      console.log("⏳ [ONBOARDING_STATUS] No organization found - onboarding incomplete");
      const response = {
        isCompleted: false,
        completedAt: null,
        organizationId: null,
        organizationName: null,
        organizationSubdomain: null,
      };
      return NextResponse.json(response, { headers: res.headers });
    }

    const response = {
      isCompleted,
      completedAt,
      organizationId: organizationData.id,
      organizationName: organizationData.name,
      organizationSubdomain: organizationData.subdomain,
      status: organizationData.status ?? null,
    };

    console.log("📤 [ONBOARDING_STATUS] Response:", response);
    return NextResponse.json(response, { headers: res.headers });
  } catch (error) {
    console.error("❌ [ONBOARDING_STATUS] Error:", (error as Error)?.message || error);
    return NextResponse.json(
      { error: "Internal server error checking onboarding status" },
      { status: 500 }
    );
  }
}
