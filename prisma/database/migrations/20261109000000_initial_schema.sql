create type public.user_role as enum ('student', 'admin');
create type public.order_status as enum ('Pending', 'Prep', 'Ready', 'Paid');
create type public.payment_method as enum ('Cash', 'Card', 'EFT', 'Instant EFT');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 1 and 100),
  email text not null unique,
  role public.user_role not null default 'student',
  created_at timestamptz not null default now()
);

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  description text not null default '' check (char_length(description) <= 500),
  price numeric(10, 2) not null check (price > 0 and price <= 100000),
  available boolean not null default true,
  image_url text not null default '' check (image_url = '' or image_url ~* '^https?://\S+$'),
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  student_id uuid not null references public.profiles (id) on delete cascade,
  customer_name text not null,
  total_amount numeric(10, 2) not null check (total_amount >= 0),
  payment_method public.payment_method not null default 'Cash',
  status public.order_status not null default 'Pending',
  created_at timestamptz not null default now()
);
create index orders_student_created_idx on public.orders (student_id, created_at desc);
create index orders_created_idx on public.orders (created_at desc);

-- Name and price are copied here so past orders stay correct after the menu changes.
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  menu_item_id uuid references public.menu_items (id) on delete set null,
  name text not null,
  quantity integer not null check (quantity between 1 and 20),
  unit_price numeric(10, 2) not null check (unit_price >= 0)
);
create index order_items_order_idx on public.order_items (order_id);
create index order_items_menu_item_idx on public.order_items (menu_item_id);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null unique check (char_length(title) between 1 and 120),
  body text not null check (char_length(body) between 1 and 1000),
  updated_at timestamptz not null default now()
);
create index announcements_updated_idx on public.announcements (updated_at desc);

-- Kept out of the public schema so these are not callable through the API.
create schema private;
grant usage on schema private to authenticated;

create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = (select auth.uid()) and role = 'admin'
  );
$$;
revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

-- Every new account is a student. The role is never read from signup data,
-- because that data is supplied by whoever is signing up.
create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)), 100),
    lower(new.email)
  );
  return new;
end;
$$;
revoke all on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.announcements enable row level security;

-- There is deliberately no update policy on profiles: nobody can change a role from the app.
create policy "Read own profile, admins read all" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()));

create policy "Logged-in users read the menu" on public.menu_items
  for select to authenticated using (true);
create policy "Admins add menu items" on public.menu_items
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admins edit menu items" on public.menu_items
  for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins remove menu items" on public.menu_items
  for delete to authenticated using ((select private.is_admin()));

-- Orders are only ever created through place_order(), so there is no insert policy.
create policy "Read own orders, admins read all" on public.orders
  for select to authenticated
  using (student_id = (select auth.uid()) or (select private.is_admin()));
create policy "Admins update orders" on public.orders
  for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

create policy "Read items of visible orders" on public.order_items
  for select to authenticated
  using (
    (select private.is_admin())
    or exists (
      select 1 from public.orders o
      where o.id = order_id and o.student_id = (select auth.uid())
    )
  );

create policy "Anyone reads announcements" on public.announcements
  for select to anon, authenticated using (true);
create policy "Admins add announcements" on public.announcements
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admins edit announcements" on public.announcements
  for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins remove announcements" on public.announcements
  for delete to authenticated using ((select private.is_admin()));

-- The browser only says what it wants. Names and prices come from menu_items,
-- so a tampered request cannot change what an order costs.
create function public.place_order(p_items jsonb, p_payment_method public.payment_method default 'Cash')
returns public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student public.profiles;
  v_order public.orders;
  v_element jsonb;
  v_ids uuid[];
  v_quantities integer[];
  v_total numeric(10, 2);
  v_name text;
