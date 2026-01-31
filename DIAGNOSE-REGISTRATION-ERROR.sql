-- Test script to diagnose the exact registration issue
-- Run this to check what's causing the 500 error

-- 1. Check exact columns in public.users
SELECT 'Current public.users columns:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users' 
ORDER BY ordinal_position;

-- 2. Test if we can INSERT with the same columns registration code uses
SELECT 'Testing INSERT capabilities:' as info;

-- Try a test insert (will rollback) to see what fails
BEGIN;
INSERT INTO public.users (
  email,
  password_hash, 
  role,
  first_name,
  last_name,
  company_name,
  tenant_id,
  totp_secret,
  webauthn_credentials,
  jwt_token,
  organization_id
) VALUES (
  'test@example.com',
  'dummy_hash',
  'owner', 
  'Test',
  'User',
  'Test Company',
  gen_random_uuid(),
  'dummy_secret',
  '[]'::jsonb,
  gen_random_uuid()::text,
  null
) RETURNING id;
ROLLBACK;

-- 3. Check if there are any constraints or triggers that might be failing
SELECT 'Table constraints:' as info;
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints 
WHERE table_schema = 'public' AND table_name = 'users';

SELECT 'REGISTRATION DIAGNOSIS COMPLETE' as status;