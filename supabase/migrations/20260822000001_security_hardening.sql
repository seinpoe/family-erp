-- Keep extensions out of the exposed API schema and tightly scope callable RPC functions.
create schema if not exists extensions;
alter extension citext set schema extensions;
alter extension pg_trgm set schema extensions;

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.is_household_member(uuid) from public, anon, authenticated;
revoke all on function public.has_household_role(uuid, public.household_role[]) from public, anon, authenticated;
revoke all on function public.storage_household_id(text) from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.record_audit_event() from public, anon, authenticated;
revoke all on function public.create_household_workspace(text, text, text, char(3)) from public, anon, authenticated;
revoke all on function public.accept_household_invitation(text) from public, anon, authenticated;

-- These two RPC functions are intentionally authenticated-only. Both validate auth.uid().
grant execute on function public.create_household_workspace(text, text, text, char(3)) to authenticated;
grant execute on function public.accept_household_invitation(text) to authenticated;
