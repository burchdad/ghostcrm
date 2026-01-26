import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        role: user.user_metadata?.role,
        first_name: user.user_metadata?.first_name,
        last_name: user.user_metadata?.last_name,
      }
    });
  } catch (error) {
    console.error('Error checking user verification status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}