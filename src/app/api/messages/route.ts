import { NextResponse } from "next/server";

export async function GET() {
  // Mock messages data
  return NextResponse.json({
    records: [
      { id: 1, text: "Welcome to GhostCRM!", subject: "Getting Started", direction: "inbound" },
      { id: 2, text: "Your dashboard is ready.", subject: "Setup Complete", direction: "outbound" }
    ]
  });
}
