import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase/admin'


export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { subdomain } = await request.json()

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomain is required' },
        { status: 400 }
      )
    }

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9-]+$/
    if (!subdomainRegex.test(subdomain) || subdomain.length < 3 || subdomain.length > 30) {
      return NextResponse.json(
        { 
          available: false, 
          error: 'Subdomain must be 3-30 characters and contain only lowercase letters, numbers, and hyphens' 
        },
        { status: 400 }
      )
    }

    // Check for reserved subdomains
    const reservedSubdomains = [
      'admin', 'api', 'app', 'www', 'mail', 'ftp', 'blog', 'shop', 'store',
      'support', 'help', 'docs', 'status', 'cdn', 'assets', 'static',
      'ghost', 'crm', 'dashboard', 'login', 'register', 'auth', 'oauth',
      'webhooks', 'callback', 'dev', 'staging', 'prod', 'production'
    ]

    if (reservedSubdomains.includes(subdomain)) {
      return NextResponse.json({
        available: false,
        error: 'This subdomain is reserved'
      })
    }

    const supabase = supabaseAdmin

    // Check if subdomain already exists
    const { data: existingOrg, error: queryError } = await supabase
      .from('organizations')
      .select('id')
      .eq('subdomain', subdomain)
      .maybeSingle()

    if (queryError) {
      console.error('Database query error:', queryError)
      return NextResponse.json(
        { error: 'Failed to check subdomain availability' },
        { status: 500 }
      )
    }

    const available = !existingOrg

    return NextResponse.json({
      available,
      subdomain,
      ...(available 
        ? { message: 'Subdomain is available' }
        : { error: 'Subdomain is already taken' }
      )
    })

  } catch (error) {
    console.error('Subdomain check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
