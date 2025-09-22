import { NextRequest, NextResponse } from "next/server";
import { supaFromReq } from "@/lib/supa-ssr";

export async function GET(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const key = new URL(req.url).searchParams.get("key") || "";
  const { data: mem } = await s.from("memberships").select("organization_id").limit(1);
  const org_id = mem?.[0]?.organization_id;
  if (!org_id || !key.startsWith(`org/${org_id}/`)) return NextResponse.json({ error:"forbidden" }, { status:403 });

  const { data, error } = await s.storage.from("attachments").createSignedUrl(key, 60);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ url: data.signedUrl }, { headers: res.headers });
}
