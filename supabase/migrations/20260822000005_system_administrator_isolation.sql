-- System administrators are platform identities, not household members.
create table if not exists public.system_administrators (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

comment on table public.system_administrators is 'Platform-level administrators that must remain outside household-scoped Family ERP data.';

alter table public.system_administrators enable row level security;
revoke all on table public.system_administrators from anon;
revoke insert, update, delete on table public.system_administrators from authenticated;
grant select on table public.system_administrators to authenticated;

drop policy if exists system_administrators_select_self on public.system_administrators;
create policy system_administrators_select_self on public.system_administrators
  for select to authenticated
  using (user_id = auth.uid());

-- A system administrator cannot create a household and therefore cannot become an owner.
drop policy if exists households_insert_creator on public.households;
create policy households_insert_creator on public.households
  for insert to authenticated
  with check (
    created_by = auth.uid()
    and deleted_at is null
    and not exists (
      select 1 from public.system_administrators administrator
      where administrator.user_id = auth.uid()
    )
  );

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
  if exists (select 1 from public.system_administrators where user_id = auth.uid()) then
    raise exception 'System administrator accounts cannot create household workspaces';
  end if;
  insert into public.households (name, slug, timezone, base_currency, created_by)
  values (trim(p_name), lower(trim(p_slug)), coalesce(nullif(trim(p_timezone), ''), 'UTC'), upper(p_base_currency), auth.uid())
  returning id into new_household_id;
  insert into public.household_members (household_id, user_id, role)
  values (new_household_id, auth.uid(), 'owner');
  return new_household_id;
end;
$$;

revoke all on function public.create_household_workspace(text, text, text, char(3)) from public, anon;
grant execute on function public.create_household_workspace(text, text, text, char(3)) to authenticated;
