import { NextRequest, NextResponse } from 'next/server';
import { supaFromReq } from '@/lib/supa-ssr';
import { isDemoLogin, handleDemoLogin, DEMO_CREDENTIALS } from '@/lib/demo/demo-data-provider';


export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabaseResponse = supaFromReq(request);
    const supabase = supabaseResponse.s;

    // Check if this is a demo login
    if (isDemoLogin(email, password)) {
      console.log('🎬 [DEMO] Demo login detected, initializing demo environment...');
      
      try {
        const demoResult = await handleDemoLogin(request, supabase);
        
        return NextResponse.json({
          success: true,
          demo_mode: true,
          user: demoResult.user,
          organization: demoResult.organization,
          message: 'Demo environment initialized successfully'
        });
        
      } catch (demoError) {
        console.error('❌ [DEMO] Demo initialization failed:', demoError);
        
        // Fallback to regular login if demo setup fails
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          return NextResponse.json(
            { error: error.message },
            { status: 401 }
          );
        }

        return NextResponse.json({
          success: true,
          demo_mode: true,
          user: data.user,
          message: 'Demo login successful (fallback mode)'
        });
      }
    }

    // Regular login flow
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    // Get user's organization
    const { data: orgData } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', data.user.user_metadata?.organization_id)
      .single();

    return NextResponse.json({
      success: true,
      demo_mode: false,
      user: data.user,
      organization: orgData,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('❌ [AUTH] Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check demo credentials or reset demo data
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'demo-info') {
    return NextResponse.json({
      demo_credentials: {
        email: DEMO_CREDENTIALS.email,
        password: DEMO_CREDENTIALS.password,
        organization: DEMO_CREDENTIALS.organizationName
      },
      instructions: 'Use these credentials to access the demo environment'
    });
  }

  if (action === 'reset-demo') {
    try {
      const supabaseResponse = supaFromReq(request);
      const supabase = supabaseResponse.s;
      
      // Get demo organization
      const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('subdomain', DEMO_CREDENTIALS.subdomain)
        .single();

      if (orgData) {
        // Re-initialize demo data
        const { data: userData } = await supabase.auth.signInWithPassword({
          email: DEMO_CREDENTIALS.email,
          password: DEMO_CREDENTIALS.password
        });

        if (userData?.user) {
          await handleDemoLogin(request, supabase);
          
          return NextResponse.json({
            success: true,
            message: 'Demo data reset successfully'
          });
        }
      }

      return NextResponse.json(
        { error: 'Demo environment not found' },
        { status: 404 }
      );

    } catch (error) {
      console.error('❌ [DEMO] Reset error:', error);
      return NextResponse.json(
        { error: 'Failed to reset demo data' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    message: 'Demo Login API',
    endpoints: {
      'POST /': 'Login with credentials (auto-detects demo)',
      'GET /?action=demo-info': 'Get demo credentials',
      'GET /?action=reset-demo': 'Reset demo data'
    }
  });
}
