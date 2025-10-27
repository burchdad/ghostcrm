import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
  const body = await req.json();
  const { user_id, action, target, source, item_type, item_id } = body;
  const { data, error } = await supabase
    .from('collab_activity')
    .insert([{ user_id, action, target, source, item_type, item_id }]);
  if (error) return NextResponse.json({ status: 'error', error: error.message }, { status: 500 });
  return NextResponse.json({ status: 'ok', data });
}
