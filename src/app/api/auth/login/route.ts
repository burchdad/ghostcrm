export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req: Request) {
  try {
    const { email, password, rememberMe } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const emailNorm = String(email).trim().toLowerCase();
    
    // Fetch user from Supabase
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, email, password_hash, role, org_id")
      .eq("email", emailNorm)
      .single();
      
    if (!user || userError) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    
    // Verify password
    const valid = await compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        orgId: user.org_id 
      },
      JWT_SECRET,
      { expiresIn: rememberMe ? "30d" : "24h" }
    );
    
    // Set HTTP-only cookie
    const response = NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        orgId: user.org_id
      } 
    });
    
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // 30 days or 24 hours
    });
    
    return response;
    
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}