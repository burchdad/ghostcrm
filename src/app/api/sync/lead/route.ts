import { NextResponse } from 'next/server';
import { createSafeSupabaseClient } from '@/lib/supabase-safe';


export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  try {
    const supabase = createSafeSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database service unavailable' },
        { status: 503 }
      );
    }
    const data = await req.json(); // Robust body parsing
    console.log('[RECEIVED PAYLOAD]', JSON.stringify(data, null, 2));

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
    } = data;

    // Map assigned_rep_id from email to UUID if possible
    let rep_uuid = null;
    if (contact_email) {
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', contact_email)
        .single();
      if (userError) {
        console.warn('[PROFILE LOOKUP ERROR]', userError.message);
      }
      rep_uuid = user?.user_id || null;
    }

    const insertData = {
      full_name,
      contact_email,
      contact_phone,
      source,
      stage,
      assigned_rep_id: rep_uuid || assigned_rep_id || null,
      data: {
        notes,
        priority,
        vehicle_of_interest,
        trade_in_details
      }
    };

    console.log('[INSERT TO SUPABASE]', JSON.stringify(insertData, null, 2));

    const { error } = await supabase.from('leads').insert([insertData]);

    if (error) {
      console.error('[SUPABASE INSERT ERROR]', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[WEBHOOK PARSE ERROR]', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

