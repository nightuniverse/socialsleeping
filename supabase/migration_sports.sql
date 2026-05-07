-- Run this in your Supabase SQL editor

-- Add sports array and onboarded flag to profiles
alter table public.profiles
  add column if not exists sports jsonb not null default '["gym"]'::jsonb,
  add column if not exists onboarded boolean not null default false;
