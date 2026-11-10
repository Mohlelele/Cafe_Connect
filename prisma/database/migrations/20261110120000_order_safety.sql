-- Protects against duplicate order submissions and lets announcements be
-- edited by id, so a title no longer has to be unique. Safe to run more than once.

alter table public.orders add column if not exists idempotency_key uuid;

create unique index if not exists orders_student_idempotency_key
  on public.orders (student_id, idempotency_key);

alter table public.announcements drop constraint if exists announcements_title_key;
