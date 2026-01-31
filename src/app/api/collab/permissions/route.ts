import { NextResponse } from 'next/server';
import { createSafeSupabaseClient } from '@/lib/supabase-safe';


export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  const supabase = createSafeSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ status: 'error', error: 'Supabase not configured' }, { status: 500 });
  }

  const body = await req.json();
  const { user_id, role, permission, dashboard_id, view_id } = body;
  // Use a composite unique constraint in your table for (user_id, dashboard_id, view_id) if needed
  const { data, error } = await supabase
    .from('collab_permissions')
    .upsert([{ user_id, role, permission, dashboard_id, view_id }], { onConflict: 'user_id' });
  if (error) return NextResponse.json({ status: 'error', error: error.message }, { status: 500 });
  return NextResponse.json({ status: 'ok', data });
}

