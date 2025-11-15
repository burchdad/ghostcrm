
export async function getMembershipOrgId(s: any) {
  try {
    // Get the current user ID
    const { data: userData } = await s.auth.getUser();
    const uid = userData.user?.id;
    
    if (!uid) {
      console.warn("No authenticated user found");
      return undefined;
    }

    console.log(`🔍 Looking for membership for user ID: ${uid}`);
    
    // Special case for demo user - return demo organization ID
    if (uid === 'demo-user-id') {
      console.log("🎬 Demo user detected, returning demo organization ID");
      return 'demo-org-id';
    }
    
    // Query organization_memberships table for this specific user
    const { data, error } = await s
      .from("organization_memberships")
      .select("organization_id, user_id, role, status")
      .eq("user_id", uid)
      .limit(1);
      
    if (error) {
      console.error("Error querying organization_memberships:", error.message);
      return undefined;
    }
    
    console.log(`🔍 Membership query result:`, data);
    
    if (!data || data.length === 0) {
      console.warn(`No membership found for user ${uid}`);
      // Try to see if user exists at all
      const { data: allMemberships } = await s
        .from("organization_memberships")
        .select("user_id, organization_id")
        .limit(5);
      console.log(`🔍 Sample memberships in database:`, allMemberships);
      return undefined;
    }
    
    const orgId = data[0]?.organization_id;
    console.log(`✅ Found organization ID: ${orgId} for user ${uid}`);
    return orgId as string | undefined;
  } catch (error) {
    console.error("Error in getMembershipOrgId:", error);
    return undefined;
  }
}

export async function requireRole(s: any, role: "owner"|"admin") {
  const uid = (await s.auth.getUser()).data.user?.id;
  if (!uid) return false;
  const { data } = await s.from("organization_memberships").select("role").limit(1);
  return ["owner","admin"].includes(data?.[0]?.role || "");
}
