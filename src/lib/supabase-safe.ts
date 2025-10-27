import { createClient } from '@supabase/supabase-js';

// Safe Supabase client initialization for API routes
export function createSafeSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // During build time, return null if environment variables are not available
  if (!supabaseUrl || !supabaseServiceKey) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('Supabase environment variables not available');
    }
    return null;
  }

  try {
    return createClient(supabaseUrl, supabaseServiceKey);
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
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