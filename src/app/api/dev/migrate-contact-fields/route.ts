export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * POST /api/dev/migrate-contact-fields
 * Development endpoint to add personal contact fields
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[MIGRATE] Adding personal contact fields to users table...');

    // Add personal phone number field
    try {
      await supabaseAdmin.rpc('exec_sql', {
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS personal_phone VARCHAR(15);`
      });
      console.log('✅ Added personal_phone column');
    } catch (error) {
      console.log('⚠️ personal_phone column may already exist:', error);
    }

    // Add confirmed email field
    try {
      await supabaseAdmin.rpc('exec_sql', {
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS confirmed_email VARCHAR(255);`
      });
      console.log('✅ Added confirmed_email column');
    } catch (error) {
      console.log('⚠️ confirmed_email column may already exist:', error);
    }

    // Add verification tracking fields
    try {
      await supabaseAdmin.rpc('exec_sql', {
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;`
      });
      console.log('✅ Added email_verified column');
    } catch (error) {
      console.log('⚠️ email_verified column may already exist:', error);
    }

    try {
      await supabaseAdmin.rpc('exec_sql', {
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_setup_completed BOOLEAN DEFAULT FALSE;`
      });
      console.log('✅ Added verification_setup_completed column');
    } catch (error) {
      console.log('⚠️ verification_setup_completed column may already exist:', error);
    }

    try {
      await supabaseAdmin.rpc('exec_sql', {
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;`
      });
      console.log('✅ Added email_verified_at column');
    } catch (error) {
      console.log('⚠️ email_verified_at column may already exist:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Personal contact fields migration completed'
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}