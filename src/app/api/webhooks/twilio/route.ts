import { NextResponse } from 'next/server';
import { createSafeSupabaseClient } from '@/lib/supabase-safe';

export async function POST(req: Request) {
  const supabase = createSafeSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  // Twilio sends data as x-www-form-urlencoded
  const body = await req.text();
  const params = new URLSearchParams(body);
  const from = params.get('From');
  const to = params.get('To');
  const text = params.get('Body');

  // Find lead by phone number (assuming 'contact' field matches)
  const { data: lead } = await supabase
    .from('leads')
    .select('id')
    .eq('contact', from)
    .single();

  if (!lead) {
    return NextResponse.json({ error: 'Lead not found for incoming SMS' }, { status: 404 });
  }

  // Insert inbound message
  await supabase.from('messages').insert([
    {
      lead_id: lead.id,
      action_type: 'sms',
      contact: from,
      content: text,
      rep_id: null,
      direction: 'inbound',
      metadata: {}
    }
  ]);

  return NextResponse.json({ success: true });
}
