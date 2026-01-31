-- Clean up: Remove old 3-arg version if it exists
drop function if exists public.register_create_org(uuid, text, text);

create or replace function public.register_create_org(
  p_user_id uuid,
  p_org_name text,
  p_subdomain text,
  p_owner_email text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_membership_id uuid;
  v_subdomain_id uuid;
begin
  -- Insert organization
  insert into public.organizations (name, subdomain, owner_id, status)
  values (p_org_name, p_subdomain, p_user_id, 'active')
  returning id into v_org_id;

  -- Insert organization membership
  insert into public.organization_memberships (organization_id, user_id, role, status)
  values (v_org_id, p_user_id, 'owner', 'active')
  returning id into v_membership_id;

  -- Insert tenant membership
  insert into public.tenant_memberships (tenant_id, user_id, role)
  values (v_org_id, p_user_id, 'owner');

  -- Update public.users with organization info
  update public.users
  set organization_id = v_org_id,
      tenant_id = v_org_id,
      role = 'owner',
      updated_at = now()
  where id = p_user_id;
  
  -- Verify the user update succeeded
  if not found then
    raise exception 'User % not found in public.users table', p_user_id;
  end if;

  -- Insert subdomain entry (keep as 'pending' until email verified + payment/activation)
  insert into public.subdomains (subdomain, organization_id, status, organization_name, owner_email)
  values (p_subdomain, v_org_id, 'pending', p_org_name, p_owner_email)
  returning id into v_subdomain_id;

  -- Audit entry (best effort - don't fail transaction if this fails)
  begin
    insert into public.audit_events (org_id, actor_id, entity, entity_id, action, diff)
    values (v_org_id, p_user_id, 'organization', v_org_id, 'created', jsonb_build_object(
      'name', p_org_name,
      'subdomain', p_subdomain,
      'owner_id', p_user_id
    ));
  exception when others then
    -- Log but don't fail the transaction
    null;
  end;

  -- Return org_id for the route
  return v_org_id;
  
end;
$$;

-- Security: Revoke public access and grant to authenticated users
revoke all on function public.register_create_org(uuid, text, text, text) from public;
grant execute on function public.register_create_org(uuid, text, text, text) to authenticated;

-- For service_role (if you need admin access)
grant execute on function public.register_create_org(uuid, text, text, text) to service_role;

-- Trigger health check function with correct enabled flag values
create or replace function public.auth_user_trigger_ok()
returns boolean
language sql
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from pg_trigger t
    where t.tgrelid = 'auth.users'::regclass
      and t.tgname in ('on_auth_user_created', 'sync_user_data_trigger')
      and t.tgenabled in ('O','A','R')  -- Origin, Always, or Replica modes
  );
$$;

revoke all on function public.auth_user_trigger_ok() from public;
grant execute on function public.auth_user_trigger_ok() to service_role;

-- Add unique constraints for bulletproof subdomain handling
-- (Run these separately if they don't exist yet)
/*
alter table public.subdomains
add constraint subdomains_subdomain_key unique (subdomain);

alter table public.organizations
add constraint organizations_subdomain_key unique (subdomain);
*/