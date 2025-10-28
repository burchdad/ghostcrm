import { NextResponse } from 'next/server';
import { createSafeSupabaseClient } from '@/lib/supabase-safe';


export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  const supabase = createSafeSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  // SendGrid Inbound Parse sends multipart/form-data
  // For MVP, assume JSON body with 'from', 'to', 'subject', 'text'
  const data = await req.json();
  const from = data.from;
  const to = data.to;
  const text = data.text;

  // Find lead by email (assuming 'contact' field matches)
  const { data: lead } = await supabase
    .from('leads')
    .select('id')
    .eq('contact', from)
    .single();

  if (!lead) {
    return NextResponse.json({ error: 'Lead not found for incoming email' }, { status: 404 });
  }

  // Insert inbound message
  await supabase.from('messages').insert([
    {
      lead_id: lead.id,
      action_type: 'email',
      contact: from,
      content: text,
      rep_id: null,
      direction: 'inbound',
      metadata: {}
    }
  ]);

  return NextResponse.json({ success: true });
}

