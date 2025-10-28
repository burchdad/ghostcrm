import { NextResponse } from 'next/server';
import { createSafeSupabaseClient } from '@/lib/supabase-safe';


export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  const supabase = createSafeSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ status: 'error', error: 'Supabase not configured' }, { status: 500 });
  }

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

