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
| Initial-load recovery | The authenticated workspace has a short, useful loading state with a 4.5-second refresh affordance. Dashboard authentication and summary reads now have bounded 4.5-second and 7-second recovery deadlines, returning a safe error state rather than leaving a skeleton indefinitely. | Hardened against an unbounded perceived loading state. | Monitor actual production latency. |
| Mobile shell and accessibility | The mobile header now contains only the brand; a persistent five-item bottom navigation keeps Home, Money, Plan, Family, and Account within a one-hand action zone. The shell preserves keyboard focus styles, touch-sized targets, safe-area padding, and label-based navigation. | Strong mobile baseline. | Continue workflow-by-workflow QA. |

## Prioritized corrective actions

1. Verify production headers, PWA updates, and authenticated response timing after deployment.
2. Continue the workflow redesign in testable sections: dashboard and finance first, then family, assets, schedule, documents, and reminders.
3. Keep live RLS, live current-password enforcement, and real active-household module checks open until they are exercised through family-side sessions.

## Review references

The standard context is detailed in [the project baseline](./standards-baseline.md). The live Supabase advisor’s leaked-password warning remains externally constrained by the active plan; its database performance notices are actionable through this repository’s migration workflow.

After the RLS consolidation migration, a read-only role-matrix query reconfirmed the intended separation: the Htoo Family primary account remains the owner, the second family account remains an adult with Htoo Family active, and the platform system administrator has no household membership or active household. A repository scan also confirms that no runtime service-role credential is consumed.

## Mobile loading remediation — 23 August 2026

The local 390 × 844 verification showed that the prior mobile shell was crowded by theme, security, and sign-out controls, while its full-screen placeholder did not provide a clear recovery path. The shell now presents a compact brand header and a fixed, safe-area-aware five-item navigation bar. The interactive theme control is loaded only on the Account workspace; a small first-paint bootstrap applies a stored preference or explicit QA query preference on every route without rendering persistent visual controls. The loading route retains the accessible busy landmark but presents only a concise household summary placeholder; after 4.5 seconds it explains that loading has taken longer than usual and exposes an explicit refresh control.

The dashboard server route also bounds the two user-visible dependent operations. A delayed or rejected authentication response resolves to the existing signed-out/setup state after 4.5 seconds. A delayed or rejected household-summary response resolves to a non-sensitive error state after 7 seconds, preserving the user’s ability to reload instead of indefinitely seeing private-data skeletons. This mechanism does **not** cache, expose, or retry private household records client-side. Automated tests cover successful, rejected, and deadline-exceeded operations; production timing remains an external verification item because no authenticated production session was available during this review.

The secure-shell chunk was verified locally at **390 × 844** on `/dashboard` and `/finance`, with the simplified header, five-item navigation, safe-area padding, selected-route treatment, setup fallback, and dashboard snapshot all visible. `pnpm lint`, `pnpm typecheck`, the 60-test automated suite, and `NODE_ENV=production pnpm build` passed. The production build reports **116 kB First Load JS for `/dashboard`** and **120 kB for a module route**. Next.js still emits its documented build-time ESLint plugin-detection heuristic warning despite standalone lint passing with zero warnings; this is an existing framework heuristic caveat, not a new regression.

## Independent delivery sequence

| Chunk | Scope | Completion evidence | Status |
| --- | --- | --- | --- |
| 1. Secure mobile shell | Lean header, bottom navigation, safe-area behavior, concise loading state, bounded dashboard recovery, and deferred theme control. | Mobile visual check; lint, typecheck, 60 automated tests, production build. | Complete locally; live active-household verification remains open. |
| 2. Dashboard and money ledger | Primary financial position, urgent obligations, transaction entry, ledger history, currency-safe summaries, and focused mobile actions. | Route/unit tests, mobile light/dark checks, production build. | In progress. |
| 3. Household operations | Family, assets, schedule, and reminders reorganized around a clear next action, compact records, and accessible touch workflows. | Module tests and mobile responsive checks. | Pending. |
| 4. Private document workflows | Mobile document capture/search, metadata linking, private storage status, and recovery messages. | Upload/authorization tests and visual checks. | Pending. |
| 5. Live validation and deployment handoff | Family-side active-household verification, RLS role isolation, current-password setting confirmation, deployed headers, PWA behavior, and response timing. | External authenticated-session and deployment evidence. | Pending external access. |

