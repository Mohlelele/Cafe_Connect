-- Students can rate a collected order from 1 to 5 stars and leave a comment.
-- One rating per order; the student can change it later. Safe to run more than once.

create table if not exists public.order_feedback (
  order_id uuid primary key references public.orders (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text not null default '' check (char_length(comment) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists order_feedback_updated_idx on public.order_feedback (updated_at desc);

-- The app writes through the server (Prisma). These rules cover direct API access:
-- students see their own feedback, staff see all of it.
alter table public.order_feedback enable row level security;

drop policy if exists "Read own or all feedback as staff" on public.order_feedback;
create policy "Read own or all feedback as staff" on public.order_feedback
  for select to authenticated
  using (student_id = (select auth.uid()) or (select private.is_admin()));
