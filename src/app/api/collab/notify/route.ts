import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
  const body = await req.json();
  const { user_id, channel, type, message } = body;
  // Insert notification into Supabase
  const { data, error } = await supabase
    .from('collab_notifications')
    .insert([{ user_id, channel, type, message }]);
  if (error) return NextResponse.json({ status: 'error', error: error.message }, { status: 500 });
  // TODO: Add logic to send notification via channel (email, Slack, SMS)
  return NextResponse.json({ status: 'ok', data });
}
