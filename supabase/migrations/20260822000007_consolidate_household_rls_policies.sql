-- Consolidate equivalent permissive policies to reduce per-query RLS evaluation while preserving existing access semantics.

drop policy if exists households_select_creator on public.households;
drop policy if exists households_select_member on public.households;
create policy households_select_access on public.households
  for select to authenticated
  using (
    deleted_at is null
    and (
      created_by = (select auth.uid())
      or public.is_household_member(id)
    )
  );

drop policy if exists members_insert_creator_owner on public.household_members;
drop policy if exists members_insert_invited_self on public.household_members;
create policy members_insert_authorized on public.household_members
  for insert to authenticated
  with check (
    (
      user_id = (select auth.uid())
      and role = 'owner'
      and exists (
        select 1 from public.households h
        where h.id = household_id and h.created_by = (select auth.uid())
      )
    )
    or (
      user_id = (select auth.uid())
      and exists (
        select 1 from public.household_invitations i
        where i.household_id = household_id
          and i.role = role
          and lower(i.email::text) = lower(coalesce((select auth.jwt()) ->> 'email', ''))
          and i.accepted_at is null and i.revoked_at is null and i.expires_at > now()
      )
    )
  );

drop policy if exists invitations_select_owner on public.household_invitations;
drop policy if exists invitations_select_recipient on public.household_invitations;
create policy invitations_select_authorized on public.household_invitations
  for select to authenticated
  using (
    public.has_household_role(household_id, array['owner']::public.household_role[])
    or (
      lower(email::text) = lower(coalesce((select auth.jwt()) ->> 'email', ''))
      and accepted_at is null and revoked_at is null and expires_at > now()
    )
  );

drop policy if exists invitations_update_owner on public.household_invitations;
drop policy if exists invitations_accept_recipient on public.household_invitations;
create policy invitations_update_authorized on public.household_invitations
  for update to authenticated
  using (
    public.has_household_role(household_id, array['owner']::public.household_role[])
    or (
      lower(email::text) = lower(coalesce((select auth.jwt()) ->> 'email', ''))
      and accepted_at is null and revoked_at is null and expires_at > now()
    )
  )
  with check (
    public.has_household_role(household_id, array['owner']::public.household_role[])
    or (accepted_at is not null and accepted_by = (select auth.uid()))
  );
