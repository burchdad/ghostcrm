import { NextRequest, NextResponse } from "next/server";
import { supaFromReq } from "@/lib/supa-ssr";

// ...removed supa, use supaFromReq instead

export async function GET(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const todayIso = new Date(new Date().setHours(0,0,0,0)).toISOString();

  const [leads, deals, msgsToday] = await Promise.all([
    s.from("leads").select("id", { count: "exact", head: true }),
    s.from("deals").select("id", { count: "exact", head: true }),
    s.from("messages").select("id", { count: "exact", head: true }).gte("created_at", todayIso),
  ]);

  const stages = ["new","working","qualified","lost"];
  const stageCounts: Record<string, number> = {};
  for (const st of stages) {
    const { count } = await s.from("leads").select("id", { count: "exact", head: true }).eq("stage", st);
    stageCounts[st] = count ?? 0;
  }

  return NextResponse.json({
    ok: true,
    metrics: {
      leads: leads.count ?? 0,
      deals: deals.count ?? 0,
      messagesToday: msgsToday.count ?? 0,
      leadStages: stageCounts
    }
  }, { headers: res.headers });
}