begin
  select * into v_student from public.profiles where id = (select auth.uid());
  if not found or v_student.role <> 'student' then
    raise exception 'Please log in with a student account to place an order.';
  end if;

  if jsonb_typeof(p_items) is distinct from 'array'
    or jsonb_array_length(p_items) = 0
    or jsonb_array_length(p_items) > 50 then
    raise exception 'Order must contain at least one item.';
  end if;

  for v_element in select value from jsonb_array_elements(p_items) loop
    if jsonb_typeof(v_element) is distinct from 'object'
      or coalesce(v_element ->> 'id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      raise exception 'An item in your basket is no longer available. Please update your basket and try again.';
    end if;
    if jsonb_typeof(v_element -> 'quantity') is distinct from 'number'
      or (v_element ->> 'quantity') !~ '^[0-9]{1,3}$'
      or (v_element ->> 'quantity')::integer < 1 then
      raise exception 'Each item needs a whole-number quantity of at least 1.';
    end if;
  end loop;

  select array_agg(r.id), array_agg(r.quantity)
  into v_ids, v_quantities
  from (
    select (e ->> 'id')::uuid as id, sum((e ->> 'quantity')::integer)::integer as quantity
    from jsonb_array_elements(p_items) as e
    group by 1
  ) as r;

  if exists (
    select 1 from unnest(v_ids) as requested(id)
    where not exists (select 1 from public.menu_items m where m.id = requested.id and m.available)
  ) then
    select m.name into v_name
    from public.menu_items m
    where m.id = any (v_ids) and not m.available
    limit 1;
    raise exception '% is no longer available. Please update your basket and try again.', coalesce(v_name, 'An item in your basket');
  end if;

  select m.name into v_name
  from unnest(v_ids, v_quantities) as requested(id, quantity)
  join public.menu_items m on m.id = requested.id
  where requested.quantity > 20
  limit 1;
  if v_name is not null then
    raise exception 'You can order up to 20 of % at a time.', v_name;
  end if;

  select sum(round(m.price * requested.quantity, 2))
  into v_total
  from unnest(v_ids, v_quantities) as requested(id, quantity)
  join public.menu_items m on m.id = requested.id;

  -- Order numbers are random and unique, so a collision just means try another.
  for attempt in 1..5 loop
    begin
      insert into public.orders (order_number, student_id, customer_name, total_amount, payment_method)
      values (
        'CC-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
        v_student.id,
        v_student.full_name,
        v_total,
        p_payment_method
      )
      returning * into v_order;
      exit;
    exception when unique_violation then
      if attempt = 5 then
        raise;
      end if;
    end;
  end loop;

  insert into public.order_items (order_id, menu_item_id, name, quantity, unit_price)
  select v_order.id, m.id, m.name, requested.quantity, m.price
  from unnest(v_ids, v_quantities) as requested(id, quantity)
  join public.menu_items m on m.id = requested.id;

  return v_order;
end;
$$;
revoke all on function public.place_order(jsonb, public.payment_method) from public, anon;
grant execute on function public.place_order(jsonb, public.payment_method) to authenticated;

alter publication supabase_realtime add table public.orders, public.menu_items, public.announcements;

insert into public.menu_items (name, description, price, image_url) values
  ('Classic Beef Burger', 'Beef patty, cheddar, lettuce, tomato and house sauce.', 64, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80'),
  ('Chicken Burger Deluxe', 'Crispy chicken fillet with cheese, slaw and special sauce.', 68, 'https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=900&q=80'),
  ('Veggie Burger', 'Plant-based patty with grilled veg, lettuce and aioli.', 60, 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=900&q=80'),
  ('Margherita Pizza', 'Classic mozzarella, tomato sauce and basil on a thin crust.', 72, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80'),
  ('Beef Pie', 'Golden pastry filled with savoury beef and rich gravy.', 39, 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=900&q=80'),
  ('Chicken Pie', 'Tender chicken pie with creamy filling and flaky crust.', 42, 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=900&q=80'),
  ('Hot Fried Chicken', 'Golden fried chicken pieces with a spicy crunch and dip.', 75, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80'),
  ('Chicken Wrap', 'Grilled chicken wrap with salad, relish and creamy dressing.', 52, 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=900&q=80'),
  ('Chicken Bucket Meal', 'Crispy chicken bucket with fries and coleslaw.', 96, 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=900&q=80'),
  ('Chicken Curry Bowl', 'Traditional curry with chicken, rice and a rich sauce.', 78, 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80'),
  ('Cappuccino', 'Creamy espresso-based cappuccino with silky foam.', 22, 'https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=900&q=80'),
  ('Iced Latte', 'Smooth iced coffee with a clean, mellow finish.', 24, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80'),
  ('Mango Juice', 'Cold mango juice with a fresh tropical taste.', 18, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=900&q=80');
