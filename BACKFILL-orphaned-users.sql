-- Step 1: Identify orphaned membership records that reference auth users not in public.users

-- Check organization_memberships orphans
SELECT m.user_id, au.email as auth_email, u.email as public_email
FROM public.organization_memberships m
LEFT JOIN auth.users au ON au.id = m.user_id
LEFT JOIN public.users u ON u.id = m.user_id
WHERE u.id IS NULL;

-- Check tenant_memberships orphans  
SELECT m.user_id, au.email as auth_email, u.email as public_email
FROM public.tenant_memberships m
LEFT JOIN auth.users au ON au.id = m.user_id
LEFT JOIN public.users u ON u.id = m.user_id
WHERE u.id IS NULL;

-- Step 2: Backfill missing public.users with safe defaults (Option A - Sentinel hash)
-- Using a valid but unusable bcrypt hash for NOT NULL password_hash constraint

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
    NULL as tenant_id, -- Will be updated after FK is fixed
    NULL as organization_id, -- Will be updated after FK is fixed
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

-- Step 3: Verify backfill worked - should return 0 rows
SELECT m.user_id, au.email as auth_email, u.email as public_email
FROM public.organization_memberships m
LEFT JOIN auth.users au ON au.id = m.user_id
LEFT JOIN public.users u ON u.id = m.user_id
WHERE u.id IS NULL;

SELECT m.user_id, au.email as auth_email, u.email as public_email  
FROM public.tenant_memberships m
LEFT JOIN auth.users au ON au.id = m.user_id
LEFT JOIN public.users u ON u.id = m.user_id
WHERE u.id IS NULL;