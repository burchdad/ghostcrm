import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { jwtVerify } from 'jose'

export async function GET(request: NextRequest) {
  try {
    // Get JWT token from cookies
    const cookieStore = request.cookies
    const token = cookieStore.get('ghost_session')?.value
    
    if (!token) {
      return NextResponse.json({ 
        isSoftwareOwner: false, 
        userRole: null,
        error: 'No authentication token' 
      }, { status: 401 })
    }

    // Verify JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    
    const userEmail = payload.email as string
    const userId = payload.userId as string
    
    if (!userEmail || !userId) {
      return NextResponse.json({ 
        isSoftwareOwner: false, 
        userRole: null,
        error: 'Invalid token' 
      }, { status: 401 })
    }

    // Check if user is the software owner
    const softwareOwnerEmail = process.env.SOFTWARE_OWNER_EMAIL || 'admin@ghostcrm.com'
    const isSoftwareOwner = userEmail === softwareOwnerEmail
    
    // Get user profile to check their role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role, is_admin')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.warn('⚠️ [OWNER-CHECK] Profile not found:', profileError.message)
    }

    // Alternative check: user is software owner if they're a global admin
    const isGlobalAdmin = profile?.is_admin === true && profile?.role === 'admin'
    
    const result = {
      isSoftwareOwner: isSoftwareOwner || isGlobalAdmin,
      userRole: profile?.role || payload.role || null,
      isAdmin: profile?.is_admin || false,
      userEmail: userEmail,
      softwareOwnerEmail,
      emailMatch: isSoftwareOwner,
      globalAdmin: isGlobalAdmin
    }
    
    return NextResponse.json(result)

  } catch (error: any) {
    return NextResponse.json({ 
      isSoftwareOwner: false, 
      userRole: null,
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}