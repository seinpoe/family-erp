# Family Lifetime ERP Standards Baseline

This audit uses **OWASP ASVS 5.0** as the secure web-application verification baseline, **NIST CSF 2.0** as the operational risk-management lens, and **WCAG 2.2 Level AA** as the accessibility target for the mobile-first experience. These references guide implementation and review; they do not assert regulatory certification.

| Area | Baseline used | Applied objective |
| --- | --- | --- |
| Application security | OWASP ASVS 5.0 | Verify authentication, authorization, input handling, secure configuration, data protection, and error behavior. |
| Operational resilience | NIST CSF 2.0 | Maintain clear governance, asset awareness, protections, detection signals, recovery readiness, and reviewable decisions. |
| Mobile accessibility | WCAG 2.2 AA and WCAG2Mobile | Preserve keyboard access, visible focus, reflow, readable contrast, adequate targets, predictable navigation, and accessible authentication. |
| Banking-style interaction | Product design control | Make balances, activity, confirmation states, and navigation unambiguous; avoid deceptive or ambiguous controls. |

## Scope boundary

The Family ERP is a **private household operations application**, not a regulated bank, payment processor, investment adviser, or custodial financial institution. “Banking-style” therefore means conservative interaction design and strong security controls, rather than a claim of banking or regulatory compliance.

## References

1. [OWASP Application Security Verification Standard 5.0](https://owasp.org/www-project-application-security-verification-standard/)
2. [NIST Cybersecurity Framework 2.0](https://www.nist.gov/cyberframework)
3. [W3C Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/)
4. [W3C Guidance on Applying WCAG 2.2 to Mobile Applications](https://www.w3.org/TR/wcag2mobile-22/)
