-- Ensure RLS policies exist for users table to fix 406 profile errors
-- This fixes the "Failed to fetch user profile: 406" errors

-- Enable RLS if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "profiles_select_own" ON public.users;
DROP POLICY IF EXISTS "profiles_update_own" ON public.users;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.users;
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Allow registration" ON public.users;
DROP POLICY IF EXISTS "service_role_full_access" ON public.users;

-- Create bulletproof RLS policies for users table  
CREATE POLICY "profiles_select_own" ON public.users
  FOR SELECT 
  USING (auth.uid() = id::uuid);

CREATE POLICY "profiles_update_own" ON public.users
  FOR UPDATE 
  USING (auth.uid() = id::uuid);

CREATE POLICY "profiles_insert_own" ON public.users
  FOR INSERT 
  WITH CHECK (auth.uid() = id::uuid);

-- Service role can manage all users (for bootstrap API)
CREATE POLICY "service_role_full_access" ON public.users
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Ensure required columns exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS tenant_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS requires_password_reset BOOLEAN DEFAULT false;

-- Grant necessary permissions
GRANT SELECT, UPDATE, INSERT ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- Create index for performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);

COMMENT ON POLICY "profiles_select_own" ON public.users IS 'Users can read their own profile - fixes 406 errors';
COMMENT ON POLICY "profiles_update_own" ON public.users IS 'Users can update their own profile';  
COMMENT ON POLICY "profiles_insert_own" ON public.users IS 'Users can create their own profile during registration';
COMMENT ON POLICY "service_role_full_access" ON public.users IS 'Service role bypass for bootstrap-profile API';