## Deployment configuration template

The deployment contract requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel’s environment settings. The managed project environment does not permit committing an `.env.example` file through this workflow, so the repository keeps these names documented rather than storing values or a generated local environment file. `SUPABASE_SERVICE_ROLE_KEY` remains intentionally absent from runtime configuration: this application must not add that key or bypass RLS in browser, server, middleware, action, or route code.

## Redesign validation — local evidence

The dashboard now uses a compact **Today** overview, two-column mobile metrics, a dedicated attention center, a three-action task launcher, and a two-column workspace grid. The finance workspace adds an honest, currency-safe **net recorded position** that is explicitly distinguished from a bank balance or forecast. It separates incoming, outgoing, and liability records, preserves transfer neutrality, exposes clear ledger and transaction-entry anchors, and places transaction history before entry on narrow screens.

The remaining operational workspaces now share the same state-action-history pattern. Each presents a module-specific snapshot, a clearly named primary action, history before entry on mobile, touch-sized form submission, and a module-specific private empty state. Family membership reads now run concurrently with family-record reads; module household-context lookup has a bounded recovery deadline. The screenshots reviewed at **390 × 844** covered dashboard plus each module’s no-active-household privacy fallback, while the **1280 × 720** review confirmed the corresponding desktop layout. An active-household screen with live records could not be inspected locally because a family-side authenticated session was unavailable; that verification remains open rather than being inferred.

The final local quality gate completed with zero-warning standalone linting, successful TypeScript checking, **21 test files / 60 tests**, and a successful production build. The resulting first-load JavaScript remains **116 kB for `/dashboard`** and **121 kB for a dynamic module route**. A local `/api/health` response confirmed the no-store/noindex response and the configured CSP, frame, referrer, permissions, content-type, and transport headers.

The theme bootstrap was subsequently verified at **390 × 844** with `?theme=dark` on the public landing page, dashboard, finance privacy fallback, and Account security route. It applied the requested dark palette on first paint while retaining readable text, visible form boundaries, the persistent mobile navigation, and the Account-only display preference control. A real active-household module with live data is intentionally tracked separately because it requires a family-side authenticated session.

The local accessibility and responsiveness review covered visible `:focus-visible` treatment for links, buttons, inputs, selects, textareas, and custom tabindex targets in both color systems; these selectors are protected by automated stylesheet tests. All primary compact actions use at least 44 px controls, and mobile/desktop screenshots covered the revised shell, dashboard, Account controls, and every privacy-preserving module fallback. Live keyboard traversal with actual household data remains an external session verification item rather than an unsubstantiated claim.

## Supabase advisor recheck — 23 August 2026

The active `family-erp` project is healthy in `ap-southeast-1`. The latest security advisor still reports one warning: leaked-password protection is disabled. This matches the documented current-plan limitation and is not remediated by weakening the RLS-only architecture. The latest performance advisor reports only **INFO-level unused-index notices** across household-scoped tables. Because the household has low current traffic and these indexes support established, privacy-scoped query paths, no destructive index removal was performed. The project should reassess actual index use after meaningful production activity rather than optimizing away safeguards based on an empty or low-use workload. [1] [2]

A read-only aggregate of the last 24 hours of Supabase unified logs showed expected database, authentication, edge, connection-pool, realtime, and storage sources. It did not expose a specific server-side fault that explains the reported browser loading state. This is not sufficient to diagnose a Vercel rendering issue because the production URL and an authenticated family-side browser session were unavailable; the local bounded-recovery implementation remains the safe mitigation until deployed request traces can be correlated.

[1]: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
[2]: https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index

## Tooling note

The project now runs the `next/core-web-vitals` and `next/typescript` rule sets through ESLint’s FlatCompat bridge. `pnpm lint` completes with zero warnings, and the effective lint configuration contains the `@next/next` rules. Next.js 15.5 still emits a plugin-detection warning during its own build-time heuristic; this is a recognition limitation of that heuristic rather than a missing active rule set. The production build itself completes successfully and the warning should be rechecked on the next framework upgrade.
