do $$
begin
  -- DEALS
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='deals' and column_name='lead_id'
  ) then
    alter table public.deals drop constraint if exists deals_lead_id_fkey;
    alter table public.deals alter column lead_id type bigint using lead_id::bigint;
    alter table public.deals
      add constraint deals_lead_id_fkey
      foreign key (lead_id) references public.leads(id) on delete set null;
  end if;

  -- MESSAGES
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='messages' and column_name='lead_id'
  ) then
    alter table public.messages drop constraint if exists messages_lead_id_fkey;
    alter table public.messages alter column lead_id type bigint using lead_id::bigint;
    alter table public.messages
      add constraint messages_lead_id_fkey
      foreign key (lead_id) references public.leads(id) on delete set null;
  end if;

  -- APPOINTMENTS
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='appointments' and column_name='lead_id'
  ) then
    alter table public.appointments drop constraint if exists appointments_lead_id_fkey;
    alter table public.appointments alter column lead_id type bigint using lead_id::bigint;
    alter table public.appointments
      add constraint appointments_lead_id_fkey
      foreign key (lead_id) references public.leads(id) on delete set null;
  end if;

  -- OUTREACH_ENROLLMENTS
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='outreach_enrollments' and column_name='lead_id'
  ) then
    alter table public.outreach_enrollments drop constraint if exists outreach_enrollments_lead_id_fkey;
    alter table public.outreach_enrollments alter column lead_id type bigint using lead_id::bigint;
    alter table public.outreach_enrollments
      add constraint outreach_enrollments_lead_id_fkey
      foreign key (lead_id) references public.leads(id) on delete cascade;
  end if;
end$$;
