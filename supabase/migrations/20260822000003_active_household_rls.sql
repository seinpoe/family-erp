-- Persist the member's current workspace without allowing cross-household preferences.
alter table public.profiles
  add column if not exists active_household_id uuid references public.households(id) on delete set null;

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and (
      active_household_id is null
      or public.is_household_member(active_household_id)
    )
  );
