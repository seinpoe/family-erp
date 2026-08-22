# Theme Verification Record

The requested palette is implemented through shared semantic tokens: primary blue `#1877F2`, white `#FFFFFF`, Athens Gray canvas `#F0F2F5`, dark card `#242526`, and dark canvas `#18191A`.

| Verification target | Light-mode review | Dark-mode review |
| --- | --- | --- |
| Public home | Blue primary actions and logo remain legible against white and Athens Gray surfaces. | White typography and blue actions remain legible on the dark neutral canvas and feature panel. |
| Sign-in and password security | Inputs, labels, and blue submit actions preserve visible borders and focus accents. | Dark tokens preserve readable labels, inputs, and buttons when the browser preference is dark. |
| Dashboard and modules | Surface cards retain neutral separation with blue module and action accents. | Dark canvas, `#242526` cards, white text, and blue module icons remain distinguishable. |

The persistent bottom-right control lets users choose light or dark mode. The selected preference is stored only in the browser and does not alter household data, access roles, or Supabase sessions.

## Direct dark-mode checks

Headless Chromium was run with a forced dark preference against `/`, `/login`, `/dashboard`, and `/account/security`. The public and password routes rendered with the intended dark neutrals, readable white labels and text, bordered dark inputs, and blue primary actions. The dashboard also rendered its active workspace surfaces with a dark canvas, dark-neutral cards, readable summary metrics, and blue module icons.

The protected `/family` route was also checked while no active household was available. Instead of a blank streamed redirect, it now displays an explicit household-setup fallback with readable text and a blue dashboard action; no household data is shown.

Mobile dark-mode checks at a 375 px viewport were also captured for the dashboard and password-security route. The touch-sized theme control remained reachable, dark card surfaces retained separation from the `#18191A` canvas, white text stayed readable, and blue primary actions preserved contrast.

The public homepage and sign-in route were additionally checked at the same mobile width. The blue logo and primary actions remain distinct from the dark neutral surfaces, and password fields retain visible boundaries and readable labels.

The in-app preference was also exercised directly through the supported `?theme=dark` override at mobile width. The dashboard and password-security screens remained dark even without forcing the browser color scheme, confirming that the app-controlled preference applies its token set after hydration.

The public homepage and sign-in screen were checked with the same explicit override. Both maintained readable white text, blue actions, and visible dark input boundaries at the mobile breakpoint.
