# Hearthline Family ERP

Hearthline is a **mobile-first Family Lifetime ERP** foundation built with Next.js App Router, TypeScript, Tailwind CSS, Shadcn-compatible UI primitives, and Supabase. This first delivery establishes authenticated sessions, a migration-managed PostgreSQL model, household-scoped data access, private document storage, and tactile dashboard scaffolding.

## Technology baseline

| Layer | Implementation | Responsibility |
|---|---|---|
| Web application | Next.js App Router + TypeScript | Secure rendering, route handlers, PWA shell, and Vercel readiness. |
| UI | Tailwind CSS + Shadcn-style primitives | Touch-oriented, card-based grayscale interface. |
| Authentication | `@supabase/ssr` | Browser, server, and middleware clients with cookie-backed sessions. |
| Data platform | Supabase PostgreSQL | Migrations, Row Level Security, audit events, and retention fields. |
| File storage | Supabase Storage | Private `family-documents` bucket with household-path policies. |

## Local setup

Configure only the following two runtime variables locally and in **Vercel → Project Settings → Environment Variables**. Do not commit real values.

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser and server | Supabase project API URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser and server | Publishable/anonymous key used with Row Level Security. |

> This managed workspace provisions environment values through deployment configuration rather than committing a local `.env.example` file. The table above is the exact template: set both values in Vercel, leave them out of Git, and do not add a service-role key to this application runtime.

```bash
pnpm install
pnpm dev
```

## Vercel deployment

The repository is ready for Vercel’s standard Next.js deployment flow. Import the GitHub repository, keep the default build command (`pnpm build`) and output configuration, then add the two public variables below to **Production**, **Preview**, and **Development** environments before deploying.

1. Add `NEXT_PUBLIC_SUPABASE_URL` from the connected Supabase project.
2. Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` from the connected Supabase project.
3. Deploy the `main` branch, then open `/api/health` to confirm public configuration is available.
4. In Supabase Auth, allow the deployed Vercel URL and the `/auth/callback` redirect path for email-link sign-in.
5. Enable Supabase Auth email/password sign-in if administrator-provisioned passwords will be used.

> The application does not require or consume `SUPABASE_SERVICE_ROLE_KEY`. Keep that key out of the Vercel runtime for this RLS-only architecture.

## GitHub handoff

The project source is synchronized to [`seinpoe/family-erp`](https://github.com/seinpoe/family-erp) on the `main` branch. Vercel can be connected directly to this repository for automatic deployments on future pushes.

## Database migration

Apply `supabase/migrations/20260822000000_family_erp_foundation.sql` to the connected Supabase project before creating household data. It creates the core ERP schema, roles, invitation functions, RLS policies, audit triggers, soft-delete conventions, and private document bucket.

> File objects must use `{household_id}/{opaque-file-id}/{file-name}`. Storage policies derive the household ID from the first path segment.

After applying the migration, replace `lib/supabase/types.ts` with generated types from the target project as part of every schema-change review.

## Quality gates

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

The `/api/health` route exposes process health and whether public Supabase variables are available, without exposing a secret value.

## RLS-only security model

Every application Supabase client—browser, server, middleware, and server actions—uses the same project URL and anonymous key. Authorization is enforced by the PostgreSQL Row Level Security policies in the checked-in migrations; the application does not instantiate a privileged service-role client or bypass RLS.

## Administrator-provisioned accounts and passwords

The **system administrator** provisions, verifies, and disables Supabase Auth identities through the authorized Supabase administration process. That administrative capability is intentionally separate from Family ERP household access: the administrator receives no household membership, no active household, and no permission to read or write family records.

| Responsibility | Who performs it | Boundary |
|---|---|---|
| Create or set an initial Auth password | System administrator, in Supabase administration | Creates only an identity; it does not grant household access. |
| Assign household access | Household owner through an invitation, or the approved Supabase administration acceptance workflow | Grants only the approved `owner`, `adult`, or `limited` household role. |
| Sign in | Authenticated family account | Use password sign-in at `/login`, or request an email sign-in link. |
| Change a password | Signed-in family account | Use `/account/security`, enter the current password, and choose a new password of at least 12 characters. |

The application never stores, displays, logs, or returns a password. A password change updates only the account’s Supabase Auth credential; it does not alter household membership, role, or RLS permissions.

> **Production prerequisite:** Before enabling password sign-in for family accounts, enable Supabase Auth’s [leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) in the project authentication settings. The latest security review reported this setting as disabled; it is an external Supabase project configuration rather than an application-runtime setting.

## Reminder delivery

The schema records bills, renewals, appointments, birthdays, and custom household obligations. The next slice should add a protected scheduled delivery handler or Supabase Edge Function after the household's delivery channel and timing policy are selected.
