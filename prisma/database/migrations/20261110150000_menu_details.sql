-- Lets staff list each item's ingredients, allergens and dietary labels, and
-- upload food photos. Safe to run more than once.

alter table public.menu_items
  add column if not exists ingredients text[] not null default '{}',
  add column if not exists allergens text[] not null default '{}',
  add column if not exists dietary text[] not null default '{}';

-- A public bucket for menu photos. Anyone can view them; only the server
-- (with the service role key, after checking the user is staff) can upload.
-- The check lets this file also run on a plain Postgres database without Supabase Storage.
do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('menu-images', 'menu-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
    on conflict (id) do nothing;
  end if;
end $$;
