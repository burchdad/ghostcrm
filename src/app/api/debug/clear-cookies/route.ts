import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("🗑️ [CLEAR-COOKIES] Clearing all authentication cookies...");
  
  const response = NextResponse.json({ message: "Cookies cleared" });
  
  // Clear the JWT cookie
  response.cookies.set("ghostcrm_jwt", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0 // Expire immediately
  });
  
  // Clear any owner session cookie
  response.cookies.set("owner_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", 
    path: "/",
    maxAge: 0 // Expire immediately
  });
  
  console.log("✅ [CLEAR-COOKIES] All authentication cookies cleared");
  return response;
}