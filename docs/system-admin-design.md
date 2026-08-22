# System Administrator Isolation

`htooauntwan@tuta.io` is a platform-level administrator identity, not a household member. It must not receive a row in `household_members`, must have no `active_household_id`, and therefore cannot create, read, update, or delete household-scoped records through the Family ERP modules.

Household finance, assets, schedules, documents, reminders, and family profiles remain governed solely by the existing household membership RLS policies. A dedicated `system_administrators` table will carry the administrator designation. Its RLS policy permits the signed-in administrator to read only their own system role record; no application client may create or change administrator identities.

Family accounts are added only through a household owner's invitation flow with `adult` or `limited` roles. The `owner` role stays reserved for a household member who is responsible for family records.

## Administrator-Led Account Provisioning

The system administrator may create, verify, disable, or otherwise manage **Supabase Auth identities** through the authorized Supabase administration process. This is an identity-provisioning responsibility only; it does not grant the administrator membership in a household or access to Family ERP records.

| Activity | System administrator | Household owner | Resulting household access |
| --- | --- | --- | --- |
| Create or verify a Supabase Auth identity | Allowed through the authorized Supabase administration process | Not required | None by itself |
| Create a household | Not allowed | Allowed for an eligible family identity | Owner receives access only to that household |
| Invite a family account | Not allowed as a platform administrator | Allowed for the household owner | Access is granted only after invitation acceptance |
| Read or change household finance, assets, documents, schedules, reminders, or family records | Not allowed | Allowed only within role and RLS policy limits | Administrator remains denied |

> An Auth identity is not a Family ERP member until it has accepted an invitation and has an active `household_members` row. The system administrator must retain zero active household memberships and a `NULL` `active_household_id`.

For the Htoo Family setup, `htooauntwan@tuta.io` remains the platform system administrator, `primary.drive.htoo@gmail.com` is the household owner, and `poeeiphyu.official@gmail.com` receives family access only through the pending adult invitation acceptance flow.
