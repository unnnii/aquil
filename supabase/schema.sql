-- ===========================================================================
-- Heartian Hustle 3.0 — Supabase schema
-- ===========================================================================
--
-- Run this once: Supabase dashboard → SQL Editor → New query → paste → Run.
-- Re-running it is safe: tables and indexes use IF NOT EXISTS, functions use
-- CREATE OR REPLACE, and the admin seed does nothing if the user exists.
--
-- BEFORE RUNNING: change the password in the seed INSERT near the bottom of
-- the "Admin accounts" section. It is hashed by pgcrypto, never stored in
-- clear text, but the SQL editor keeps a history of what you ran.
--
-- What this creates:
--   individual_entries  one row per person, several events allowed
--   team_entries        one row per team, squad kept as jsonb
--   admins              username + bcrypt password hash
--   admin_sessions      server-side session tokens, 12 hour expiry
--   login_attempts      lockout after 5 failures for 15 minutes
--
-- Team events:
--   carroms, badminton-boys, badminton-girls, football-7s, basketball-3s.
--   members is a jsonb array of objects with name, course, year and roll for
--   everyone except the captain. team_entries_min_players enforces the event
--   minimum on the captain plus those members.
--
-- Disabled events:
--   arm-wrestling and throw-in-girls remain valid values in
--   individual_entries.events. They are hidden by the disabled flag in
--   js/config.js, not removed here, so switching them back on needs no
--   migration.
--
-- Security model:
--   anon (the publishable key in the browser) may INSERT entries and nothing
--   else. It cannot select, update or delete. Reading is only possible through
--   admin_entries(), which requires a live session token obtained by
--   admin_login(). No service_role key is used anywhere on the site.
-- ===========================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Entries
-- ---------------------------------------------------------------------------

create table if not exists public.individual_entries (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  full_name      text not null check (char_length(full_name) between 2 and 80),
  roll_number    text not null check (roll_number ~ '^[A-Za-z0-9 ./_-]{1,20}$'),
  course         text not null check (char_length(course) between 2 and 40),
  specialisation text check (char_length(specialisation) <= 40),
  year           smallint not null check (year between 1 and 5),
  phone          text not null check (phone ~ '^\+?[0-9][0-9 -]{6,17}$'),
  events         text[] not null
                 check (cardinality(events) between 1 and 5)
                 check (events <@ array[
                   'table-tennis', 'chess', 'arm-wrestling',
                   'penalty-shootout', 'throw-in-girls'
                 ]::text[]),
  notes          text check (char_length(notes) <= 1000)
);

create index if not exists individual_entries_created_idx
  on public.individual_entries (created_at desc);

create index if not exists individual_entries_events_idx
  on public.individual_entries using gin (events);

create table if not exists public.team_entries (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  event          text not null check (event in (
                   'carroms', 'badminton', 'badminton-boys', 'badminton-girls',
                   'football-7s', 'basketball-3s'
                 )),
  team           text not null check (char_length(team) between 2 and 60),
  captain        text not null check (char_length(captain) between 2 and 80),
  captain_roll   text not null check (captain_roll ~ '^[A-Za-z0-9 ./_-]{1,20}$'),
  captain_course text not null check (char_length(captain_course) between 2 and 40),
  captain_year   smallint not null check (captain_year between 1 and 5),
  phone          text not null check (phone ~ '^\+?[0-9][0-9 -]{6,17}$'),
  members        jsonb not null default '[]'::jsonb
                 check (jsonb_typeof(members) = 'array'),
  notes          text check (char_length(notes) <= 1000),
  -- Minimums count the captain plus the listed members.
  constraint team_entries_min_players check (
    case event
      when 'basketball-3s'   then jsonb_array_length(members) >= 2
      when 'football-7s'     then jsonb_array_length(members) >= 9
      when 'badminton-boys'  then jsonb_array_length(members) >= 1
      when 'badminton-girls' then jsonb_array_length(members) >= 1
      when 'badminton'       then jsonb_array_length(members) >= 1
      when 'carroms'         then jsonb_array_length(members) >= 1
      else true
    end
  )
);

create index if not exists team_entries_created_idx
  on public.team_entries (created_at desc);

create index if not exists team_entries_event_idx
  on public.team_entries (event);

-- ---------------------------------------------------------------------------
-- Admin accounts
-- ---------------------------------------------------------------------------

create table if not exists public.admins (
  username      text primary key check (username ~ '^[a-z0-9_.-]{3,32}$'),
  password_hash text not null,
  created_at    timestamptz not null default now()
);

