-- COMPLETE DATABASE FIX: Backfill orphaned users + Fix FK constraints
-- This resolves both the missing public.users records and incorrect FK references

-- PART 1: BACKFILL MISSING public.users RECORDS (fixes orphaned membership references)
-- Current issue: membership tables reference auth.users IDs that don't exist in public.users
-- Solution: Backfill with sentinel values to satisfy NOT NULL constraints

BEGIN;

-- Step 1: Identify orphaned records (for verification)
DO $$ 
DECLARE 
    orphan_count INTEGER;
BEGIN
    SELECT COUNT(DISTINCT m.user_id) INTO orphan_count
    FROM (
        SELECT user_id FROM public.organization_memberships
        UNION
        SELECT user_id FROM public.tenant_memberships  
    ) m
    WHERE NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id = m.user_id);
    
    RAISE NOTICE 'Found % orphaned user IDs in membership tables', orphan_count;
END $$;

-- Step 2: Backfill missing public.users with safe sentinel values
INSERT INTO public.users (
    id, 
    email, 
    password_hash, 
    role, 
    first_name,
    last_name,
    company_name,
    tenant_id,
    organization_id,
    totp_secret,
    webauthn_credentials,
    jwt_token,
    created_at,
    updated_at
)
SELECT 
    au.id,
    au.email,
    '$2a$10$CwTycUXWue0Thq9StjUM0uJ8iQbq7lDq3Yx9Q7mYpXxq8m1lZqD6S' as password_hash, -- Sentinel unusable hash
    'user' as role,
    COALESCE(au.raw_user_meta_data->>'first_name', '') as first_name,
    COALESCE(au.raw_user_meta_data->>'last_name', '') as last_name,  
    COALESCE(au.raw_user_meta_data->>'company_name', '') as company_name,
    NULL as tenant_id, -- Will be updated after organizations are linked
    NULL as organization_id, -- Will be updated after organizations are linked
    'MIGRATED_PLACEHOLDER' as totp_secret,
    '[]'::jsonb as webauthn_credentials,
    gen_random_uuid()::text as jwt_token,
    au.created_at,
    COALESCE(au.updated_at, au.created_at)
FROM auth.users au
WHERE au.id IN (
    -- Get user IDs that exist in membership tables but not in public.users
    SELECT DISTINCT user_id 
    FROM (
        SELECT user_id FROM public.organization_memberships
        UNION
        SELECT user_id FROM public.tenant_memberships
    ) membership_users
    WHERE NOT EXISTS (
        SELECT 1 FROM public.users u WHERE u.id = membership_users.user_id
    )
)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Verify backfill completed (should be 0 orphans now)
DO $$ 
DECLARE 
    remaining_orphans INTEGER;
BEGIN
    SELECT COUNT(DISTINCT m.user_id) INTO remaining_orphans
    FROM (
        SELECT user_id FROM public.organization_memberships
        UNION
        SELECT user_id FROM public.tenant_memberships  
    ) m
    WHERE NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id = m.user_id);
    
    IF remaining_orphans > 0 THEN
        RAISE EXCEPTION 'Backfill incomplete: % orphaned records remain', remaining_orphans;
    ELSE
        RAISE NOTICE 'Backfill successful: All membership records now have corresponding public.users entries';
    END IF;
END $$;

-- PART 2: FIX FOREIGN KEY CONSTRAINTS (now safe to do after backfill)
-- Current: FOREIGN KEY (user_id) REFERENCES auth.users(id) ❌
-- Fixed:   FOREIGN KEY (user_id) REFERENCES public.users(id) ✅

-- Fix organization_memberships FK
ALTER TABLE public.organization_memberships
DROP CONSTRAINT IF EXISTS organization_memberships_user_id_fkey;

ALTER TABLE public.organization_memberships
ADD CONSTRAINT organization_memberships_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.users(id)
ON DELETE CASCADE;

-- Fix tenant_memberships FK  
ALTER TABLE public.tenant_memberships
DROP CONSTRAINT IF EXISTS tenant_memberships_user_id_fkey;

ALTER TABLE public.tenant_memberships
ADD CONSTRAINT tenant_memberships_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.users(id)
ON DELETE CASCADE;

-- Step 4: Verify constraints were created correctly
SELECT 
    conname, 
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conname IN (
    'organization_memberships_user_id_fkey',
    'tenant_memberships_user_id_fkey'
);

COMMIT;

-- VERIFICATION QUERIES (run after transaction completes)
-- These should all return 0 rows if fix was successful:

-- Check for remaining orphaned organization_memberships
-- SELECT m.user_id, au.email as auth_email, u.email as public_email
-- FROM public.organization_memberships m
-- LEFT JOIN auth.users au ON au.id = m.user_id
-- LEFT JOIN public.users u ON u.id = m.user_id
-- WHERE u.id IS NULL;

-- Check for remaining orphaned tenant_memberships  
-- SELECT m.user_id, au.email as auth_email, u.email as public_email
-- FROM public.tenant_memberships m
-- LEFT JOIN auth.users au ON au.id = m.user_id
-- LEFT JOIN public.users u ON u.id = m.user_id
-- WHERE u.id IS NULL;