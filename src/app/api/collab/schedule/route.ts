import { NextResponse } from 'next/server';
import { createSafeSupabaseClient } from '@/lib/supabase-safe';


export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  const supabase = createSafeSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ status: 'error', error: 'Supabase not configured' }, { status: 500 });
  }

  const body = await req.json();
  const { user_id, target, dashboard_id, view_id, scheduled_time, status } = body;
  
  const { data, error } = await supabase
    .from('collab_scheduled_shares')
    .insert([{ user_id, target, dashboard_id, view_id, scheduled_time, status }]);
  
  if (error) return NextResponse.json({ status: 'error', error: error.message }, { status: 500 });
  
  return NextResponse.json({ status: 'ok', data });
}

