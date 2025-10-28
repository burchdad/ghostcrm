import { NextRequest, NextResponse } from "next/server";
import { supaFromReq } from "@/lib/supa-ssr";


export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const { data, error } = await s.from("telecom_providers").select("id, slug, name").order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { headers: res.headers });
}

