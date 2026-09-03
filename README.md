# THEARCHITECT_MAX MyProjects

Public software/IP asset showroom for THEARCHITECT_MAX.

The site presents **57 canonical private software/IP assets** with evidence-reviewed maturity, market-calibrated strategic transfer pricing, negotiation bands, liquidity references, separate recreation-cost references, dual EUR/USD presentation, commercial direction, launch-priority context, data/evidence foundations where documented, and privacy-preserving GitHub proof.

## Current review state — 03 Sep 2026

- **57 / 57 canonical assets** are backed by private GitHub repositories verified through the connected account.
- **57 / 57 canonical product trees** are represented with a proprietary / All Rights Reserved first-party boundary in the public evidence register.
- **58 private repositories** are currently observed across the portfolio account scope: 57 canonical assets plus one retained legacy perception-migration repository.
- The retained legacy repository is preserved for migration continuity and is not counted as a separate current public asset.
- Third-party libraries, models, datasets, APIs, standards, services and externally authored materials remain governed by their own rights and terms.
- Repository license posture is evidence of the observed repository state; it is not independent legal chain-of-title, trademark, patent/FTO or transaction certification.
- Private repository names, repository IDs, branches, commit identifiers, file trees, source paths, source code, internal architecture and implementation details are intentionally withheld from the public proof layer.

## Current portfolio pricing — release 18

- Market-calibrated strategic asking reference: **€10,310,000**
- Indicative USD conversion: **$11,936,918**
- Defensible portfolio negotiation band: **€8,225,000–€12,900,000**
- Liquidity / quick-sale reference: **€4,070,000**
- Recreation-cost reference retained separately: **€38,770,000**
- Indicative USD recreation-cost conversion: **$44,887,906**
- Strategic asking / recreation-cost relationship: **26.6%**
- Maturity: **33 Software-Validated / 21 Verified Prototype / 3 Research**

EUR is the authoritative portfolio currency. USD figures are indicative conversions using the European Central Bank euro reference rate of **1 EUR = 1.1578 USD**, dated **02 Sep 2026**. They are not independent prices or transaction-date settlement quotes.

The current strategic asking layer is a **seller-side analytical pricing framework**, not an independent appraisal, fairness opinion or certified fair-market value. Verified portfolio-level ARR, profit, customer count, growth and retention are not established, so operating-company SaaS multiples are not applied to current asset pricing.

All 57 canonical asset routes contain static title, description and canonical metadata. Historical public routes for renamed products are retained as `noindex` redirects to their current canonical presentations; no legacy route has been deleted.

Current showroom release: `20260903-18`.

## Release 18 — multi-source price review

Release 18 performs a full market-calibrated price-layer reassessment and exposes only the current pricing framework in the public site and current public pricing data.

### Valuation method

The review triangulates multiple external and internal evidence types:

- **WIPO IP valuation guidance** — cost/replacement methods are retained as a technical baseline for internally developed software and early-stage technology, not as automatic transaction value.
- **Acquire.com 2026 closed SaaS transactions** — profitable SaaS deals continue to anchor primarily on verified operating performance.
- **Software Equity Group 2Q26** — SaaS M&A remains active but selective, with premiums for strategic fit, differentiated data and embedded workflows.
- **SaaS Capital 2026** — private B2B SaaS valuation uses ARR multiples driven by market conditions, ARR growth and net revenue retention; those operating metrics are not assumed where they are not evidenced.
- **Flippa marketplace pricing rules** — non-revenue and concept-stage assets face materially lower marketplace price ceilings than operating businesses, supporting a strong liquidity/commercial-proof discount.
- **BLS and Eurostat labor data** — used only as a reasonableness cross-check on software recreation cost, never as a direct sale-price multiple.
- **ECB reference FX** — used solely for indicative USD conversion.

The documented pricing model applies maturity, commercial-potential and route-to-market factors to the recreation-cost reference. Strategic point estimates are rounded to €5,000. The public negotiation band is 80%–125% of the strategic point. A separate lower liquidity reference estimates the additional discount associated with quick execution and absent operating proof.

### Machine-readable and human-readable evidence

- `assets/pricing-review.json` — canonical release-18 pricing model, sources, factors, portfolio totals and all 57 current asset pricing records.
- `evidence/valuation-review-2026-09-03.md` — full current 57-asset audit table with strategic ask, negotiation band, quick-sale reference and recreation reference.
- `scripts/validate-refresh.mjs` — release-18 local validator checking pricing aggregates, band relationships, source coverage, repository evidence and canonical routes.

## Release 17 — full portfolio reconciliation retained

This release reconciled the public site against the current GitHub portfolio without deleting the existing site architecture, legacy routes or prior validation tooling.

### Added canonical assets

- **Evidence-Grounded Multi-Expert Reasoning System** — Verified Prototype architecture for capability routing, provenance, expert disagreement, claim verification and traceable synthesis.
- **GoldenNet Signal Intelligence Platform** — Software-Validated time-series intelligence platform for causal denoising, anomaly/degradation scoring, RUL regression and evidence-backed model qualification.
- **Autonomous Documentary Engine** — Verified Prototype source-grounded production engine spanning research, verified scripting, rights-aware assets, narration, programmatic editing, QC, rendering and publishing.

### Reconciled current product identities

- **ModularKey Cryptanalysis Platform** replaces the former cryptanalysis presentation while retaining its historical route as a redirect.
- **Protein Structure Evidence Qualification Platform** replaces the former candidate-oriented research presentation and explicitly separates computational prediction from biological evidence.
- **Electric Flight Systems Simulation & Validation Platform** replaces the former eVTOL-focused public identity while preserving the existing early-stage simulation and control scope.
- **Best-of-GitHub Agentic Engineering** is now the presentation identity for the existing agentic engineering control-plane asset.
- **Vision Evidence Governed Multimodal Perception Framework** is now the canonical perception identity; the former perception route and private migration repository are retained for continuity.

### Release 17 site and diligence changes

- Raised the canonical public portfolio from 54 to **57 assets**.
- Added `assets/portfolio-refresh.json` as the release-17 canonical identity reconciliation record.
- Reconciled the privacy-safe GitHub evidence register to 57 canonical assets and recorded the separate 58-repository observed scope.
- Preserved renamed public URLs as `noindex` canonical redirects.
- Added a release-17 validator while retaining the preceding validator as `npm run validate:base`.

## Internal validation

The public site does not require GitHub Actions. Validate the current static release locally with Node.js 20 or newer:

```bash
npm run validate
```

The release-18 validator reconciles the canonical refresh and current pricing layer. It checks canonical asset counts, strategic asking totals, negotiation-band aggregates, liquidity references, recreation-cost arithmetic, maturity and potential classifications, multi-source pricing evidence, repository-evidence SHA-256 integrity, canonical project pages, legacy redirects and release integration.

The previous complete validator remains available as:

```bash
npm run validate:base
```
