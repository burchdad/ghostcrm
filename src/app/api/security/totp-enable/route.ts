import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, isAuthenticated } from "@/lib/auth/server";

export async function POST(req: NextRequest) {
  try {
    // Check authentication using JWT
    if (!(await isAuthenticated(req))) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Get user data from JWT
    const user = await getUserFromRequest(req);
    if (!user || !user.id) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "Code required" }, { status: 400 });
    }

    // Mock TOTP verification for now
    const mockSecret = "JBSWY3DPEHPK3PXP";
    const isValid = String(code).length === 6; // Simple validation for demo

    if (!isValid) {
      return NextResponse.json({ error: "invalid_code" }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (e: any) {
    console.error("TOTP enable error:", e);
    return NextResponse.json({ error: "TOTP enable failed" }, { status: 500 });
  }
}
