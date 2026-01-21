-- Optional unique constraints for bulletproof subdomain handling
-- Run these if they don't already exist

-- Check if constraints already exist before adding
do $$
begin
  -- Add unique constraint for subdomains table
  if not exists (
    select 1 from information_schema.table_constraints 
    where constraint_name = 'subdomains_subdomain_key' 
    and table_name = 'subdomains'
  ) then
    alter table public.subdomains
    add constraint subdomains_subdomain_key unique (subdomain);
    raise notice 'Added unique constraint to subdomains.subdomain';
  else
    raise notice 'Unique constraint on subdomains.subdomain already exists';
  end if;

  -- Add unique constraint for organizations table
  if not exists (
    select 1 from information_schema.table_constraints 
    where constraint_name = 'organizations_subdomain_key' 
    and table_name = 'organizations'
  ) then
    alter table public.organizations
    add constraint organizations_subdomain_key unique (subdomain);
    raise notice 'Added unique constraint to organizations.subdomain';
  else
    raise notice 'Unique constraint on organizations.subdomain already exists';
  end if;
end
$$;