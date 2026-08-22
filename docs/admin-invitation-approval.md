# Administrator-Approved Invitation Acceptance

This document records the **exception workflow** used only when the platform system administrator is explicitly authorized to complete a household invitation directly through Supabase administration. It is not an application runtime pathway and does not add a service-role credential to the Next.js or Vercel environment.

## Required checks

Before approving an invitation, the administrator verifies that the invitation is pending, unrevoked, unexpired, and belongs to the intended household. The recipient must already be a confirmed Supabase Auth identity, the requested role must be `adult` or `limited` rather than `owner`, and the recipient must not be a platform system administrator.

| Control | Required outcome |
| --- | --- |
| Invitation identity | Exact intended recipient email and household match. |
| Invitation validity | `accepted_at` and `revoked_at` are empty; expiry is in the future. |
| Recipient eligibility | A matching Supabase Auth identity exists and is not in `system_administrators`. |
| Role boundary | The role is the invitation’s non-owner role; no discretionary role escalation occurs. |
| Membership activation | The recipient receives one active membership for the invited household and may receive that household as the active household. |
| Invitation record | Acceptance timestamp and recipient identity are persisted. |
| Auditability | An administrative acceptance audit event identifies the administrative workflow, without recording passwords or raw invitation tokens. |
| Administrator isolation | The administrator retains zero household memberships and a `NULL` active household. |

## Htoo Family verification

The Htoo Family adult invitation for `poeeiphyu.official@gmail.com` was approved through this authorized Supabase administration workflow. The final access matrix was re-queried afterward: `primary.drive.htoo@gmail.com` is the household owner, `poeeiphyu.official@gmail.com` is an adult with Htoo Family selected as the active household, and `htooauntwan@tuta.io` remains the platform system administrator with no household membership and no active household.

> The system administrator’s provisioning function never grants access to income, expenses, assets, documents, schedules, reminders, or other household records. Those permissions continue to derive solely from household membership and Row Level Security.
