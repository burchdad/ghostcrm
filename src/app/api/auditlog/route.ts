import { NextResponse } from "next/server";

export async function GET() {
  // Mock audit log data
  return NextResponse.json({
    records: [
      { id: 1, event: "User logged in", action: "login" },
      { id: 2, event: "Dashboard viewed", action: "view" }
    ]
  });
}
