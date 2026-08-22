# Infrastructure Standards Audit

**Scope:** This review evaluates the Family Lifetime ERP as a private household application using the baseline recorded in [the standards reference](./standards-baseline.md). It is an engineering review, not a claim of certification or banking-regulatory compliance.

| Control area | Current evidence | Assessment | Priority |
| --- | --- | --- | --- |
| Authorization | Supabase SSR clients use only public URL plus anon key; database Row Level Security, active-household checks, invitation workflows, and system-administrator isolation are migration-backed. | Strong application boundary. Live two-user browser verification remains pending. | High — verify externally. |
| Authentication | Password sign-in, magic links, and authenticated password changes are present; password-change request includes the current password. | Sound application flow. Confirm the enabled Supabase Auth setting in a real session. | High — verify externally. |
| Compromised passwords | Supabase advisor reports leaked-password protection disabled. The current plan does not expose this paid capability. | Accepted platform limitation; retain 12-character minimum, current-password confirmation, and user education. | Medium — reassess after plan change. |
| Browser transport and embedding | Security headers now cover framing, MIME sniffing, referrer policy, permitted browser capabilities, transport, cross-origin isolation, and a conservative CSP. | Hardened. | Verify in deployment. |
| Private offline behavior | The service worker now caches only the public shell and explicitly bypasses household, authentication, API, Supabase, and document paths. | Hardened. | Verify after deployment. |
| Operational health | The health endpoint now uses `no-store` and `noindex` response headers. | Hardened. | Monitor in deployment. |
| Database performance | Migrations add foreign-key coverage, optimize direct RLS auth predicates, and consolidate equivalent permissive policies. The advisor no longer reports index-coverage, init-plan, or multiple-policy warnings. Remaining notices are unused-index information while the production workload is still small. | Hardened. | Review after real usage. |
| UI accessibility | Existing touch targets, contrast tokens, focus styles, and responsive checks are present. Current dashboard still prioritizes a generic module grid over concise financial state and action-oriented mobile hierarchy. | Good baseline; redesign required. | High — redesign now. |

## Prioritized corrective actions

1. Verify production headers and PWA updates after deployment.
2. Replace the main dashboard’s generic module-grid emphasis with a mobile-first “household snapshot, attention needed, quick actions, recent activity” hierarchy.
3. Keep live RLS, live current-password enforcement, and real active-household module checks open until they are exercised through family-side sessions.

## Review references

The standard context is detailed in [the project baseline](./standards-baseline.md). The live Supabase advisor’s leaked-password warning remains externally constrained by the active plan; its database performance notices are actionable through this repository’s migration workflow.

After the RLS consolidation migration, a read-only role-matrix query reconfirmed the intended separation: the Htoo Family primary account remains the owner, the second family account remains an adult with Htoo Family active, and the platform system administrator has no household membership or active household. A repository scan also confirms that no runtime service-role credential is consumed.

## Tooling note

The project now runs the `next/core-web-vitals` and `next/typescript` rule sets through ESLint’s FlatCompat bridge. `pnpm lint` completes with zero warnings, and the effective lint configuration contains the `@next/next` rules. Next.js 15.5 still emits a plugin-detection warning during its own build-time heuristic; this is a recognition limitation of that heuristic rather than a missing active rule set. The production build itself completes successfully and the warning should be rechecked on the next framework upgrade.
