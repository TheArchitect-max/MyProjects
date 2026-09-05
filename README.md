# THEARCHITECT_MAX — MyProjects

Public GitHub Pages showroom for the private software/IP portfolio under the `TheArchitect-max` account.

## Current release

Release `20260905-21` follows a full portfolio/repository reconciliation on 5 September 2026.

- **68 private project repositories observed**.
- **67 canonical portfolio assets**.
- **1 retained legacy perception-migration repository**, not double-counted.
- Maturity: **37 Software-Validated / 25 Verified Prototype / 5 Research**.
- Strategic asking reference: **€11,755,000**.
- Strategic band: **€9,380,000–€14,715,000**.
- Liquidity reference: **€4,625,000**.
- Recreation-cost reference: **€46,420,000**.
- Indicative USD uses the latest ECB working-day rate available on 5 September 2026: **1 EUR = 1.1622 USD**, dated 4 September 2026.

TraceLine is no longer a reserved empty repository. Its v0.3 implementation is now represented as `TA-IP-067` with **Verified Prototype** maturity.

Current repository identities are normalized for Resource-Aware Hybrid Model Orchestration Platform, Biometric Systems Assurance Platform and Evidence-Governed Software Assurance Platform. Historical public paths remain `noindex` redirects.

## Architecture

The site preserves historical portfolio data (`assets/projects.json`, `assets/portfolio-refresh.json`, `assets/pricing-review.json`) and applies the authoritative current reconciliation in `assets/live-release.json`. `assets/portfolio-20260905.js` is the shared runtime for both the homepage and all 67 canonical asset profiles.

The current sitemap includes the four top-level pages plus all 67 canonical project profiles.

## Validation

No GitHub Actions workflow is used. The supported local gate is:

```bash
npm test
```

The Release-21 validator checks the data merge, 67 sequential asset references, pricing aggregates, maturity and potential counts, current identities, all canonical project routes, alias redirects, sitemap coverage, release markers, JavaScript syntax and the absence of `.github/workflows`.

## Evidence boundary

Repository state and internal software validation do not automatically establish scientific validity, field performance, standards certification, legal chain-of-title, regulatory approval, patent/FTO clearance, market traction or transaction value. Third-party rights remain governed by their own terms.

## License

The website source remains proprietary / All Rights Reserved under `LICENSE`.
