import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const payload = await req.json();
    console.log('[Sync Lead] Received payload:', payload);

    const {
      full_name,
      contact_email,
      contact_phone,
      source,
      stage,
      assigned_rep_id,
      notes,
      priority,
      vehicle_of_interest,
      trade_in_details
    } = payload;

    const { error } = await supabase.from('leads').insert([
      {
        full_name,
        contact_email,
        contact_phone,
        source,
        stage,
        assigned_rep_id,
        data: {
          notes,
          priority,
          vehicle_of_interest,
          trade_in_details
        }
      }
    ]);

    if (error) {
      console.error('[Supabase Insert Error]', error);
      return NextResponse.json({ success: false, error: error.message, debug: error }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error('[API Error]', err.message, err);
    return NextResponse.json({ success: false, error: err.message, debug: err }, { status: 500 });
  }
}
