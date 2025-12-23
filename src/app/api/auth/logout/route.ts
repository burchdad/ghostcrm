import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";


export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  console.log("🚪 [LOGOUT] Processing logout request...");
  
  // CSRF protection - Allow subdomain tenants
  const allowedOrigins: string[] = [
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.NEXT_PUBLIC_DEPLOY_URL,
    "http://localhost:3000",
    "http://localhost:3001",
    "https://ghostcrm.com",
    "https://ghostcrm.ai",
    "https://www.ghostcrm.ai"
  ].filter((url): url is string => Boolean(url)); // Remove undefined values with type guard
  
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";
  
  // Allow any *.ghostcrm.ai subdomain
  const isValidSubdomain = origin.includes('.ghostcrm.ai') || origin.includes('ghostcrm.ai');
  const isAllowedOrigin = allowedOrigins.some(o => origin.startsWith(o));
  
  if (origin && !isAllowedOrigin && !isValidSubdomain) {
    console.log("❌ [LOGOUT] Invalid origin:", origin);
    console.log("❌ [LOGOUT] Allowed origins:", allowedOrigins);
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
    
    // Clear JWT cookie with multiple configurations to ensure it's removed
    const isProd = process.env.NODE_ENV === "production";
    const res = NextResponse.json({ ok: true });
    
    // Clear cookie with different path/domain combinations
    const cookieConfigs = [
      // Main cookie clearing
      "ghostcrm_jwt=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax" + (isProd ? "; Secure" : ""),
      // Clear for subdomain
      "ghostcrm_jwt=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Domain=.ghostcrm.ai" + (isProd ? "; Secure" : ""),
      // Clear for specific domain  
      "ghostcrm_jwt=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Domain=ghostcrm.ai" + (isProd ? "; Secure" : ""),
    ];
    
    // Set multiple cookie headers to ensure clearing
    cookieConfigs.forEach((cookieConfig, index) => {
      if (index === 0) {
        res.headers.set("Set-Cookie", cookieConfig);
      } else {
        res.headers.append("Set-Cookie", cookieConfig);
      }
    });
    
    console.log("🍪 [LOGOUT] JWT cookie cleared with multiple configurations");
    return res;
    
  } catch (error: any) {
    console.error("❌ [LOGOUT] Error:", error);
    const isProd = process.env.NODE_ENV === "production";
    const res = NextResponse.json({ ok: true }); // Still return ok for logout
    
    // Clear cookie even on error
    const cookieConfigs = [
      "ghostcrm_jwt=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax" + (isProd ? "; Secure" : ""),
      "ghostcrm_jwt=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Domain=.ghostcrm.ai" + (isProd ? "; Secure" : ""),
      "ghostcrm_jwt=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Domain=ghostcrm.ai" + (isProd ? "; Secure" : ""),
    ];
    
    cookieConfigs.forEach((cookieConfig, index) => {
      if (index === 0) {
        res.headers.set("Set-Cookie", cookieConfig);
      } else {
        res.headers.append("Set-Cookie", cookieConfig);
      }
    });
    
    console.log("🍪 [LOGOUT] JWT cookie cleared (error case)");
    return res;
    return res;
  }
}

