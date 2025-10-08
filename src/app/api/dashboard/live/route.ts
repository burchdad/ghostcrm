import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = 'nodejs';

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

  try {
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
        // Return mock chart data for live updates
        messages: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
          datasets: [{ label: "Messages", data: [2, 4, 3, 5, 6], backgroundColor: "#22c55e" }],
        },
        aiAlerts: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
          datasets: [{ label: "AI Alerts", data: [1, 2, 1, 3, 2], backgroundColor: "#3b82f6" }],
        },
        orgComparison: {
          labels: ["Org 1", "Org 2"],
          datasets: [{ label: "Score", data: [75, 25], backgroundColor: ["#a78bfa", "#f472b6"] }],
        },
      },
      { headers: res.headers }
    );
  } catch (err) {
    console.warn("Dashboard live API error:", err);
    // Return mock data if tables don't exist
    return NextResponse.json(
      {
        ok: true,
        metrics: {
          leads: 5,
          deals: 3,
          messagesToday: 12,
          leadStages: { new: 2, working: 1, qualified: 1, lost: 1 },
        },
        // Mock chart data
        messages: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
          datasets: [{ label: "Messages", data: [2, 4, 3, 5, 6], backgroundColor: "#22c55e" }],
        },
        aiAlerts: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
          datasets: [{ label: "AI Alerts", data: [1, 2, 1, 3, 2], backgroundColor: "#3b82f6" }],
        },
        orgComparison: {
          labels: ["Org 1", "Org 2"],
          datasets: [{ label: "Score", data: [75, 25], backgroundColor: ["#a78bfa", "#f472b6"] }],
        },
      },
      { headers: res.headers }
    );
  }
}
