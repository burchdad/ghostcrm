-- Check trigger status and add uniqueness constraints
-- Run these sanity checks to ensure bulletproof subdomain handling

-- 1) Confirm trigger is enabled (and not actually disabled)
-- tgenabled = 'O' = enabled (can look like 0 in UI)
select 
  tgname as trigger_name,
  tgenabled as enabled_status,
  case 
    when tgenabled = 'O' then 'ENABLED (Origin mode)'
    when tgenabled = 'A' then 'ENABLED (Always mode)'
    when tgenabled = 'R' then 'ENABLED (Replica mode)'
    when tgenabled = 'D' then 'DISABLED'
    else 'UNKNOWN: ' || tgenabled::text
  end as status_description
from pg_trigger
where tgrelid = 'auth.users'::regclass
  and not tgisinternal
order by tgname;

-- If trigger is disabled ('D'), uncomment to fix:
-- alter table auth.users enable trigger on_auth_user_created;
-- alter table auth.users enable trigger sync_user_data_trigger;

-- 2) Add real uniqueness guards for subdomains (recommended)
-- Prevents rare race collisions even with RPC checks
create unique index if not exists subdomains_subdomain_uq
on public.subdomains (lower(subdomain));

create unique index if not exists organizations_subdomain_uq
on public.organizations (lower(subdomain));

-- Verify the constraints were created
select 
  schemaname,
  tablename,
  indexname,
  indexdef
from pg_indexes 
where schemaname = 'public'
  and (indexname like '%subdomain%' or indexname like '%uq%')
order by tablename, indexname;