-- Payment provisioning RPC - ONLY called after Stripe payment success
-- Replaces register_create_org which is now deprecated

-- Clean up old function
drop function if exists public.register_create_org(uuid, text, text, text);

create or replace function public.provision_tenant_after_payment(
  p_user_id uuid,
  p_org_name text,
  p_requested_subdomain text,
  p_owner_email text,
  p_stripe_customer_id text,
  p_stripe_subscription_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_org_id uuid;
  v_membership_id uuid;
  v_subdomain_id uuid;
  v_final_subdomain text;
  v_counter int := 0;
  v_existing_org jsonb;
begin
  -- 🎯 Verify user exists and email is confirmed
  if not exists (
    select 1 from auth.users 
    where id = p_user_id 
    and email_confirmed_at is not null
  ) then
    raise exception 'User not found or email not verified: %', p_user_id;
  end if;

  -- 🎯 IDEMPOTENCY: Check if user already has an organization (return existing)
  select jsonb_build_object(
    'organization_id', o.id,
    'subdomain', s.subdomain,
    'status', o.status,
    'membership_id', om.id,
    'subdomain_id', s.id,
    'already_provisioned', true
  ) into v_existing_org
  from public.organizations o
  left join public.organization_memberships om on o.id = om.organization_id and om.user_id = p_user_id
  left join public.subdomains s on o.id = s.organization_id  
  where o.owner_id = p_user_id;
  
  -- If organization already exists, return it (webhook retry handling)
  if v_existing_org is not null then
    return v_existing_org;
  end if;

  -- 🎯 Generate unique subdomain
  v_final_subdomain := coalesce(nullif(trim(p_requested_subdomain), ''), 
                                generate_subdomain_from_name(p_org_name));
  
  -- Ensure subdomain is lowercase and valid format
  v_final_subdomain := lower(v_final_subdomain);
  if not (v_final_subdomain ~ '^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$') then
    v_final_subdomain := 'org-' || substring(p_user_id::text, 1, 8);
  end if;

  -- Make subdomain unique by adding suffix if needed
  while exists (select 1 from public.subdomains where subdomain = v_final_subdomain) loop
    v_counter := v_counter + 1;
    v_final_subdomain := regexp_replace(v_final_subdomain, '-\d+$', '') || '-' || v_counter;
  end loop;

  -- 🏢 Create organization (ACTIVE immediately after payment)
  insert into public.organizations (
    name, 
    subdomain, 
    owner_id, 
    status,
    stripe_customer_id,
    stripe_subscription_id,
    created_at,
    updated_at
  )
  values (
    p_org_name, 
    v_final_subdomain, 
    p_user_id, 
    'active', -- 🎯 ACTIVE immediately after payment
    p_stripe_customer_id,
    p_stripe_subscription_id,
    now(),
    now()
  )
  returning id into v_org_id;

  -- 👥 Create organization membership  
  insert into public.organization_memberships (
    organization_id, 
    user_id, 
    role, 
    status,
    created_at
  )
  values (
    v_org_id, 
    p_user_id, 
    'owner', 
    'active',
    now()
  )
  returning id into v_membership_id;

  -- 🏢 Create tenant membership
  insert into public.tenant_memberships (
    tenant_id, 
    user_id, 
    role,
    created_at
  )
  values (
    v_org_id, 
    p_user_id, 
    'owner',
    now()
  );

  -- 🌐 Create subdomain entry (ACTIVE immediately) 
  insert into public.subdomains (
    subdomain, 
    organization_id, 
    status, 
    organization_name, 
    owner_email,
    created_at
  )
  values (
    v_final_subdomain, 
    v_org_id, 
    'active', -- 🎯 ACTIVE immediately after payment
    p_org_name, 
    p_owner_email,
    now()
  )
  returning id into v_subdomain_id;

  -- 👤 Update user with organization info and role
  update public.users
  set organization_id = v_org_id,
      tenant_id = v_org_id,
      role = 'owner', -- 🎯 Assign role after payment
      updated_at = now()
  where id = p_user_id;
  
  -- Verify user update succeeded
  if not found then
    raise exception 'Failed to update user organization info: %', p_user_id;
  end if;

  -- 📊 Create audit entry
  begin
    insert into public.audit_events (
      org_id, 
      actor_id, 
      entity, 
      entity_id, 
      action, 
      diff,
      created_at
    )
    values (
      v_org_id, 
      p_user_id, 
      'organization', 
      v_org_id, 
      'provisioned_after_payment', 
      jsonb_build_object(
        'name', p_org_name,
        'subdomain', v_final_subdomain,
        'owner_id', p_user_id,
        'stripe_customer_id', p_stripe_customer_id,
        'stripe_subscription_id', p_stripe_subscription_id
      ),
      now()
    );
  exception when others then
    -- Log but don't fail transaction
    raise warning 'Audit logging failed: %', sqlerrm;
  end;

  -- Return success with org details
  return jsonb_build_object(
    'organization_id', v_org_id,
    'subdomain', v_final_subdomain,
    'status', 'active',
    'membership_id', v_membership_id,
    'subdomain_id', v_subdomain_id,
    'already_provisioned', false
  );
  
end;
$$;

-- Helper function to generate subdomain from organization name
create or replace function generate_subdomain_from_name(org_name text)
returns text
language sql
immutable
as $$
  select case 
    when trim(org_name) = '' then 'organization'
    else substring(
      regexp_replace(
        regexp_replace(lower(trim(org_name)), '[^a-z0-9]+', '-', 'g'),
        '^-+|-+$', '', 'g'
      ),
      1, 20
    )
  end;
$$;

-- 🔒 Security: Only service_role can provision tenants
revoke all on function public.provision_tenant_after_payment(uuid, text, text, text, text, text) from public;
revoke all on function public.provision_tenant_after_payment(uuid, text, text, text, text, text) from authenticated;
grant execute on function public.provision_tenant_after_payment(uuid, text, text, text, text, text) to service_role;

-- Grant on helper function
revoke all on function generate_subdomain_from_name(text) from public;
grant execute on function generate_subdomain_from_name(text) to service_role;