import { NextResponse } from "next/server";

export async function POST() {
  const isProd = process.env.NODE_ENV === "production";
  const cookieOptions = [
    "ghostcrm_jwt=",
    "HttpOnly",
    isProd ? "Secure" : "", // Only secure in production
    "Path=/",
    "Max-Age=0",
    "SameSite=Lax"
  ].filter(Boolean).join("; ");
  
  // Clear JWT cookie
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Set-Cookie": cookieOptions
    }
  });
}
