import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { tool, data } = body;
  // TODO: Implement integration logic for Google Sheets, Excel, BI
  return NextResponse.json({ status: 'ok', message: `Integration with ${tool} not yet implemented.` });
}
