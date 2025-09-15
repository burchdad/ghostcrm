

import { NextRequest, NextResponse } from "next/server";
import Airtable from "airtable";
// Scaffolded admin/org check
function isAdmin(req: NextRequest) {
  // TODO: Replace with real auth logic
  return true;
}
function getOrgFromReq(req: NextRequest) {
  // TODO: Replace with real org extraction logic
  const url = req.nextUrl || new URL(req.url);
  return url.searchParams.get("org") || "";
}

export async function GET(req: NextRequest) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;
  const url = req.nextUrl || new URL(req.url);
  const tableName = url.searchParams.get("table") || "Leads";
  const org = getOrgFromReq(req);

  if (!baseId || !apiKey) {
    return NextResponse.json({ error: "Missing Airtable credentials" }, { status: 500 });
  }

  const base = new Airtable({ apiKey }).base(baseId);
  const records: any[] = [];
  try {
    await base(tableName)
      .select({ maxRecords: 50 })
      .eachPage((pageRecords, fetchNextPage) => {
        records.push(...pageRecords.map(r => ({ id: r.id, ...r.fields })));
        fetchNextPage();
      });
    // Org filter (scaffolded)
    const filtered = org ? records.filter(r => r.tags && r.tags.includes(org)) : records;
    return NextResponse.json({ records: filtered });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}

// POST: Bulk create/update leads for org
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const baseId = process.env.AIRTABLE_BASE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;
  const url = req.nextUrl || new URL(req.url);
  const tableName = url.searchParams.get("table") || "Leads";
  const org = getOrgFromReq(req);
  const body = await req.json();
  const leads = body.leads || [];
  if (!baseId || !apiKey) {
    return NextResponse.json({ error: "Missing Airtable credentials" }, { status: 500 });
  }
  const base = new Airtable({ apiKey }).base(baseId);
  try {
    // Upsert leads (scaffolded)
    await Promise.all(leads.map(async l => {
      await base(tableName).create([{ fields: { ...l, tags: [...(l.tags || []), org] } }]);
    }));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}

// DELETE: Bulk delete leads for org
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const baseId = process.env.AIRTABLE_BASE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;
  const url = req.nextUrl || new URL(req.url);
  const tableName = url.searchParams.get("table") || "Leads";
  const org = getOrgFromReq(req);
  const body = await req.json();
  const ids = body.ids || [];
  if (!baseId || !apiKey) {
    return NextResponse.json({ error: "Missing Airtable credentials" }, { status: 500 });
  }
  const base = new Airtable({ apiKey }).base(baseId);
  try {
    await Promise.all(ids.map(async id => {
      await base(tableName).destroy(id);
    }));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}

// PATCH: Bulk assign leads for org
export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const baseId = process.env.AIRTABLE_BASE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;
  const url = req.nextUrl || new URL(req.url);
  const tableName = url.searchParams.get("table") || "Leads";
  const org = getOrgFromReq(req);
  const body = await req.json();
  const ids = body.ids || [];
  const rep = body.rep || "";
  if (!baseId || !apiKey) {
    return NextResponse.json({ error: "Missing Airtable credentials" }, { status: 500 });
  }
  const base = new Airtable({ apiKey }).base(baseId);
  try {
    await Promise.all(ids.map(async id => {
      await base(tableName).update(id, { "Assigned Rep": rep });
    }));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}

