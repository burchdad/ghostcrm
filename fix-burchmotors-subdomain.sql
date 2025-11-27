-- Manual Database Update Script for burchmotors subdomain
-- Run this in your Supabase SQL editor or database client

-- Step 1: Check current status
SELECT 
    id, 
    subdomain, 
    status, 
    organization_id, 
    created_at, 
    updated_at,
    provisioned_at
FROM subdomains 
WHERE subdomain = 'burchmotors';

-- Step 2: Update subdomain to active status
UPDATE subdomains 
SET 
    status = 'active',
    updated_at = NOW(),
    provisioned_at = NOW()
WHERE subdomain = 'burchmotors';

-- Step 3: Verify the update was successful
SELECT 
    id, 
    subdomain, 
    status, 
    organization_id, 
    created_at, 
    updated_at,
    provisioned_at
FROM subdomains 
WHERE subdomain = 'burchmotors';

-- Step 4: Also check what user is associated with this organization
SELECT 
    u.id as user_id,
    u.email,
    u.organization_id,
    o.name as organization_name,
    s.subdomain,
    s.status as subdomain_status
FROM users u
JOIN organizations o ON u.organization_id = o.id  
JOIN subdomains s ON s.organization_id = o.id
WHERE s.subdomain = 'burchmotors';