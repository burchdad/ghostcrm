import { getClient } from '@/utils/supabase/client';

// Use singleton Supabase client
export async function createSafeSupabaseClient() {
  return await getClient();
}

// Check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// Error response for when Supabase is not configured
export function createSupabaseNotConfiguredResponse() {
  return Response.json(
    { status: 'error', error: 'Supabase not configured' }, 
    { status: 500 }
  );
}