import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  // Check if we have valid Supabase credentials
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
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
