-- Matches the Phase 4 design: one payment record per order, the four order
-- statuses, and the time of the last status change. Safe to run more than once.

do $$
begin
  if exists (select 1 from pg_enum e join pg_type t on t.oid = e.enumtypid where t.typname = 'order_status' and e.enumlabel = 'Prep') then
    alter type public.order_status rename value 'Prep' to 'Preparing';
  end if;
  if exists (select 1 from pg_enum e join pg_type t on t.oid = e.enumtypid where t.typname = 'order_status' and e.enumlabel = 'Paid') then
    alter type public.order_status rename value 'Paid' to 'Collected';
  end if;
end;
$$;

do $$
begin
  create type public.payment_status as enum ('Unpaid', 'Paid');
exception when duplicate_object then
  null;
end;
$$;

do $$
begin
  alter table public.orders add column status_updated_at timestamptz not null default now();
  update public.orders set status_updated_at = created_at;
exception when duplicate_column then
  null;
end;
$$;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete cascade,
  method public.payment_method not null,
  amount numeric(10, 2) not null check (amount >= 0),
  status public.payment_status not null default 'Unpaid',
  paid_at timestamptz
);

-- Move each order's payment method into its new payment record.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'payment_method'
  ) then
    insert into public.payments (order_id, method, amount, status, paid_at)
    select
      id,
      payment_method,
      total_amount,
      case when status = 'Collected' then 'Paid'::public.payment_status else 'Unpaid'::public.payment_status end,
      case when status = 'Collected' then status_updated_at end
    from public.orders
    on conflict (order_id) do nothing;

    alter table public.orders drop column payment_method;
  end if;
end;
$$;

alter table public.payments enable row level security;

drop policy if exists "Read payments of visible orders" on public.payments;
create policy "Read payments of visible orders" on public.payments
  for select to authenticated
  using (
    (select private.is_admin())
    or exists (
      select 1 from public.orders o
      where o.id = order_id and o.student_id = (select auth.uid())
    )
  );
