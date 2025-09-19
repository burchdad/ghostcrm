import { NextResponse } from "next/server";

export async function POST() {
  // Clear JWT cookie
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Set-Cookie": "ghostcrm_jwt=; HttpOnly; Secure; Path=/; Max-Age=0; SameSite=Strict"
    }
  });
}
