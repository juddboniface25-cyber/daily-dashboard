-- Run this in the Supabase SQL editor to create all tables.
-- RLS is disabled on all tables — single-user personal app.

create table if not exists steps (
  id          uuid default gen_random_uuid() primary key,
  date        date not null unique,
  count       integer not null,
  created_at  timestamptz default now()
);

create table if not exists workouts (
  id          uuid default gen_random_uuid() primary key,
  date        date not null,
  exercise    text not null,
  sets        integer,
  reps        integer,
  weight_lbs  numeric,
  created_at  timestamptz default now()
);

create table if not exists food_log (
  id          uuid default gen_random_uuid() primary key,
  date        date not null,
  meal        text,
  description text not null,
  calories    integer,
  created_at  timestamptz default now()
);

create table if not exists supplements (
  id          uuid default gen_random_uuid() primary key,
  date        date not null,
  name        text not null,
  taken       boolean default false,
  created_at  timestamptz default now(),
  unique(date, name)
);

-- wake_time, bedtime, and total_hours are nullable so each can be saved
-- independently via the two separate Save buttons in the UI.
create table if not exists sleep (
  id          uuid default gen_random_uuid() primary key,
  date        date not null unique,
  wake_time   text,
  bedtime     text,
  total_hours numeric,
  created_at  timestamptz default now()
);

create table if not exists learning (
  id          uuid default gen_random_uuid() primary key,
  date        date not null,
  topic       text,
  minutes     integer not null,
  created_at  timestamptz default now()
);

alter table steps       disable row level security;
alter table workouts    disable row level security;
alter table food_log    disable row level security;
alter table supplements disable row level security;
alter table sleep       disable row level security;
alter table learning    disable row level security;

-- Add macro columns to food_log (safe to run on existing tables)
alter table public.food_log add column if not exists protein_g integer default 0;
alter table public.food_log add column if not exists carbs_g   integer default 0;