create table if not exists public.admin_sessions (
  token      text primary key,
  username   text not null references public.admins (username) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists admin_sessions_expiry_idx
  on public.admin_sessions (expires_at);

create table if not exists public.login_attempts (
  username     text primary key,
  failures     integer not null default 0,
  locked_until timestamptz
);

-- CHANGE THE PASSWORD BEFORE RUNNING THIS.
-- Replace CHANGE-ME-BEFORE-RUNNING with your own. The username is 'admin';
-- to use another, change it below and on the admin sign-in page.
insert into public.admins (username, password_hash)
values (
  'admin',
  extensions.crypt('CHANGE-ME-BEFORE-RUNNING', extensions.gen_salt('bf', 12))
)
on conflict (username) do nothing;

-- ---------------------------------------------------------------------------
-- Admin functions (SECURITY DEFINER: they run as the owner and bypass RLS)
-- ---------------------------------------------------------------------------

create or replace function public.admin_login(p_username text, p_password text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user  text := lower(btrim(coalesce(p_username, '')));
  v_hash  text;
  v_lock  timestamptz;
  v_token text;
begin
  if v_user = '' or coalesce(p_password, '') = '' then
    return null;
  end if;

  select locked_until into v_lock
    from public.login_attempts
   where username = v_user;

  if v_lock is not null and v_lock > now() then
    raise exception 'locked' using errcode = 'P0001';
  end if;

  select password_hash into v_hash
    from public.admins
   where username = v_user;

  if v_hash is null or extensions.crypt(p_password, v_hash) <> v_hash then
    insert into public.login_attempts (username, failures, locked_until)
    values (v_user, 1, null)
    on conflict (username) do update
       set failures = login_attempts.failures + 1,
           locked_until = case
             when login_attempts.failures + 1 >= 5
             then now() + interval '15 minutes'
             else null
           end;
    return null;
  end if;

  delete from public.login_attempts where username = v_user;
  delete from public.admin_sessions where expires_at <= now();

  v_token := encode(extensions.gen_random_bytes(32), 'hex');

  insert into public.admin_sessions (token, username, expires_at)
  values (v_token, v_user, now() + interval '12 hours');

  return v_token;
end;
$$;

create or replace function public.admin_entries(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_rows jsonb;
begin
  if not exists (
    select 1 from public.admin_sessions
     where token = p_token and expires_at > now()
  ) then
    raise exception 'unauthorised' using errcode = 'P0001';
  end if;

  select jsonb_build_object(
    'individual', coalesce((
      select jsonb_agg(to_jsonb(i) order by i.created_at desc)
        from public.individual_entries i
    ), '[]'::jsonb),
    'team', coalesce((
      select jsonb_agg(to_jsonb(t) order by t.created_at desc)
        from public.team_entries t
    ), '[]'::jsonb)
  ) into v_rows;

  return v_rows;
end;
$$;

create or replace function public.admin_logout(p_token text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.admin_sessions where token = p_token;
$$;

-- ---------------------------------------------------------------------------
-- Row level security and grants
-- ---------------------------------------------------------------------------

alter table public.individual_entries enable row level security;
alter table public.team_entries       enable row level security;
alter table public.admins             enable row level security;
alter table public.admin_sessions     enable row level security;
alter table public.login_attempts     enable row level security;

-- Supabase grants anon and authenticated broad access to public tables by
-- default. Take it back, then hand anon exactly one thing: INSERT.
revoke all on public.individual_entries, public.team_entries
  from anon, authenticated;
revoke all on public.admins, public.admin_sessions, public.login_attempts
  from anon, authenticated;

grant insert on public.individual_entries to anon;
grant insert on public.team_entries to anon;

drop policy if exists "anyone may enter" on public.individual_entries;
create policy "anyone may enter" on public.individual_entries
  for insert to anon with check (true);

drop policy if exists "anyone may enter" on public.team_entries;
create policy "anyone may enter" on public.team_entries
  for insert to anon with check (true);

revoke all on function public.admin_login(text, text) from public;
revoke all on function public.admin_entries(text)     from public;
revoke all on function public.admin_logout(text)      from public;

grant execute on function public.admin_login(text, text) to anon;
grant execute on function public.admin_entries(text)     to anon;
grant execute on function public.admin_logout(text)      to anon;

-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------
-- After running, these should return one row each and no errors:
--
--   select count(*) from public.individual_entries;
--   select count(*) from public.team_entries;
--   select username from public.admins;
--
-- To change the admin password later, run:
--
--   update public.admins
--      set password_hash = extensions.crypt('new-password', extensions.gen_salt('bf', 12))
--    where username = 'admin';
-- ===========================================================================
