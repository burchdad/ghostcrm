import { NextRequest, NextResponse } from "next/server";
import { supaFromReq } from "@/lib/supa-ssr";
import crypto from "node:crypto";


export const dynamic = 'force-dynamic';
export async function POST(req: NextRequest) {
  const { s, res } = supaFromReq(req);
  const { email, role } = await req.json();
  const { data: mem } = await s.from("memberships").select("organization_id").limit(1);
  const org_id = mem?.[0]?.organization_id;
  if (!org_id) return NextResponse.json({ error:"no_membership" }, { status:403 });

  const token = crypto.randomBytes(24).toString("base64url");
  const { data, error } = await s.from("invites").insert({ org_id, email, role: role ?? "rep", token }).select().single();
  if (error) return NextResponse.json({ error:error.message }, { status:500 });

  // (Optional) email the invite link with SendGrid
  const link = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/join?token=${data.token}`;
  console.log("Invite link:", link);
  return NextResponse.json({ ok:true, link }, { headers: res.headers });
}

