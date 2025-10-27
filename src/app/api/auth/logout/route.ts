import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  console.log("🚪 [LOGOUT] Processing logout request...");
  
  // CSRF origin check
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.NEXT_PUBLIC_DEPLOY_URL,
    "http://localhost:3000",
    "http://localhost:3001",
    "https://ghostcrm.com"
  ];
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";
  if (!allowedOrigins.some(o => origin.startsWith(o))) {
    console.log("❌ [LOGOUT] Invalid origin:", origin);
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  
  try {
    // Try to decode the JWT to get user info
    let userEmail = null;
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc: any, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
      }, {});
      
      const token = cookies.ghostcrm_jwt;
      if (token && process.env.JWT_SECRET) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
          userEmail = decoded.email;
          console.log("👤 [LOGOUT] User email from JWT:", userEmail);
        } catch (jwtError) {
          console.log("⚠️ [LOGOUT] JWT decode failed:", jwtError);
        }
      }
    }
    
    console.log("✅ [LOGOUT] Logout processed successfully");
    
    const res = NextResponse.json({ ok: true });
    res.headers.set("Set-Cookie", "ghostcrm_jwt=; HttpOnly; Secure; Path=/; Max-Age=0; SameSite=Strict");
    
    console.log("🍪 [LOGOUT] JWT cookie cleared");
    return res;
    
  } catch (error: any) {
    console.error("❌ [LOGOUT] Error:", error);
    const res = NextResponse.json({ ok: true }); // Still return ok for logout
    res.headers.set("Set-Cookie", "ghostcrm_jwt=; HttpOnly; Secure; Path=/; Max-Age=0; SameSite=Strict");
    return res;
  }
}
