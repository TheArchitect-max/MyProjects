# THEARCHITECT_MAX — MyProjects

Public GitHub Pages showroom for the private software/IP portfolio under the `TheArchitect-max` account.

## Current release

Release `20260905-22` is an auditability-hardening release following the full repository reconciliation performed on 5 September 2026.

Current register:

- **68 private project repositories observed**;
- **67 canonical portfolio assets**;
- **1 retained legacy perception-migration repository**, not double-counted;
- maturity: **37 Software-Validated / 25 Verified Prototype / 5 Research**;
- strategic asking reference: **EUR 11,755,000**;
- strategic band: **EUR 9,380,000–14,715,000**;
- liquidity reference: **EUR 4,625,000**;
- recreation-cost reference: **EUR 46,420,000**;
- indicative USD conversion uses the ECB 4 September 2026 reference rate of **1 EUR = 1.1622 USD**.

TraceLine is represented as `TA-IP-067` with **Verified Prototype** maturity after an executable v0.3 implementation appeared in the repository.

## Release-22 data architecture

The repository intentionally retains earlier machine-readable review files as historical evidence. Their older embedded counts are not current standalone portfolio state.

Current-state contracts:

- `assets/current-register.json` — authoritative current composition contract;
- `assets/assurance-current.json` — current assurance counts, terminology and material exceptions;
- `assets/pricing-current.json` — current pricing totals and record-source contract;
- `assets/live-release.json` — current identity overrides, assets 65–67, counts and caveats;
- `evidence/repository-register-2026-09-05.json` — current repository-scope reconciliation;
- `evidence/valuation-review-2026-09-05.md` — current seller-side valuation review;
- `evidence/release22-integrity.md` — release provenance explanation.

Historical inputs retained for auditability:

- `assets/projects.json` — Release 16 historical base;
- `assets/portfolio-refresh.json` — Release 19 identity/addition layer;
- `assets/pricing-review.json` — Release 19 price rows for TA-IP-001 through TA-IP-064;
- `assets/assurance-review.json` — Release 19 assurance detail snapshot.

The browser runtime verifies the historical source versions against `assets/current-register.json` before declaring the current register valid.

## Current identity notes

- TA-IP-005: Continuum State Integrity Platform.
- TA-IP-008: ModularKey Cryptanalysis Platform.
- TA-IP-017: Protein Structure Evidence Qualification Platform.
- TA-IP-030: Resource-Aware Hybrid Model Orchestration Platform; README still retains the historical Lewis label.
- TA-IP-034: Electric Flight Systems Simulation & Validation Platform.
- TA-IP-037: Biometric Systems Assurance Platform; README still retains the historical SentinelBio Verify label.
- TA-IP-041: Evidence-Governed Software Assurance Platform.
- TA-IP-054: Vision Evidence Governed Multimodal Perception Framework; canonical destination is currently an empty migration target while one legacy perception repository is retained for continuity.
- TA-IP-067: TraceLine — Evidence-Governed Investigation Framework.

## Validation

No GitHub Actions workflow is used. Run the supported local gate with Node.js 20 or newer:

```bash
npm test
```

The Release-22 validator checks the current data contract, historical-source versions, portfolio arithmetic, maturity/potential counts, current identities, current assurance/pricing/repository manifests, all 67 canonical routes, nine historical aliases, sitemap coverage, JavaScript syntax, proprietary website license boundary and absence of `.github/workflows`.

## Evidence boundary

Repository state and internal software validation do not automatically establish scientific validity, clinical validity, field performance, standards certification, regulatory approval, legal chain-of-title, trademark clearance, patent/FTO clearance, market traction or transaction value. Third-party rights remain governed by their own terms.

## License

The website source remains proprietary / All Rights Reserved under `LICENSE`.
