import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
  const body = await req.json();
  const { user_id, filter } = body;
  // Fetch filtered activity log
  let query = supabase.from('collab_activity').select('*');
  if (user_id) query = query.eq('user_id', user_id);
  if (filter) query = query.ilike('action', `%${filter}%`);
  const { data, error } = await query;
  if (error) return NextResponse.json({ status: 'error', error: error.message }, { status: 500 });
  // Return as CSV string
  const csv = data.map(a => `${a.action},${a.target || a.source || ''},${a.created_at}`).join('\n');
  return NextResponse.json({ status: 'ok', csv });
}
