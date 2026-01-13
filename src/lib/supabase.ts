// DEPRECATED: Use @/utils/supabase/client instead to prevent multiple instances
import { getClient } from '@/utils/supabase/client';

// Async getter to prevent multiple instances at module scope
export async function getSupabase() {
  return await getClient();
}
