-- Clear Registration Data Script
-- Run this in Supabase SQL Editor to clear all registration-related data
-- WARNING: This will delete ALL user data, organizations, subdomains, and audit logs

-- Disable RLS temporarily for cleanup (re-enable at end)
SET session_replication_role = replica;

-- Clear data in dependency order (child tables first)
-- 1. Clear audit events (references users and organizations)
DELETE FROM audit_events 
WHERE action = 'register' OR entity = 'user' OR entity = 'organization';

-- 2. Clear organization memberships (references users and organizations)  
DELETE FROM organization_memberships;

-- 3. Clear subdomains (references organizations)
DELETE FROM subdomains;

-- 4. Clear users (may be referenced by other tables)
DELETE FROM users;

-- 5. Clear organizations (may be referenced by other tables)
DELETE FROM organizations;

-- Optional: Reset auto-increment sequences if using SERIAL columns
-- Uncomment these if you want to reset ID sequences to start from 1
-- ALTER SEQUENCE users_id_seq RESTART WITH 1;
-- ALTER SEQUENCE organizations_id_seq RESTART WITH 1;
-- ALTER SEQUENCE organization_memberships_id_seq RESTART WITH 1;
-- ALTER SEQUENCE audit_events_id_seq RESTART WITH 1;
-- ALTER SEQUENCE subdomains_id_seq RESTART WITH 1;

-- Re-enable RLS
SET session_replication_role = DEFAULT;

-- Verify cleanup
SELECT 
  'users' as table_name, 
  COUNT(*) as remaining_records 
FROM users
UNION ALL
SELECT 
  'organizations' as table_name, 
  COUNT(*) as remaining_records 
FROM organizations  
UNION ALL
SELECT 
  'organization_memberships' as table_name, 
  COUNT(*) as remaining_records 
FROM organization_memberships
UNION ALL
SELECT 
  'subdomains' as table_name, 
  COUNT(*) as remaining_records 
FROM subdomains
UNION ALL
SELECT 
  'audit_events' as table_name, 
  COUNT(*) as remaining_records 
FROM audit_events
WHERE action = 'register' OR entity = 'user' OR entity = 'organization';

-- Expected result: All counts should be 0