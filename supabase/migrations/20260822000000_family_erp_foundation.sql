-- Family Lifetime ERP foundation: PostgreSQL schema, RLS, audit trail, and private storage.
-- Timestamps are UTC `timestamptz`; operational entities follow a soft-delete + retention convention.

create extension if not exists pgcrypto;
create extension if not exists citext;
create extension if not exists pg_trgm;

do $$ begin create type public.household_role as enum ('owner', 'adult', 'limited'); exception when duplicate_object then null; end $$;
do $$ begin create type public.financial_record_kind as enum ('income', 'expense', 'transfer', 'liability'); exception when duplicate_object then null; end $$;
do $$ begin create type public.reminder_kind as enum ('bill', 'renewal', 'appointment', 'birthday', 'custom'); exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_path text,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  timezone text not null default 'UTC',
  base_currency char(3) not null default 'USD' check (base_currency = upper(base_currency)),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  deleted_at timestamptz, retention_until timestamptz
);

create table if not exists public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.household_role not null default 'limited',
  joined_at timestamptz not null default now(), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  deleted_at timestamptz, retention_until timestamptz,
  primary key (household_id, user_id)
);

create table if not exists public.household_invitations (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  email citext not null, role public.household_role not null default 'limited' check (role <> 'owner'),
  token_hash text not null unique, invited_by uuid not null references auth.users(id) on delete restrict,
  expires_at timestamptz not null, accepted_at timestamptz, accepted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), revoked_at timestamptz,
  check (expires_at > created_at)
);

create table if not exists public.family_people (
  id uuid primary key default gen_random_uuid(), household_id uuid not null references public.households(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 160), relationship text, birth_date date,
  contact_details jsonb not null default '{}'::jsonb, notes text, created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz, retention_until timestamptz
);

create table if not exists public.financial_records (
  id uuid primary key default gen_random_uuid(), household_id uuid not null references public.households(id) on delete cascade,
  kind public.financial_record_kind not null, title text not null check (char_length(trim(title)) between 1 and 180),
  amount numeric(14,2) not null check (amount >= 0), currency char(3) not null check (currency = upper(currency)),
  occurred_on date not null default current_date, due_on date, counterparty text, category text, notes text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz, retention_until timestamptz
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(), household_id uuid not null references public.households(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 180), category text not null default 'other', identifier text,
  purchase_date date, purchase_value numeric(14,2) check (purchase_value is null or purchase_value >= 0),
  estimated_value numeric(14,2) check (estimated_value is null or estimated_value >= 0), currency char(3) check (currency is null or currency = upper(currency)),
  renewal_due_at timestamptz, notes text, created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz, retention_until timestamptz
);

create table if not exists public.schedule_items (
  id uuid primary key default gen_random_uuid(), household_id uuid not null references public.households(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 180), category text not null default 'general', starts_at timestamptz not null, ends_at timestamptz,
  timezone text not null default 'UTC', all_day boolean not null default false, recurrence_rule text, location text, notes text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz, retention_until timestamptz,
  check (ends_at is null or ends_at >= starts_at)
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(), household_id uuid not null references public.households(id) on delete cascade,
  bucket_id text not null default 'family-documents' check (bucket_id = 'family-documents'), storage_path text not null unique,
  file_name text not null check (char_length(trim(file_name)) between 1 and 255), mime_type text not null,
  byte_size bigint not null check (byte_size between 0 and 52428800), label text, notes text, searchable_text text,
  search_vector tsvector generated always as (to_tsvector('simple', coalesce(file_name, '') || ' ' || coalesce(label, '') || ' ' || coalesce(searchable_text, ''))) stored,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz, retention_until timestamptz
);

