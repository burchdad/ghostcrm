import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { createClient } from "@supabase/supabase-js";
import { getUserFromRequest, isAuthenticated } from "@/lib/auth/server";

// Create a service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    // Check authentication using JWT
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Get user data from JWT
    const user = getUserFromRequest(req);
    if (!user || !user.id) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    // Return mock QR code for now
    const mockSecret = "JBSWY3DPEHPK3PXP";
    const otpauth = `otpauth://totp/GhostCRM:${user.email}?secret=${mockSecret}&issuer=GhostCRM`;
    const png = await QRCode.toDataURL(otpauth);
    const b64 = png.split(",")[1];
    return new NextResponse(Buffer.from(b64, "base64"), { 
      status: 200, 
      headers: { "Content-Type": "image/png" } 
    });

  } catch (e: any) {
    console.error("TOTP QR generation error:", e);
    return NextResponse.json({ error: "QR generation failed" }, { status: 500 });
  }
}