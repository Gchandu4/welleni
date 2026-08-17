-- ══════════════════════════════════════════════════════════════════
-- DPDP compliance migration for Welleni
-- ⚠️ NOT YET RUN AGAINST THE LIVE SUPABASE PROJECT.
-- I (Claude) do not have Supabase credentials for this project and have
-- not executed this against tawzbsjsetjarzcouhsq.supabase.co. Run this
-- yourself (Supabase SQL editor or `supabase db push`) against a
-- staging project first, then production, before the new frontend
-- code that depends on it goes live.
--
-- Safe to re-run: uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS guards.
-- ══════════════════════════════════════════════════════════════════

-- 1) Per-record consent snapshot, captured at the moment of signup.
--    Read by nothing yet except the new registration code — additive, no risk to existing rows.
alter table if exists public.patients
  add column if not exists consent jsonb;

alter table if exists public.hospitals
  add column if not exists consent jsonb;

-- 2) Immutable consent audit log — one row per consent event, kept even if the
--    user later deletes their account, so you can prove what was consented to and when.
create table if not exists public.consent_records (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('patient','hospital')),
  identifier text not null, -- email used at the time of consent (not a live FK, deliberately, so it survives account deletion)
  "consentVersion" text not null,
  "termsPrivacyAccepted" boolean not null default false,
  "marketingOptIn" boolean not null default false,
  "recordedAt" timestamptz not null default now()
);

comment on table public.consent_records is
  'DPDP Act audit trail of consent given at signup / demo request. Append-only — do not update or delete rows on user request; erase the *identifier* linkage instead if a user exercises their erasure right, but keep the anonymised consent event for compliance evidence.';

-- 3) Data-rights requests (access / correction / erasure / consent withdrawal / grievance).
create table if not exists public.dsr_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text not null,
  role text,
  "requestType" text not null check ("requestType" in ('access','correct','erase','withdraw','nominate','grievance')),
  details text,
  status text not null default 'received' check (status in ('received','in_progress','completed','rejected')),
  source text default 'website',
  "submittedAt" timestamptz not null default now(),
  "resolvedAt" timestamptz,
  "resolutionNotes" text
);

comment on table public.dsr_requests is
  'Data Principal rights requests raised via /page-data-rights. Triage manually until volume justifies a dashboard — track status here so you can show a resolution SLA if the Data Protection Board ever asks.';

-- 4) demo_requests table used by the landing-page lead form (handleCTA()).
--    Included here because the frontend now writes a `consented`/`consentedAt` pair to it;
--    create the table if this is the first time it's being formalised.
create table if not exists public.demo_requests (
  id uuid primary key default gen_random_uuid(),
  hospital_name text not null,
  mobile text not null,
  status text not null default 'pending',
  requested_at timestamptz not null default now(),
  source text default 'website',
  consented boolean not null default false,
  "consentedAt" timestamptz
);

-- ── Row Level Security ──
-- ⚠️ FLAGGED FOR REVIEW, NOT APPLIED AUTOMATICALLY: I have not seen your existing RLS
-- policies on `patients` / `hospitals` and do not want to silently override them. The
-- policies below are a *starting point* for the new tables only. Please review and adapt
-- to match your existing auth model (this app currently does its own password check in
-- JS rather than using Supabase Auth, so "authenticated" below may not mean what it
-- usually means in a Supabase app — check this carefully before enabling).

alter table public.consent_records enable row level security;
alter table public.dsr_requests enable row level security;
alter table public.demo_requests enable row level security;

-- Allow inserts from the anon key (the app writes these directly from the browser today),
-- but do NOT allow anon to read them back — these contain PII and should only be readable
-- from a trusted context (service role / an authenticated internal dashboard).
drop policy if exists "consent_records_insert_anon" on public.consent_records;
create policy "consent_records_insert_anon" on public.consent_records
  for insert to anon with check (true);

drop policy if exists "dsr_requests_insert_anon" on public.dsr_requests;
create policy "dsr_requests_insert_anon" on public.dsr_requests
  for insert to anon with check (true);

drop policy if exists "demo_requests_insert_anon" on public.demo_requests;
create policy "demo_requests_insert_anon" on public.demo_requests
  for insert to anon with check (true);

-- No anon SELECT/UPDATE/DELETE policies are created on these three tables on purpose —
-- without an explicit policy, RLS denies by default once enabled. Add a policy scoped to
-- an authenticated admin/staff role when you build an internal triage view.

-- ══════════════════════════════════════════════════════════════════
-- OPEN QUESTION FOR YOU (not something I can verify from the codebase):
-- Do `patients` and `hospitals` currently have RLS enabled at all, and if so, what do
-- the existing policies allow an anon key to SELECT? The app queries
-- `_sb.from('patients').select('*').eq('email', ...)` directly from the browser for
-- login — if RLS on `patients` is permissive (or disabled), any anon key holder can
-- read every patient's health data, not just their own. This is the single highest-
-- priority item in DPDP_PROGRESS.md — please check the Supabase dashboard.
-- ══════════════════════════════════════════════════════════════════
