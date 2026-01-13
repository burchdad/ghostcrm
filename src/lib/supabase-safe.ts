import { supabaseAdmin } from './supabaseAdmin';

// Use existing admin client instead of creating new ones
export function createSafeSupabaseClient() {
  // During build time, return null if environment variables are not available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('Supabase environment variables not available');
    }
    return null;
  }

  try {
    return supabaseAdmin;
  } catch (error) {
    console.error('Failed to get Supabase admin client:', error);
    return null;
  }
}

// Helper function to handle Supabase operations safely
export async function withSupabase<T>(
  operation: (supabase: any) => Promise<T>,
  fallbackResponse?: T
): Promise<T> {
  const supabase = createSafeSupabaseClient();
  
  if (!supabase) {
    if (fallbackResponse !== undefined) {
      return fallbackResponse;
    }
    throw new Error('Supabase client not available');
  }

  return await operation(supabase);
}