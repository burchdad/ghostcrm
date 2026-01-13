// DEPRECATED: Use @/utils/supabase/client instead to prevent multiple instances
import { createClient } from '@/utils/supabase/client';

// Re-export the singleton client
export const supabase = createClient();
