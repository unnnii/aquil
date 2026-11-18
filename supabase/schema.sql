-- ===========================================================================
-- Heartian Hustle 3.0 — Supabase schema
-- ===========================================================================
--
-- This file reflects the live project (rbmmhasdshbgxhjmshdk). It is a
-- first-install script: run it once from the Supabase dashboard, SQL Editor,
-- New query, paste, Run. Re-running is safe — tables and indexes use IF NOT
-- EXISTS, functions use CREATE OR REPLACE, and the admin seed does nothing if
-- the user already exists.
--
-- BEFORE RUNNING: change the password in the seed INSERT near the bottom of
-- the "Admin accounts" section. It is hashed by pgcrypto and never stored in
-- clear text, but the SQL editor keeps a history of what you ran.
--
-- What this creates:
--   batch_entries   one row per batch: captain details plus a jsonb array of
--                   participants, each with name, year, roll and event
--   team_entries    one row per team: captain details plus a jsonb array of
--                   the rest of the squad, each with name, course, year, roll
--   admins          username + bcrypt password hash
--   admin_sessions  server-side session tokens, 12 hour expiry
--   login_attempts  lockout after 5 failures for 15 minutes
--
-- Individual events are entered by batch captains, not by each person:
--   table-tennis, chess, penalty-shootout (arm-wrestling and throw-in-girls
--   are disabled in js/config.js but remain valid values here).
--   batch_participants_valid() checks every participant object, so a tampered
--   request cannot store an unknown event, a blank name or a bad class.
--
-- Team events:
--   carroms, badminton-boys, badminton-girls, football-7s, basketball-3s.
--   members holds everyone except the captain. team_entries_min_players
--   enforces the event minimum on the captain plus those members.
--
-- Security model:
--   anon (the publishable key in the browser) may INSERT entries and nothing
--   else. It cannot select, update or delete. Reading is only possible through
--   admin_entries(), which requires a live session token obtained by
--   admin_login(). No service_role key is used anywhere on the site.
--
--   Because anon has INSERT but not SELECT, an insert must not ask for the row
--   back: PostgREST's Prefer: return=representation needs SELECT and will fail
--   with 42501. js/register.js sends no Prefer header, which is correct.
-- ===========================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Entry validation helpers
-- ---------------------------------------------------------------------------

-- One participant is {name, year, roll, event}. year is the year of study,
-- stored as text to match the form values. Rows entered before 18 Nov 2026
-- carry `class` instead, so the check accepts either key.
create or replace function public.batch_participants_valid(p jsonb)
returns boolean
language sql
immutable
set search_path = public
as $$
  select case
    when jsonb_typeof(p) is distinct from 'array' then false
    when jsonb_array_length(p) not between 1 and 300 then false
    else not exists (
      select 1
        from jsonb_array_elements(p) as e
       where jsonb_typeof(e) is distinct from 'object'
          or coalesce(btrim(e->>'name'), '') = ''
          or coalesce(btrim(e->>'roll'), '') = ''
          or coalesce(e->>'year', e->>'class', '') not in ('1', '2', '3')
          or coalesce(e->>'event', '') not in (
               'table-tennis', 'chess', 'arm-wrestling',
               'penalty-shootout', 'throw-in-girls'
             )
    )
  end;
$$;

-- ---------------------------------------------------------------------------
-- Entries
-- ---------------------------------------------------------------------------

