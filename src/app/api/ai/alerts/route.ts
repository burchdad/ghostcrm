import { NextResponse } from "next/server";

export async function GET() {
  // Mock AI alerts data
  return NextResponse.json({
    alerts: [
      { id: 1, summary: "Lead engagement spike detected." },
      { id: 2, summary: "Workflow trigger activated." }
    ]
  });
}
