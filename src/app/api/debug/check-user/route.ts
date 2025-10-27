import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Debug endpoint to check database state during testing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      )
    }

    console.log("🔍 [DEBUG] Checking database for email:", email)

    // Check users table
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())

    console.log("👤 [DEBUG] Users query result:", { 
      users: users || [], 
      error: usersError ? usersError.message : "NO_ERROR" 
    })

    // Check audit_events table
    const { data: auditEvents, error: auditError } = await supabaseAdmin
      .from('audit_events')
      .select('*')
      .eq('diff->email', email.toLowerCase().trim())
      .order('created_at', { ascending: false })
      .limit(10)

    console.log("📊 [DEBUG] Audit events query result:", { 
      events: auditEvents || [], 
      error: auditError ? auditError.message : "NO_ERROR" 
    })

    // Check organization_memberships if user exists
    let memberships = []
    if (users && users.length > 0) {
      const { data: membershipData, error: membershipError } = await supabaseAdmin
        .from('organization_memberships')
        .select('*')
        .eq('user_id', users[0].id)

      console.log("🏢 [DEBUG] Membership query result:", { 
        memberships: membershipData || [], 
        error: membershipError ? membershipError.message : "NO_ERROR" 
      })
      
      memberships = membershipData || []
    }

    return NextResponse.json({
      success: true,
      email: email,
      data: {
        users: users || [],
        auditEvents: auditEvents || [],
        memberships: memberships,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error("💥 [DEBUG] Error checking database:", error)
    return NextResponse.json(
      { error: 'Database check failed', detail: error.message },
      { status: 500 }
    )
  }
}