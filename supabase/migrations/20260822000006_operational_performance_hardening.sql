-- Operational performance hardening: cover foreign keys and avoid per-row auth helper evaluation in RLS policies.
-- This migration preserves the existing RLS authorization model and does not grant any additional data access.

create index if not exists activity_logs_actor_id_idx on public.activity_logs(actor_id) where actor_id is not null;
create index if not exists assets_household_id_idx on public.assets(household_id) where deleted_at is null;
create index if not exists assets_created_by_idx on public.assets(created_by) where deleted_at is null;
create index if not exists documents_created_by_idx on public.documents(created_by) where deleted_at is null;
create index if not exists family_people_household_id_idx on public.family_people(household_id) where deleted_at is null;
create index if not exists family_people_created_by_idx on public.family_people(created_by) where deleted_at is null;
create index if not exists financial_records_created_by_idx on public.financial_records(created_by) where deleted_at is null;
create index if not exists households_created_by_idx on public.households(created_by) where deleted_at is null;
create index if not exists invitations_household_pending_idx on public.household_invitations(household_id, expires_at) where accepted_at is null and revoked_at is null;
create index if not exists invitations_invited_by_idx on public.household_invitations(invited_by);
create index if not exists invitations_accepted_by_idx on public.household_invitations(accepted_by) where accepted_by is not null;
create index if not exists profiles_active_household_id_idx on public.profiles(active_household_id) where active_household_id is not null;
create index if not exists record_links_household_id_idx on public.record_links(household_id) where deleted_at is null;
create index if not exists record_links_created_by_idx on public.record_links(created_by) where deleted_at is null;
create index if not exists reminders_created_by_idx on public.reminders(created_by) where deleted_at is null;
create index if not exists schedule_items_created_by_idx on public.schedule_items(created_by) where deleted_at is null;
create index if not exists system_administrators_created_by_idx on public.system_administrators(created_by) where created_by is not null;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated using (id = (select auth.uid()));
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists system_administrators_select_self on public.system_administrators;
create policy system_administrators_select_self on public.system_administrators for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists households_select_creator on public.households;
create policy households_select_creator on public.households for select to authenticated using (created_by = (select auth.uid()));
drop policy if exists households_insert_creator on public.households;
create policy households_insert_creator on public.households
  for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and deleted_at is null
    and not exists (select 1 from public.system_administrators administrator where administrator.user_id = (select auth.uid()))
  );

drop policy if exists members_insert_creator_owner on public.household_members;
create policy members_insert_creator_owner on public.household_members
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and role = 'owner'
    and exists (select 1 from public.households h where h.id = household_id and h.created_by = (select auth.uid()))
  );

drop policy if exists members_insert_invited_self on public.household_members;
create policy members_insert_invited_self on public.household_members
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.household_invitations i
      where i.household_id = household_id
        and i.role = role
        and lower(i.email::text) = lower(coalesce((select auth.jwt()) ->> 'email', ''))
        and i.accepted_at is null and i.revoked_at is null and i.expires_at > now()
    )
  );

drop policy if exists invitations_select_recipient on public.household_invitations;
create policy invitations_select_recipient on public.household_invitations
  for select to authenticated
  using (
    lower(email::text) = lower(coalesce((select auth.jwt()) ->> 'email', ''))
    and accepted_at is null and revoked_at is null and expires_at > now()
  );

drop policy if exists invitations_accept_recipient on public.household_invitations;
create policy invitations_accept_recipient on public.household_invitations
  for update to authenticated
  using (
    lower(email::text) = lower(coalesce((select auth.jwt()) ->> 'email', ''))
    and accepted_at is null and revoked_at is null and expires_at > now()
  )
  with check (accepted_at is not null and accepted_by = (select auth.uid()));