create table if not exists public.record_links (
  id uuid primary key default gen_random_uuid(), household_id uuid not null references public.households(id) on delete cascade,
  source_type text not null, source_id uuid not null, target_type text not null, target_id uuid not null, relation_type text not null default 'related_to',
  created_by uuid not null references auth.users(id) on delete restrict, created_at timestamptz not null default now(), deleted_at timestamptz, retention_until timestamptz,
  check (not (source_type = target_type and source_id = target_id))
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(), household_id uuid not null references public.households(id) on delete cascade,
  kind public.reminder_kind not null default 'custom', title text not null check (char_length(trim(title)) between 1 and 180), due_at timestamptz not null,
  timezone text not null default 'UTC', recurrence_rule text, lead_time_minutes integer not null default 1440 check (lead_time_minutes between 0 and 525600),
  related_type text, related_id uuid, enabled boolean not null default true, last_triggered_at timestamptz, next_trigger_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz, retention_until timestamptz
);

create table if not exists public.activity_logs (
  id bigint generated always as identity primary key, household_id uuid not null references public.households(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null, entity_type text not null, entity_id uuid, action text not null,
  metadata jsonb not null default '{}'::jsonb, occurred_at timestamptz not null default now()
);

create index if not exists household_members_user_id_idx on public.household_members(user_id) where deleted_at is null;
create index if not exists financial_records_household_date_idx on public.financial_records(household_id, occurred_on desc) where deleted_at is null;
create index if not exists schedule_items_household_start_idx on public.schedule_items(household_id, starts_at) where deleted_at is null;
create index if not exists documents_household_idx on public.documents(household_id, created_at desc) where deleted_at is null;
create index if not exists documents_search_idx on public.documents using gin(search_vector) where deleted_at is null;
create index if not exists reminders_due_idx on public.reminders(household_id, due_at) where deleted_at is null and enabled;
create index if not exists activity_logs_household_idx on public.activity_logs(household_id, occurred_at desc);

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path = public as $$ begin new.updated_at = now(); return new; end; $$;
create or replace function public.is_household_member(p_household_id uuid) returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.household_members m where m.household_id = p_household_id and m.user_id = auth.uid() and m.deleted_at is null); $$;
create or replace function public.has_household_role(p_household_id uuid, p_roles public.household_role[]) returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.household_members m where m.household_id = p_household_id and m.user_id = auth.uid() and m.deleted_at is null and m.role = any(p_roles)); $$;
create or replace function public.storage_household_id(p_path text) returns uuid language plpgsql immutable set search_path = public as $$ begin return split_part(p_path, '/', 1)::uuid; exception when invalid_text_representation then return null; end; $$;

create or replace function public.create_household_workspace(p_name text, p_slug text, p_timezone text default 'UTC', p_base_currency char(3) default 'USD') returns uuid language plpgsql security definer set search_path = public as $$
declare new_household_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication is required'; end if;
  insert into public.households (name, slug, timezone, base_currency, created_by) values (trim(p_name), lower(trim(p_slug)), coalesce(nullif(trim(p_timezone), ''), 'UTC'), upper(p_base_currency), auth.uid()) returning id into new_household_id;
  insert into public.household_members (household_id, user_id, role) values (new_household_id, auth.uid(), 'owner');
  return new_household_id;
end;
$$;

create or replace function public.accept_household_invitation(p_token text) returns uuid language plpgsql security definer set search_path = public as $$
declare invitation public.household_invitations;
begin
  if auth.uid() is null then raise exception 'Authentication is required'; end if;
  select * into invitation from public.household_invitations where token_hash = encode(digest(p_token, 'sha256'), 'hex') and accepted_at is null and revoked_at is null and expires_at > now() for update;
  if invitation.id is null then raise exception 'Invitation is invalid or expired'; end if;
  insert into public.household_members (household_id, user_id, role) values (invitation.household_id, auth.uid(), invitation.role) on conflict (household_id, user_id) do update set role = excluded.role, deleted_at = null, retention_until = null, updated_at = now();
  update public.household_invitations set accepted_at = now(), accepted_by = auth.uid(), updated_at = now() where id = invitation.id;
  return invitation.household_id;