create table if not exists public.batch_entries (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  captain      text not null check (char_length(captain) between 2 and 80),
  captain_roll text not null check (captain_roll ~ '^[A-Za-z0-9 ./_-]{1,20} a batch can be under. These replace
  -- specialisation: one group per batch, chosen by the captain.
  batch_group  text not null check (batch_group in (
                 'bcom-tax-a-mcom',    -- B.Com Tax A & M.Com
                 'bcom-tax-b',         -- B.Com Tax B
                 'bcom-ca-msw',        -- B.Com CA & MSW
                 'bcom-fa-msc-evs',    -- B.Com FA & M.Sc EVS
                 'bcom-ba',            -- B.Com BA
                 'bsc-msc-psy',        -- B.Sc & M.Sc Psy
                 'bba-im-bsw',         -- BBA IM & BSW
                 'bba-ba-lsm',         -- BBA BA & LSM
                 'bca-msc-ai',         -- BCA + M.Sc AI
                 'bsc-ca-bcom-tt-gt',  -- B.Sc CA, B.Com TT & GT
                 'ba-ma-eng-bsc-eco'   -- BA, MA Eng & B.Sc Eco
               )),
  phone        text not null check (phone ~ '^\+?[0-9][0-9 -]{6,17}$'),
  participants jsonb not null default '[]'::jsonb
               check (public.batch_participants_valid(participants)),
  notes        text check (char_length(notes) <= 1000)
);

create index if not exists batch_entries_created_idx
  on public.batch_entries (created_at desc);

create index if not exists batch_entries_group_idx
  on public.batch_entries (batch_group);

-- Projects created before 18 Nov 2026 need these columns; CREATE TABLE IF NOT
-- EXISTS will not add them to an existing table. Safe to re-run.
alter table public.batch_entries
  add column if not exists captain_class text
    check (captain_class is null or char_length(captain_class) between 2 and 60),
  add column if not exists captain_year smallint
    check (captain_year is null or captain_year between 1 and 5);

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

-- Returns every entry as {batch: [...], team: [...]}. The admin console reads
-- nothing else, so the tables themselves stay closed to anon.
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
    'batch', coalesce((
      select jsonb_agg(to_jsonb(b) order by b.created_at desc)
        from public.batch_entries b
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

alter table public.batch_entries  enable row level security;
alter table public.team_entries   enable row level security;
alter table public.admins         enable row level security;
alter table public.admin_sessions enable row level security;
alter table public.login_attempts enable row level security;

-- Supabase grants anon and authenticated broad access to public tables by
-- default. Take it back, then hand anon exactly one thing: INSERT.
revoke all on public.batch_entries, public.team_entries
  from anon, authenticated;
revoke all on public.admins, public.admin_sessions, public.login_attempts
  from anon, authenticated;

grant insert on public.batch_entries to anon;
grant insert on public.team_entries  to anon;

drop policy if exists "anyone may enter" on public.batch_entries;
create policy "anyone may enter" on public.batch_entries
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
--   select count(*) from public.batch_entries;
--   select count(*) from public.team_entries;
--   select username from public.admins;
--
-- To change the admin password later, run:
--
--   update public.admins
--      set password_hash = extensions.crypt('new-password', extensions.gen_salt('bf', 12))
--    where username = 'admin';
-- ===========================================================================
),
  -- The captain's own class and year. The class is typed in words; the year
  -- is a smallint like the team form. Nullable so entries written before
  -- 18 Nov 2026 stay valid.
  captain_class text check (captain_class is null or char_length(captain_class) between 2 and 60),
  captain_year  smallint check (captain_year is null or captain_year between 1 and 5),
  -- The eleven combined groups a batch can be under. These replace
  -- specialisation: one group per batch, chosen by the captain.
  batch_group  text not null check (batch_group in (
                 'bcom-tax-a-mcom',    -- B.Com Tax A & M.Com
                 'bcom-tax-b',         -- B.Com Tax B
                 'bcom-ca-msw',        -- B.Com CA & MSW
                 'bcom-fa-msc-evs',    -- B.Com FA & M.Sc EVS
                 'bcom-ba',            -- B.Com BA
                 'bsc-msc-psy',        -- B.Sc & M.Sc Psy
                 'bba-im-bsw',         -- BBA IM & BSW
                 'bba-ba-lsm',         -- BBA BA & LSM
                 'bca-msc-ai',         -- BCA + M.Sc AI
                 'bsc-ca-bcom-tt-gt',  -- B.Sc CA, B.Com TT & GT
                 'ba-ma-eng-bsc-eco'   -- BA, MA Eng & B.Sc Eco
               )),
  phone        text not null check (phone ~ '^\+?[0-9][0-9 -]{6,17}$'),
  participants jsonb not null default '[]'::jsonb
               check (public.batch_participants_valid(participants)),
  notes        text check (char_length(notes) <= 1000)
);

create index if not exists batch_entries_created_idx
  on public.batch_entries (created_at desc);

create index if not exists batch_entries_group_idx
  on public.batch_entries (batch_group);

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

-- Returns every entry as {batch: [...], team: [...]}. The admin console reads
-- nothing else, so the tables themselves stay closed to anon.
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
    'batch', coalesce((
      select jsonb_agg(to_jsonb(b) order by b.created_at desc)
        from public.batch_entries b
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

alter table public.batch_entries  enable row level security;
alter table public.team_entries   enable row level security;
alter table public.admins         enable row level security;
alter table public.admin_sessions enable row level security;
alter table public.login_attempts enable row level security;

-- Supabase grants anon and authenticated broad access to public tables by
-- default. Take it back, then hand anon exactly one thing: INSERT.
revoke all on public.batch_entries, public.team_entries
  from anon, authenticated;
revoke all on public.admins, public.admin_sessions, public.login_attempts
  from anon, authenticated;

grant insert on public.batch_entries to anon;
grant insert on public.team_entries  to anon;

drop policy if exists "anyone may enter" on public.batch_entries;
create policy "anyone may enter" on public.batch_entries
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
--   select count(*) from public.batch_entries;
--   select count(*) from public.team_entries;
--   select username from public.admins;
--
-- To change the admin password later, run:
--
--   update public.admins
--      set password_hash = extensions.crypt('new-password', extensions.gen_salt('bf', 12))
--    where username = 'admin';
-- ===========================================================================
