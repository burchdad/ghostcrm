import { NextRequest, NextResponse } from "next/server";

// Scaffolded admin/org check
function isAdmin(req: NextRequest) {
  // TODO: Replace with real auth logic
  return true;
}
function getOrgFromReq(req: NextRequest) {
  // TODO: Replace with real org extraction logic
  return req.nextUrl.searchParams.get("org") || "";
}

// GET: List deals for org
export async function GET(req: NextRequest) {
  const org = getOrgFromReq(req);
  // Simulate deals data
  const data = [
    { id: 1, org: "org1", value: 50000, winRate: 60, stage: 3 },
    { id: 2, org: "org2", value: 75000, winRate: 72, stage: 5 },
  ];
  const filtered = org ? data.filter(d => d.org === org) : data;
  return NextResponse.json({ records: filtered });
}

// POST: Bulk create/update deals for org
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const body = await req.json();
  const org = body.org || "";
  const records = body.records || [];
  // Simulate upsert
  return NextResponse.json({ success: true });
}

// DELETE: Bulk delete deals for org
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const body = await req.json();
  const org = body.org || "";
  const ids = body.ids || [];
  // Simulate delete
  return NextResponse.json({ success: true });
}

// PATCH: Bulk update deals for org
export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const body = await req.json();
  const org = body.org || "";
  const ids = body.ids || [];
  // Simulate bulk update
  return NextResponse.json({ success: true });
}
