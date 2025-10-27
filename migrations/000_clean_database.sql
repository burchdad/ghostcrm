-- Clean Database Script
-- This will drop all existing tables and start fresh

-- Drop all existing tables (based on the visible tables in Supabase)
DROP TABLE IF EXISTS activity_log_cold CASCADE;
DROP TABLE IF EXISTS activity_log_warm CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS call_logs_cold CASCADE;
DROP TABLE IF EXISTS call_logs_warm CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS contacts_duplicates_backup CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS memberships CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS messages_cold CASCADE;
DROP TABLE IF EXISTS messages_warm CASCADE;
DROP TABLE IF EXISTS org_provider_secrets CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop any remaining sequences, functions, or triggers
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;

-- Comment to confirm clean state
COMMENT ON SCHEMA public IS 'Fresh schema - ready for GhostCRM migrations';