-- Exposed RPC functions must execute as the caller so every write is authorized by RLS.
drop policy if exists households_select_creator on public.households;
create policy households_select_creator on public.households
  for select to authenticated
  using (created_by = auth.uid());

drop policy if exists households_insert_creator on public.households;
create policy households_insert_creator on public.households
  for insert to authenticated
  with check (created_by = auth.uid() and deleted_at is null);

drop policy if exists members_insert_creator_owner on public.household_members;
create policy members_insert_creator_owner on public.household_members
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and role = 'owner'
    and exists (
      select 1 from public.households h
      where h.id = household_id and h.created_by = auth.uid()
    )
  );

drop policy if exists invitations_select_recipient on public.household_invitations;
create policy invitations_select_recipient on public.household_invitations
  for select to authenticated
  using (
    lower(email::text) = lower(coalesce(auth.jwt() ->> 'email', ''))
    and accepted_at is null and revoked_at is null and expires_at > now()
  );

drop policy if exists members_insert_invited_self on public.household_members;
create policy members_insert_invited_self on public.household_members
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.household_invitations i
      where i.household_id = household_id
        and i.role = role
        and lower(i.email::text) = lower(coalesce(auth.jwt() ->> 'email', ''))
        and i.accepted_at is null and i.revoked_at is null and i.expires_at > now()
    )
  );

drop policy if exists invitations_accept_recipient on public.household_invitations;
create policy invitations_accept_recipient on public.household_invitations
  for update to authenticated
  using (
    lower(email::text) = lower(coalesce(auth.jwt() ->> 'email', ''))
    and accepted_at is null and revoked_at is null and expires_at > now()
  )
  with check (accepted_at is not null and accepted_by = auth.uid());

create or replace function public.create_household_workspace(
  p_name text,
  p_slug text,
  p_timezone text default 'UTC',
  p_base_currency char(3) default 'USD'
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare new_household_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication is required'; end if;
  insert into public.households (name, slug, timezone, base_currency, created_by)
  values (trim(p_name), lower(trim(p_slug)), coalesce(nullif(trim(p_timezone), ''), 'UTC'), upper(p_base_currency), auth.uid())
  returning id into new_household_id;
  insert into public.household_members (household_id, user_id, role)
  values (new_household_id, auth.uid(), 'owner');
  return new_household_id;
end;
$$;

create or replace function public.accept_household_invitation(p_token text)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare invitation public.household_invitations;
begin
  if auth.uid() is null then raise exception 'Authentication is required'; end if;
  select * into invitation
  from public.household_invitations
  where token_hash = encode(digest(p_token, 'sha256'), 'hex')
    and accepted_at is null and revoked_at is null and expires_at > now()
  for update;
  if invitation.id is null then raise exception 'Invitation is invalid or expired'; end if;
  if lower(invitation.email::text) <> lower(coalesce(auth.jwt() ->> 'email', '')) then raise exception 'Invitation email does not match signed-in user'; end if;
  insert into public.household_members (household_id, user_id, role)
  values (invitation.household_id, auth.uid(), invitation.role);
  update public.household_invitations
  set accepted_at = now(), accepted_by = auth.uid(), updated_at = now()
  where id = invitation.id;
  return invitation.household_id;
end;
$$;

revoke all on function public.create_household_workspace(text, text, text, char(3)) from public, anon;
grant execute on function public.create_household_workspace(text, text, text, char(3)) to authenticated;
revoke all on function public.accept_household_invitation(text) from public, anon;
grant execute on function public.accept_household_invitation(text) to authenticated;
