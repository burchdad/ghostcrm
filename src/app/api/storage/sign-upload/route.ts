import { NextRequest, NextResponse } from "next/server";
import { supaFromReq } from "@/lib/supa-ssr";

export async function POST(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const { filename } = await req.json();
  const { data: mem } = await s.from("memberships").select("organization_id").limit(1);
  const org_id = mem?.[0]?.organization_id;
  if (!org_id) return NextResponse.json({ error:"no_membership" },{ status:403 });

  const key = `org/${org_id}/${Date.now()}_${filename}`;
  const { data, error } = await s.storage.from("attachments").createSignedUploadUrl(key);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ key, url: data.signedUrl }, { headers: res.headers });
}
