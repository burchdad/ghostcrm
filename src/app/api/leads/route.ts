

import { NextRequest, NextResponse } from "next/server";

import { createServerClient } from "@supabase/ssr";

export async function GET(req: NextRequest) {
  const { s, res } = supa(req);
  const { data, error } = await s
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ records: data ?? [] }, { headers: res.headers });
}
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

// POST: Bulk create/update leads for org
export async function POST(req: NextRequest) {
  const { s, res } = supa(req);
  const body = await req.json();
  const leads = body.leads || [];
  const { error } = await s.from("leads").insert(leads);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true }, { headers: res.headers });
}

// DELETE: Bulk delete leads for org
export async function DELETE(req: NextRequest) {
  const { s, res } = supa(req);
  const body = await req.json();
  const ids = body.ids || [];
  const { error } = await s.from("leads").delete().in("id", ids);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true }, { headers: res.headers });
}

// PATCH: Bulk assign leads for org
export async function PATCH(req: NextRequest) {
  const { s, res } = supa(req);
  const body = await req.json();
  const ids = body.ids || [];
  const rep = body.rep || "";
  const { error } = await s.from("leads").update({ "Assigned Rep": rep }).in("id", ids);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true }, { headers: res.headers });
}

