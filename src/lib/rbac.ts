
export async function getMembershipOrgId(s: any) {
  const { data } = await s.from("memberships").select("organization_id").limit(1);
  return data?.[0]?.organization_id as string | undefined;
}

export async function requireRole(s: any, role: "owner"|"admin") {
  const uid = (await s.auth.getUser()).data.user?.id;
  if (!uid) return false;
  const { data } = await s.from("memberships").select("role").limit(1);
  return ["owner","admin"].includes(data?.[0]?.role || "");
}
