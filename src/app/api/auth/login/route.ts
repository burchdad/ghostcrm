export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/utils/supabase/server";
import { limitKey } from "@/lib/rateLimitEdge";

export async function POST(req: NextRequest) {
  console.log('🚀 [LOGIN] Starting Supabase auth login process...');
  
  try {
    const { email, password } = await req.json();
    
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

    // Create Supabase server client
    const supabase = await createSupabaseServer();
    
    // Authenticate with Supabase
    console.log('🔐 [LOGIN] Authenticating with Supabase...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailNorm,
      password: password
    });

    if (error || !data.user) {
      console.log('❌ [LOGIN] Supabase authentication failed:', error?.message);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    console.log('✅ [LOGIN] Supabase authentication successful:', {
      userId: data.user.id,
      email: data.user.email
    });

    // Get user profile from database to get role and organization
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("id, email, role, organization_id")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      console.log('⚠️ [LOGIN] Could not fetch user profile, using basic info');
    }

    // Get tenant context from request headers (subdomain)
    const hostname = req.headers.get('host') || '';
    const subdomain = hostname.split('.')[0];
    
    // Determine tenant/organization ID
    let tenantId = userProfile?.organization_id || 'default-org';
    let organizationId = userProfile?.organization_id || 'default-org';
    
    // If we have a subdomain (not localhost), use it as tenant context
    if (subdomain && subdomain !== 'localhost' && subdomain !== hostname && hostname.includes('localhost')) {
      tenantId = subdomain;
      organizationId = subdomain;
    }

    // Update user metadata with tenant info for RLS
    await supabase.auth.updateUser({
      data: {
        tenant_id: tenantId,
        organization_id: organizationId,
        role: userProfile?.role || 'user'
      }
    });

    console.log('✅ [LOGIN] Login successful');
    
    return NextResponse.json({ 
      success: true, 
      user: { 
        id: data.user.id, 
        email: data.user.email, 
        role: userProfile?.role || 'user',
        organizationId: organizationId,
        tenantId: tenantId
      } 
    });
    
  } catch (error) {
    console.error('💥 [LOGIN] Unexpected error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
