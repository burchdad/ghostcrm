export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { limitKey } from "@/lib/rateLimitEdge";
import { withCORS } from "@/lib/cors";
import { withErrorHandling, createErrorResponse } from "@/lib/error-handling";
import { handleDemoLogin } from "@/lib/demo/demo-data-provider";

// Get JWT secret with runtime validation
function getJWTSecret() {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable must be set");
  }
  if (JWT_SECRET === "supersecret" || JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be a secure random string (min 32 characters)");
  }
  return JWT_SECRET;
}

async function loginHandler(req: Request) {
  try {
    const { email, password, rememberMe } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const emailNorm = String(email).trim().toLowerCase();
    
    // Check for demo credentials first and populate database
    if (emailNorm === 'demo@ghostcrm.com' && password === 'demo123') {
      console.log('🎬 [DEMO] Demo login detected via main login endpoint, initializing full demo environment...');
      
      try {
        // Use the proper demo login handler that populates the database
        const demoResult = await handleDemoLogin(req, supabaseAdmin);
        
        // Create JWT token for demo user
        const token = jwt.sign(
          { 
            userId: demoResult.user.id, 
            email: demoResult.user.email, 
            role: 'admin',
            orgId: demoResult.organization.id 
          },
          getJWTSecret(),
          { expiresIn: rememberMe ? "30d" : "24h" }
        );
        
        // Set HTTP-only cookie
        const response = NextResponse.json({ 
          success: true, 
          user: {
            id: demoResult.user.id,
            email: demoResult.user.email,
            firstName: 'Demo',
            lastName: 'User',
            dealership: 'Premier Auto Sales',
            role: 'admin',
            orgId: demoResult.organization.id
          },
          demo_mode: true
        });
        
        response.cookies.set("ghostcrm_jwt", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60
        });
        
        console.log('✅ [DEMO] Demo environment fully initialized with database population');
        return response;
        
      } catch (demoError) {
        console.error('❌ [DEMO] Demo initialization failed:', demoError);
        
        // Fallback to simple demo response if database population fails
        const demoUser = {
          id: 'demo-user-id',
          email: 'demo@ghostcrm.com',
          firstName: 'Demo',
          lastName: 'User',
          dealership: 'Ghost Auto Demo Dealership',
          role: 'admin',
          orgId: 'demo-org-id'
        };
        
        const token = jwt.sign(
          { 
            userId: demoUser.id, 
            email: demoUser.email, 
            role: demoUser.role,
            orgId: demoUser.orgId 
          },
          getJWTSecret(),
          { expiresIn: rememberMe ? "30d" : "24h" }
        );
        
        const response = NextResponse.json({ 
          success: true, 
          user: demoUser,
          demo_mode: true
        });
        
        response.cookies.set("ghostcrm_jwt", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60
        });
        
        return response;
      }
    }
    
    // Apply rate limiting based on email and IP
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateKey = `login:${emailNorm}:${clientIP}`;
    
    const rateResult = await limitKey(rateKey);
    if (!rateResult.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." }, 
        { status: 429 }
      );
    }
    
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
      getJWTSecret(),
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
    
    response.cookies.set("ghostcrm_jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // 30 days or 24 hours
    });
    
    return response;
    
  } catch (error) {
    const context = {
      endpoint: '/api/auth/login',
      method: 'POST',
      userAgent: req.headers.get('user-agent') || undefined,
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined
    };
    
    return createErrorResponse(error as Error, context, 500);
  }
}

// Export CORS-protected POST handler
export const POST = withCORS(loginHandler);