end;
$$;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$ begin insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')) on conflict (id) do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
insert into public.profiles (id, display_name) select id, coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name') from auth.users on conflict (id) do nothing;

create or replace function public.record_audit_event() returns trigger language plpgsql security definer set search_path = public as $$
declare row_data jsonb; begin row_data := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end; insert into public.activity_logs (household_id, actor_id, entity_type, entity_id, action, metadata) values ((row_data ->> 'household_id')::uuid, auth.uid(), tg_table_name, (row_data ->> 'id')::uuid, lower(tg_op) || ':' || tg_table_name, jsonb_build_object('changed_at', now())); if tg_op = 'DELETE' then return old; end if; return new; end; $$;

do $$ declare t text; begin foreach t in array array['profiles','households','household_members','household_invitations','family_people','financial_records','assets','schedule_items','documents','reminders'] loop execute format('drop trigger if exists %I on public.%I', 'set_' || t || '_updated_at', t); execute format('create trigger %I before update on public.%I for each row execute procedure public.set_updated_at()', 'set_' || t || '_updated_at', t); end loop; end $$;
create trigger audit_family_people after insert or update or delete on public.family_people for each row execute procedure public.record_audit_event();
create trigger audit_financial_records after insert or update or delete on public.financial_records for each row execute procedure public.record_audit_event();
create trigger audit_assets after insert or update or delete on public.assets for each row execute procedure public.record_audit_event();
create trigger audit_schedule_items after insert or update or delete on public.schedule_items for each row execute procedure public.record_audit_event();
create trigger audit_documents after insert or update or delete on public.documents for each row execute procedure public.record_audit_event();
create trigger audit_reminders after insert or update or delete on public.reminders for each row execute procedure public.record_audit_event();

alter table public.profiles enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.household_invitations enable row level security;
alter table public.family_people enable row level security;
alter table public.financial_records enable row level security;
alter table public.assets enable row level security;
alter table public.schedule_items enable row level security;
alter table public.documents enable row level security;
alter table public.record_links enable row level security;
alter table public.reminders enable row level security;
alter table public.activity_logs enable row level security;

create policy "profiles_select_own" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "households_select_member" on public.households for select to authenticated using (deleted_at is null and public.is_household_member(id));
create policy "households_update_owner" on public.households for update to authenticated using (public.has_household_role(id, array['owner']::public.household_role[])) with check (public.has_household_role(id, array['owner']::public.household_role[]));
create policy "members_select_member" on public.household_members for select to authenticated using (deleted_at is null and public.is_household_member(household_id));
create policy "members_update_owner" on public.household_members for update to authenticated using (public.has_household_role(household_id, array['owner']::public.household_role[])) with check (public.has_household_role(household_id, array['owner']::public.household_role[]));
create policy "invitations_select_owner" on public.household_invitations for select to authenticated using (public.has_household_role(household_id, array['owner']::public.household_role[]));
create policy "invitations_insert_owner" on public.household_invitations for insert to authenticated with check (public.has_household_role(household_id, array['owner']::public.household_role[]));
create policy "invitations_update_owner" on public.household_invitations for update to authenticated using (public.has_household_role(household_id, array['owner']::public.household_role[])) with check (public.has_household_role(household_id, array['owner']::public.household_role[]));

