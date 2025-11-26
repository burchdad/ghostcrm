import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken, hasJwtSecret } from '@/lib/jwt';
import { createSupabaseServer } from '@/utils/supabase/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    // Check for JWT_SECRET
    if (!hasJwtSecret()) {
      console.error('❌ [AUTH/ME] JWT_SECRET not configured in environment');
      return NextResponse.json({ 
        error: 'Server configuration error',
        user: null 
      }, { status: 500 });
    }
    
    // Get JWT cookie
    const token = req.cookies.get('ghostcrm_jwt')?.value;
    
    if (!token) {
      // Silent return for unauthenticated users - this is normal behavior
      return NextResponse.json({ user: null }, { status: 200 });
    }
    
    // Decode JWT using shared utility
    const decoded = verifyJwtToken(token);
    
    if (!decoded) {
      // Only log errors for invalid tokens, not missing ones
      console.log('⚠️ [AUTH/ME] Invalid JWT token found');
      return NextResponse.json({ user: null }, { status: 401 });
    }
    
    // Get organization subdomain if user has an organization
    let organizationSubdomain = null;
    if (decoded.organizationId) {
      try {
        // Use service role to bypass RLS for organization lookup
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        
        const { data: org, error } = await supabaseAdmin
          .from('organizations')
          .select('subdomain')
          .eq('id', decoded.organizationId)
          .single();
        
        if (error) {
          console.warn('⚠️ [AUTH/ME] Organization query error:', error);
        } else {
          organizationSubdomain = org?.subdomain || null;
          console.log('🏢 [AUTH/ME] Found organization subdomain:', organizationSubdomain);
        }
      } catch (orgError) {
        console.warn('⚠️ [AUTH/ME] Could not fetch organization subdomain:', orgError);
      }
    }
    
    // Only log successful authentications to reduce noise
    console.log('✅ [AUTH/ME] User authenticated:', {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      organizationId: decoded.organizationId,
      organizationSubdomain,
      tenantId: decoded.tenantId
    });
    
    return NextResponse.json({ 
      user: {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        organizationId: decoded.organizationId,
        organizationSubdomain,
        tenantId: decoded.tenantId,
        exp: decoded.exp
      }
    });
    
  } catch (error) {
    console.error('❌ [AUTH/ME] Error checking auth:', error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}