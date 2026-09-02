-- Run this once in the Supabase SQL editor before enabling community submissions.
-- The public client key can read approved leaderboard rows, but cannot publish edits.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 2 and 40),
  role text not null default 'contributor' check (role in ('contributor', 'moderator')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.contributions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('new_page', 'page_update', 'correction', 'source')),
  page_title text not null check (char_length(trim(page_title)) between 2 and 140),
  summary text not null check (char_length(trim(summary)) between 10 and 300),
  details text not null check (char_length(trim(details)) between 30 and 10000),
  source_url text check (source_url is null or source_url ~* '^https?://'),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists contributions_status_created_at_idx on public.contributions(status, created_at);
create index if not exists contributions_author_id_idx on public.contributions(author_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(coalesce(new.email, 'editor@example.com'), '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_moderator()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'moderator'
  );
$$;

revoke all on function public.is_moderator() from public;
grant execute on function public.is_moderator() to anon;
grant execute on function public.is_moderator() to authenticated;

alter table public.profiles enable row level security;
alter table public.contributions enable row level security;

drop policy if exists "Profiles are visible to the owner or moderators" on public.profiles;
create policy "Profiles are visible to the owner or moderators"
  on public.profiles for select
  using (id = auth.uid() or public.is_moderator());

drop policy if exists "Approved contributions are public" on public.contributions;
create policy "Approved contributions are public"
  on public.contributions for select
  using (status = 'approved' or author_id = auth.uid() or public.is_moderator());

drop policy if exists "Contributors can submit pending work" on public.contributions;
create policy "Contributors can submit pending work"
  on public.contributions for insert
  with check (author_id = auth.uid() and status = 'pending');

drop policy if exists "Moderators can review contributions" on public.contributions;
create policy "Moderators can review contributions"
  on public.contributions for update
  using (public.is_moderator())
  with check (public.is_moderator());

drop view if exists public.contributor_leaderboard;
create view public.contributor_leaderboard as
select
  p.id,
  p.display_name,
  count(*) filter (where c.status = 'approved' and c.kind = 'new_page')::integer as pages_added,
  count(*) filter (where c.status = 'approved')::integer as edits_approved,
  (
    count(*) filter (where c.status = 'approved' and c.kind = 'new_page') * 3
    + count(*) filter (where c.status = 'approved' and c.kind <> 'new_page')
  )::integer as contribution_score
from public.profiles p
left join public.contributions c on c.author_id = p.id
group by p.id, p.display_name
having count(c.id) filter (where c.status = 'approved') > 0
order by contribution_score desc, p.display_name asc;

grant select on public.contributor_leaderboard to anon, authenticated;

create or replace view public.approved_contributions as
select
  c.id,
  c.kind,
  c.page_title,
  c.summary,
  c.details,
  c.source_url,
  c.created_at,
  p.display_name as author_name
from public.contributions c
join public.profiles p on p.id = c.author_id
where c.status = 'approved'
order by c.created_at desc;

grant select on public.approved_contributions to anon, authenticated;
