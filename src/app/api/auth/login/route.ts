export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { limitKey } from "@/lib/rateLimitEdge";
import { withCORS } from "@/lib/cors";
import { withErrorHandling, createErrorResponse } from "@/lib/error-handling";

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
  console.log('🚀 [LOGIN] Starting login process...');
  console.log('🔍 [LOGIN] Request details:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });
  
  try {
    const { email, password, rememberMe } = await req.json();
    
    if (!email || !password) {
      console.log('❌ [LOGIN] Missing email or password');
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const emailNorm = String(email).trim().toLowerCase();
    console.log('📧 [LOGIN] Processing login for:', emailNorm);
    
    // Apply rate limiting based on email and IP
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateKey = `login:${emailNorm}:${clientIP}`;
    
    const rateResult = await limitKey(rateKey);
    if (!rateResult.allowed) {
      console.log('❌ [LOGIN] Rate limit exceeded for:', emailNorm);
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." }, 
        { status: 429 }
      );
    }
    
    // Fetch user from Supabase
    console.log('🔍 [LOGIN] Looking up user in database...');
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, email, password_hash, role, organization_id")
      .eq("email", emailNorm)
      .single();
      
    if (!user || userError) {
      console.log('❌ [LOGIN] User lookup failed:', { emailNorm, error: userError });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    
    console.log('✅ [LOGIN] User found:', { id: user.id, email: user.email, role: user.role, hasPassword: !!user.password_hash });
    
    // Verify password
    console.log('🔐 [LOGIN] Verifying password...');
    const valid = await compare(password, user.password_hash);
    console.log('🔐 [LOGIN] Password verification result:', valid);
    
    if (!valid) {
      console.log('❌ [LOGIN] Password verification failed');
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    
    console.log('✅ [LOGIN] Password verified successfully');
    
    // Get tenant context from request headers (subdomain)
    const hostname = req.headers.get('host') || '';
    const subdomain = hostname.split('.')[0];
    
    console.log('🏢 [LOGIN] Hostname analysis:', {
      hostname,
      subdomain,
      isSubdomain: subdomain && subdomain !== 'localhost' && subdomain !== hostname,
      hostnameIncludesLocalhost: hostname.includes('localhost')
    });
    
    // Determine tenant/organization ID
    let tenantId = user.organization_id || 'default-org'; // Default fallback
    let organizationId = user.organization_id || 'default-org';
    
    // If we have a subdomain (not localhost), use it as tenant context
    // For burch-enterprises.localhost:3000, subdomain = 'burch-enterprises'
    if (subdomain && subdomain !== 'localhost' && subdomain !== hostname && hostname.includes('localhost')) {
      tenantId = subdomain;
      organizationId = subdomain;
      console.log('🎯 [LOGIN] Using subdomain as tenant context:', {
        hostname,
        subdomain,
        tenantId,
        organizationId
      });
    } else {
      console.log('🚨 [LOGIN] No subdomain detected, using database org:', {
        hostname,
        subdomain,
        tenantId,
        organizationId,
        userOrgId: user.organization_id
      });
    }
    
    // Create JWT token
    console.log('🎫 [LOGIN] Creating JWT token...');
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        organizationId: organizationId,
        tenantId: tenantId
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
        organizationId: organizationId,
        tenantId: tenantId
      } 
    });
    
    // Cookie settings based on Remember Me choice
    const cookieOptions: any = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/"
    };
    
    // Only set maxAge if Remember Me is checked
    // Without maxAge, cookie becomes a session cookie (expires on browser close)
    if (rememberMe) {
      cookieOptions.maxAge = 30 * 24 * 60 * 60; // 30 days
    }
    // If rememberMe is false, cookie will be a session cookie (no maxAge)
    
    response.cookies.set("ghostcrm_jwt", token, cookieOptions);
    
    console.log('🎉 [LOGIN] Login successful for:', user.email);
    return response;
    
  } catch (error) {
    console.error('💥 [LOGIN] Login error:', error);
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
