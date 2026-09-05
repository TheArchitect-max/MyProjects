# Release 22 Integrity Contract

Release `20260905-22` is an auditability hardening release. It does not increase the asset count or portfolio valuation.

The release preserves historical source files as immutable audit inputs and adds explicit current-state manifests:

- `assets/current-register.json` — authoritative current composition contract;
- `assets/assurance-current.json` — current assurance counts, terminology and exceptions;
- `assets/pricing-current.json` — current portfolio pricing totals and record contract;
- `evidence/repository-register-2026-09-05.json` — repository-scope reconciliation;
- `evidence/valuation-review-2026-09-05.md` — current valuation review.

Historical files such as `assets/projects.json`, `assets/portfolio-refresh.json`, `assets/pricing-review.json` and `assets/assurance-review.json` remain retained for traceability. Their embedded older counts and release identifiers are historical evidence, not current standalone portfolio state.

The supported local release gate is `npm test`. No GitHub Actions workflow is part of the authoritative validation path.
