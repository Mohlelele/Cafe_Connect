-- The app now reads and writes through Prisma on the server. Row level security
-- stays on for the browser, which only needs login and live updates.
-- Safe to run more than once.

do $$
begin
  create type public.menu_category as enum ('Burgers', 'Pizza', 'Meals', 'Drinks');
exception when duplicate_object then
  null;
end;
$$;

-- Categories used to be guessed from item names, which filed "Steak" under
-- drinks because it contains "tea".
do $$
begin
  alter table public.menu_items add column category public.menu_category not null default 'Meals';

  update public.menu_items
  set category = case
    when name ~* '\mburger' then 'Burgers'::public.menu_category
    when name ~* '\mpizza' then 'Pizza'::public.menu_category
    when name ~* '\m(juice|coffee|latte|cappuccino|tea|smoothie|soda|water)\M' then 'Drinks'::public.menu_category
    else 'Meals'::public.menu_category
  end;
exception when duplicate_column then
  null;
end;
$$;

create index if not exists menu_items_category_idx on public.menu_items (category);

-- Orders are created by the server, which prices them from menu_items.
drop function if exists public.place_order(jsonb, public.payment_method);

-- Every write now goes through validated server code, so signed-in browsers
-- no longer need to write to these tables directly.
drop policy if exists "Admins add menu items" on public.menu_items;
drop policy if exists "Admins edit menu items" on public.menu_items;
drop policy if exists "Admins remove menu items" on public.menu_items;
drop policy if exists "Admins update orders" on public.orders;
drop policy if exists "Admins add announcements" on public.announcements;
drop policy if exists "Admins edit announcements" on public.announcements;
drop policy if exists "Admins remove announcements" on public.announcements;