create policy "people_select_member" on public.family_people for select to authenticated using (deleted_at is null and public.is_household_member(household_id));
create policy "people_insert_adult" on public.family_people for insert to authenticated with check (public.has_household_role(household_id, array['owner','adult']::public.household_role[]));
create policy "people_update_adult" on public.family_people for update to authenticated using (public.has_household_role(household_id, array['owner','adult']::public.household_role[])) with check (public.has_household_role(household_id, array['owner','adult']::public.household_role[]));
create policy "finance_select_member" on public.financial_records for select to authenticated using (deleted_at is null and public.is_household_member(household_id));
create policy "finance_insert_adult" on public.financial_records for insert to authenticated with check (public.has_household_role(household_id, array['owner','adult']::public.household_role[]));
create policy "finance_update_adult" on public.financial_records for update to authenticated using (public.has_household_role(household_id, array['owner','adult']::public.household_role[])) with check (public.has_household_role(household_id, array['owner','adult']::public.household_role[]));
create policy "assets_select_member" on public.assets for select to authenticated using (deleted_at is null and public.is_household_member(household_id));
create policy "assets_insert_adult" on public.assets for insert to authenticated with check (public.has_household_role(household_id, array['owner','adult']::public.household_role[]));
create policy "assets_update_adult" on public.assets for update to authenticated using (public.has_household_role(household_id, array['owner','adult']::public.household_role[])) with check (public.has_household_role(household_id, array['owner','adult']::public.household_role[]));
create policy "schedule_select_member" on public.schedule_items for select to authenticated using (deleted_at is null and public.is_household_member(household_id));
create policy "schedule_insert_adult" on public.schedule_items for insert to authenticated with check (public.has_household_role(household_id, array['owner','adult']::public.household_role[]));
create policy "schedule_update_adult" on public.schedule_items for update to authenticated using (public.has_household_role(household_id, array['owner','adult']::public.household_role[])) with check (public.has_household_role(household_id, array['owner','adult']::public.household_role[]));
create policy "documents_select_member" on public.documents for select to authenticated using (deleted_at is null and public.is_household_member(household_id));
create policy "documents_insert_adult" on public.documents for insert to authenticated with check (public.has_household_role(household_id, array['owner','adult']::public.household_role[]));
create policy "documents_update_adult" on public.documents for update to authenticated using (public.has_household_role(household_id, array['owner','adult']::public.household_role[])) with check (public.has_household_role(household_id, array['owner','adult']::public.household_role[]));
create policy "links_select_member" on public.record_links for select to authenticated using (deleted_at is null and public.is_household_member(household_id));
create policy "links_insert_adult" on public.record_links for insert to authenticated with check (public.has_household_role(household_id, array['owner','adult']::public.household_role[]));
create policy "links_update_adult" on public.record_links for update to authenticated using (public.has_household_role(household_id, array['owner','adult']::public.household_role[])) with check (public.has_household_role(household_id, array['owner','adult']::public.household_role[]));
create policy "reminders_select_member" on public.reminders for select to authenticated using (deleted_at is null and public.is_household_member(household_id));
create policy "reminders_insert_adult" on public.reminders for insert to authenticated with check (public.has_household_role(household_id, array['owner','adult']::public.household_role[]));
create policy "reminders_update_adult" on public.reminders for update to authenticated using (public.has_household_role(household_id, array['owner','adult']::public.household_role[])) with check (public.has_household_role(household_id, array['owner','adult']::public.household_role[]));
create policy "audit_select_adult" on public.activity_logs for select to authenticated using (public.has_household_role(household_id, array['owner','adult']::public.household_role[]));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values ('family-documents','family-documents',false,52428800,array['application/pdf','image/jpeg','image/png','text/plain']) on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
create policy "family_documents_select_member" on storage.objects for select to authenticated using (bucket_id = 'family-documents' and public.is_household_member(public.storage_household_id(name)));
create policy "family_documents_insert_adult" on storage.objects for insert to authenticated with check (bucket_id = 'family-documents' and public.has_household_role(public.storage_household_id(name), array['owner','adult']::public.household_role[]));
create policy "family_documents_update_adult" on storage.objects for update to authenticated using (bucket_id = 'family-documents' and public.has_household_role(public.storage_household_id(name), array['owner','adult']::public.household_role[])) with check (bucket_id = 'family-documents' and public.has_household_role(public.storage_household_id(name), array['owner','adult']::public.household_role[]));

revoke all on function public.create_household_workspace(text, text, text, char(3)) from public;
grant execute on function public.create_household_workspace(text, text, text, char(3)) to authenticated;
revoke all on function public.accept_household_invitation(text) from public;
grant execute on function public.accept_household_invitation(text) to authenticated;
