export async function requireRole(s: any, role: "owner"|"admin") {
  const uid = (await s.auth.getUser()).data.user?.id;
  if (!uid) return false;
  const { data } = await s.from("memberships").select("role").limit(1);
  return ["owner","admin"].includes(data?.[0]?.role || "");
}
