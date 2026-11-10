-- Lets cafeteria staff sign up themselves. A staff sign-up only asks for
-- access: the account starts as a student, and a manager approves it on the
-- Students page. The role itself is still never read from sign-up data,
-- because that data is supplied by whoever is signing up. Safe to run more than once.

alter table public.profiles add column if not exists staff_requested boolean not null default false;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, staff_requested)
  values (
    new.id,
    left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)), 100),
    lower(new.email),
    coalesce(new.raw_user_meta_data ->> 'staff_request', '') = 'true'
  );
  return new;
end;
$$;
revoke all on function private.handle_new_user() from public, anon, authenticated;
