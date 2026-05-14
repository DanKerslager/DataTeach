create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  parent_id uuid references public.topics(id) on delete set null,
  sort_order integer not null default 1,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, name)
);

create table if not exists public.class_topic_status (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  taught boolean not null default false,
  notes text not null default '',
  teaching_date date,
  updated_at timestamptz not null default now(),
  unique(class_id, topic_id)
);

create index if not exists idx_topics_user_parent on public.topics(user_id, parent_id, sort_order);
create index if not exists idx_classes_user on public.classes(user_id, is_archived);
create index if not exists idx_status_class on public.class_topic_status(class_id, topic_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists topics_set_updated_at on public.topics;
create trigger topics_set_updated_at
before update on public.topics
for each row
execute function public.set_updated_at();

drop trigger if exists classes_set_updated_at on public.classes;
create trigger classes_set_updated_at
before update on public.classes
for each row
execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.topics enable row level security;
alter table public.classes enable row level security;
alter table public.class_topic_status enable row level security;

create policy "users_select_own"
on public.users for select
using (id = auth.uid());

create policy "users_insert_own"
on public.users for insert
with check (id = auth.uid());

create policy "users_update_own"
on public.users for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "topics_owner_all"
on public.topics
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "classes_owner_all"
on public.classes
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "status_owner_all"
on public.class_topic_status
for all
using (
  exists (
    select 1 from public.classes c
    where c.id = class_id and c.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.classes c
    where c.id = class_id and c.user_id = auth.uid()
  )
);
