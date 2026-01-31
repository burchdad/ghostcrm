-- Optimized auth.users trigger function that only writes on email changes
-- This reduces unnecessary writes to public.users and public.profiles

-- Updated function that only writes when email changes
create or replace function public.sync_user_data_on_email_change()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Check if this is an insert or if email changed on update
  if TG_OP = 'INSERT' or (TG_OP = 'UPDATE' and old.email is distinct from new.email) then
    
    -- Insert or update public.users
    insert into public.users (
      id, 
      email, 
      role, 
      first_name, 
      last_name, 
      company_name, 
      created_at, 
      updated_at
    )
    values (
      new.id,
      new.email,
      coalesce(new.user_metadata->>'role', 'user'),
      coalesce(new.user_metadata->>'first_name', ''),
      coalesce(new.user_metadata->>'last_name', ''),
      coalesce(new.user_metadata->>'company_name', ''),
      now(),
      now()
    )
    on conflict (id) do update set
      email = excluded.email,
      role = excluded.role,
      first_name = excluded.first_name,
      last_name = excluded.last_name,
      company_name = excluded.company_name,
      updated_at = now();

    -- Insert or update public.profiles
    insert into public.profiles (
      id, 
      email, 
      role, 
      created_at, 
      updated_at
    )
    values (
      new.id,
      new.email,
      coalesce(new.user_metadata->>'role', 'user'),
      now(),
      now()
    )
    on conflict (id) do update set
      email = excluded.email,
      role = excluded.role,
      updated_at = now();
  end if;

  return new;
end;
$$;

-- Drop existing trigger if it exists
drop trigger if exists sync_user_data_trigger on auth.users;

-- Create the optimized trigger using EXECUTE FUNCTION (not PROCEDURE)
create trigger sync_user_data_trigger
  after insert or update on auth.users
  for each row
  execute function public.sync_user_data_on_email_change();

-- Grant necessary permissions
grant execute on function public.sync_user_data_on_email_change() to service_role;
grant execute on function public.sync_user_data_on_email_change() to authenticated;

-- Comment explaining the optimization
comment on function public.sync_user_data_on_email_change() is 
'Optimized trigger function that only writes to public.users and public.profiles when email changes or on new inserts, reducing unnecessary database writes.';