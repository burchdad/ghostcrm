import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req: Request) {
  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // Issue new token with updated expiry
    const newToken = jwt.sign({ userId: payload.userId, email: payload.email, role: payload.role }, JWT_SECRET, { expiresIn: "2h" });
    
    const isProd = process.env.NODE_ENV === "production";
    const cookieOptions = [
      `ghostcrm_jwt=${newToken}`,
      "HttpOnly",
      isProd ? "Secure" : "", // Only secure in production
      "Path=/",
      "Max-Age=7200",
      "SameSite=Lax" // Changed from Strict to Lax for better redirect handling
    ].filter(Boolean).join("; ");
    
    const response = NextResponse.json({ token: newToken });
    response.headers.set("Set-Cookie", cookieOptions);
    return response;
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
