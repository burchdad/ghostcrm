import { createClient } from '@supabase/supabase-js';

// Safe Supabase client creation that handles missing environment variables
export function createSafeSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';
  
  return createClient(supabaseUrl, supabaseKey);
}

// Check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// Error response for when Supabase is not configured
export function createSupabaseNotConfiguredResponse() {
  return Response.json(
    { status: 'error', error: 'Supabase not configured' }, 
    { status: 500 }
  );
}