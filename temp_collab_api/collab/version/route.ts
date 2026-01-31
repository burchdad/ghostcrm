import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
  const body = await req.json();
  const { user_id, dashboard_id, view_id, state, rollback } = body;
  if (rollback) {
    // Fetch latest version for rollback
    const { data, error } = await supabase
      .from('collab_versions')
      .select('*')
      .eq('user_id', user_id)
      .eq('dashboard_id', dashboard_id)
      .eq('view_id', view_id)
      .order('created_at', { ascending: false })
      .limit(1);
    if (error) return NextResponse.json({ status: 'error', error: error.message }, { status: 500 });
    return NextResponse.json({ status: 'ok', rollback: data[0]?.state });
  } else {
    // Save new version
    const { data, error } = await supabase
      .from('collab_versions')
      .insert([{ user_id, dashboard_id, view_id, state }]);
    if (error) return NextResponse.json({ status: 'error', error: error.message }, { status: 500 });
    return NextResponse.json({ status: 'ok', data });
  }
}
