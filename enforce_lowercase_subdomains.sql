-- Add database constraint to enforce lowercase subdomains
-- This prevents case-sensitivity issues even if application code doesn't enforce it

-- 1) Add check constraint to enforce lowercase on subdomains table
alter table public.subdomains 
add constraint subdomains_lowercase_check 
check (subdomain = lower(subdomain));

-- 2) Add check constraint to enforce lowercase on organizations table  
alter table public.organizations
add constraint organizations_subdomain_lowercase_check
check (subdomain = lower(subdomain));

-- 3) Verify constraints were added
select 
  conname as constraint_name,
  conrelid::regclass as table_name,
  consrc as constraint_definition
from pg_constraint 
where conname like '%lowercase%' 
order by table_name;

-- 4) Test the constraints work (these should fail)
-- insert into public.subdomains (subdomain, organization_id, status) values ('MyCompany', gen_random_uuid(), 'pending'); -- Should fail
-- insert into public.organizations (name, subdomain, owner_id, status) values ('Test', 'MyOrg', gen_random_uuid(), 'active'); -- Should fail

-- Note: Existing data should be cleaned up first if there are mixed-case entries
-- update public.subdomains set subdomain = lower(subdomain);
-- update public.organizations set subdomain = lower(subdomain);