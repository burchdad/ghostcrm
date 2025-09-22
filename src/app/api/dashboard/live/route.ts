import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function supa(req: NextRequest) {
  const res = new NextResponse();
  const s = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cs) => {
          cs.forEach(c => res.cookies.set(c.name, c.value, c.options));
        }
      }
    }
  );
  return { s, res };
}

export async function GET(req: NextRequest) {
  const { s, res } = supa(req);

  const [{ count: leadsCount }, { count: dealsCount }, { count: msgsToday }] = await Promise.all([
    s.from("leads").select("id", { count: "exact", head: true }),
    s.from("deals").select("id", { count: "exact", head: true }),
    s.from("messages").select("id", { count: "exact", head: true }).gte("created_at", new Date(new Date().setHours(0,0,0,0)).toISOString()),
  ]);

  const stages = ["new","working","qualified","lost"];
  const stageCounts: Record<string, number> = {};
  for (const st of stages) {
    const { count } = await s.from("leads").select("id", { count: "exact", head: true }).eq("stage", st);
    stageCounts[st] = count ?? 0;
  }

  return NextResponse.json(
    {
      ok: true,
      metrics: {
        leads: leadsCount ?? 0,
        deals: dealsCount ?? 0,
        messagesToday: msgsToday ?? 0,
        leadStages: stageCounts,
      },
    },
    { headers: res.headers }
  );
}
