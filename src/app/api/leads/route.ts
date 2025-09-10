

import { NextResponse } from "next/server";
import Airtable from "airtable";

export async function GET(request: Request) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;
  const tableName = request.url.split("table=")[1] || "Leads";

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
    return NextResponse.json({ records });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
