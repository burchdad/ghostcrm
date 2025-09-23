
import { NextRequest } from "next/server";
import { supaFromReq } from "@/lib/supa-ssr";
import { getMembershipOrgId } from "@/lib/rbac";
import { ok, oops } from "@/lib/http";
import { z } from "zod";

const MetricsSchema = z.object({
  leads: z.number(),
  deals: z.number(),
  messagesToday: z.number(),
  leadStages: z.record(z.string(), z.number())
});

export async function GET(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  try {
    const org_id = await getMembershipOrgId(s);
    if (!org_id) return oops("no_membership");

    const todayIso = new Date(new Date().setHours(0,0,0,0)).toISOString();
    const [leads, deals, msgsToday] = await Promise.all([
      s.from("leads").select("id", { count: "exact", head: true }).eq("org_id", org_id),
      s.from("deals").select("id", { count: "exact", head: true }).eq("org_id", org_id),
      s.from("messages").select("id", { count: "exact", head: true }).eq("org_id", org_id).gte("created_at", todayIso),
    ]);

    const stages = ["new","working","qualified","lost"];
    const stageCounts: Record<string, number> = {};
    for (const st of stages) {
      const { count } = await s.from("leads").select("id", { count: "exact", head: true }).eq("org_id", org_id).eq("stage", st);
      stageCounts[st] = count ?? 0;
    }

    const metrics = {
      leads: leads.count ?? 0,
      deals: deals.count ?? 0,
      messagesToday: msgsToday.count ?? 0,
      leadStages: stageCounts
    };
    const parsed = MetricsSchema.safeParse(metrics);
    if (!parsed.success) return oops(parsed.error.errors[0].message);
    return ok({ metrics }, res.headers);
  } catch (e: any) {
    return oops(e?.message || "unknown error");
  }
}
