
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
    
    // Query memberships table for this specific user
    const { data, error } = await s
      .from("memberships")
      .select("organization_id")
      .eq("user_id", uid)
      .limit(1);
      
    if (error) {
      console.error("Error querying memberships:", error.message);
      return undefined;
    }
    
    if (!data || data.length === 0) {
      console.warn(`No membership found for user ${uid}`);
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
  const { data } = await s.from("memberships").select("role").limit(1);
  return ["owner","admin"].includes(data?.[0]?.role || "");
}
