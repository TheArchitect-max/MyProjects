# THEARCHITECT_MAX — Technology & IP Portfolio

Public commercial portfolio for **79 active standalone software and digital intellectual-property assets**. Every active project is treated as its own IP asset. The portfolio also uses **12 classification families** to help professional counterparties navigate related subject areas.

## IM21 website release

- Complete responsive visual refresh across the overview, six information pages and 79 asset profiles.
- One consistent navigation and footer, including Evidence on every active route.
- Opportunity aligned to the current EUR 71.598M triangulated reference and 19.7% asking ratio; superseded scenario figures removed.
- Asset profiles, family cards and all 79 schedule entries are rendered into HTML at build time for direct reading and indexing.
- Search, family/sector filters and sorting progressively enhance the static schedule.
- Asset-specific canonical URLs and metadata exist before JavaScript executes.
- Repository inventory checked through the connected GitHub account: 80 repositories, including the portfolio website, correspond to 79 active asset records. This is an inventory check, not a technical or rights audit of those repositories.
- Existing seller pricing, development classifications and IM20 economic assumptions are retained; this presentation release does not re-appraise the assets.

Rebuild the presentation after editing data or templates:

```bash
npm run build
npm test
```

The existing GitHub Pages publication remains the destination. No custom GitHub Actions workflow is added.

## Current public presentation

- 79 standalone active IP assets
- 79 assets with individual seller-side commercial references
- 79 assets with individual probability-adjusted economic valuation records
- 12 classification families — navigation/taxonomy only
- 8 commercial sectors
- EUR 14,075,000 aggregate seller asking reference
- EUR 11,220,000–17,645,000 aggregate asking range
- EUR 60,150,000 current recreation/replacement-cost baseline
- EUR 67,966,649 aggregate market/comparable proxy
- EUR 80,368,396 aggregate income/licensing proxy
- EUR 76,838,904 aggregate probability-adjusted strategic value
- EUR 71,598,124 preliminary triangulated economic reference
- approximately EUR 906,305 average triangulated economic reference per standalone asset
- seller ask equals approximately 19.7% of the preliminary triangulated economic reference
- 41 developed software assets / 32 developed prototypes / 6 research-stage assets

## Standalone asset policy

**One active project equals one standalone IP asset.** Family membership does not merge ownership, rights, provenance, technical identity, valuation or transferability. A classification family is not itself an IP asset and carries no independent asking price.

Two or more standalone assets may be negotiated together, but each included asset must be explicitly identified and independently diligenced. Rights to one asset do not automatically extend to another asset in the same classification family.

The active schedule excludes retired predecessors from commercial counts and valuation totals. TA-IP identifiers remain stable historical references and are not renumbered or reused. **TA-IP-001 Research Orchestrator** is retired after its repository was removed; **TA-IP-012 Research Intelligence Fabric** remains a separate active asset. TA-IP-014 remains intentionally absent from the active register.

## IM20 valuation architecture

The portfolio keeps the following valuation lenses separate at **individual asset level**:

1. **Replacement Cost** — current recreation/replacement-cost baseline.
2. **Market / Comparable Proxy** — preliminary marketability indication pending direct subject-asset comparables.
3. **Income / Licensing Proxy** — preliminary monetization indication pending buyer-specific forecasts, royalty benchmarks or other defensible income inputs.
4. **Probability-adjusted Strategic Value** — adjusted for technical completion, commercialization probability, rights/transfer diligence reserve, time/risk and sector context.
5. **Seller Asking Price** — deliberately separate from economic-value modelling.
6. **Preliminary Triangulated Economic Reference** — combines the first four lenses at asset level using explicit weights.

Current triangulation weights remain replacement cost 25%, market/comparable proxy 20%, income/licensing proxy 20% and probability-adjusted strategic value 35%.

The aggregate seller ask of EUR 14.075 million is approximately **23.4% of the current replacement-cost baseline** and **19.7% of the preliminary triangulated economic reference**.

The 79 individual records are stored in `assets/asset-economic-valuations.csv`. Model definitions and factors are stored in `assets/economic-methodology.json`.

## External market evidence calibration

IM20 adds `assets/external-market-evidence.json`, a primary-source evidence register covering strategic transactions across the eight portfolio sectors.

The register currently contains 13 transaction anchors including enterprise AI, data, infrastructure, identity/security, industrial simulation, scientific R&D software, vertical professional software and media/creator technology.

Six selected mature targets have disclosed revenue sufficient to derive rough deal-value/revenue ratios. In this illustrative sample the ratios range from approximately **4.88x to 24.98x**, with a median around **13.05x**.

Those ratios are **not applied directly to the portfolio assets**. The sample mixes enterprise value and equity value, uses different revenue periods and contains mature operating companies. The evidence is used first to calibrate sector demand and confidence. Direct market valuation requires subject-asset comparability in rights, maturity, revenue, growth, useful life, geography, transaction date and transaction structure.

The public evidence page is `evidence.html`.

## Replacement-cost completeness

IM20 also adds `assets/replacement-cost-scope.json`.

The current EUR 60.150 million baseline is retained as a cost-approach reference, but it is **not yet represented as a fully componentized all-in replacement-cost audit**.

The next replacement-cost gate audits each asset for inclusion of:

- software engineering and implementation
- architecture and systems design
- domain research and R&D
- QA, testing and validation
- security and hardening
- deployment, packaging and operations
- documentation and transfer material
- data, models and evaluation assets
- productization and UX
- compliance and regulatory engineering where relevant
- IP, licence and provenance qualification
- project and programme management
- failed-R&D / learning cost where defensible

No automatic uplift is applied. The audit must avoid double counting work already reflected in the current baseline.

## Probability architecture

Current transparent modelling assumptions include:

- technical completion probability: research 50%, developed prototype 75%, developed software 95%
- commercialization probability: specialist 25%, moderate 40%, high 55%, very high 70%
- time/risk factor: research 70%, prototype 85%, developed software 95%
- rights/transfer diligence reserve: 85% pending transaction-stage verification

These are internal modelling assumptions, not institution-prescribed probabilities. They are intended to make uncertainty explicit and should be replaced or calibrated with stronger asset-specific evidence during diligence.

## Reference frameworks

The valuation architecture is informed by:

1. **WIPO** — cost, market, income, real-options and Monte Carlo IP valuation guidance.
2. **International Valuation Standards / IVSC** — including IVS 210 Intangible Assets.
3. **RICS** — Valuation of Intellectual Property Rights professional standard.
4. **OECD** — intangibles, DEMPE and value-creation guidance.
5. **IFRS IAS 38** — identifiability, separability and future-economic-benefit concepts.
6. **ISO 56005:2020** — intellectual-property management within innovation processes.
7. **EPO** — patent-management and valuation guidance.
8. **JPO** — intellectual-property valuation and commercialization context.
9. **USPTO** — IP valuation, commercialization and technology-transfer context.

These references inform terminology, method selection and diligence design. They do **not** mean that any named institution has reviewed the repositories, certified the model, endorsed an amount or issued a formal appraisal.

## Confidence boundary

- replacement-cost lens: medium confidence; full component audit still pending
- market/comparable proxy: low-to-medium by sector; primary transaction anchors exist but direct comparability is not established
- income/licensing proxy: low confidence until defendable economic forecasts or royalty benchmarks are available
- probability-adjusted strategic value: modelled
- triangulated economic reference: preliminary

A transaction-stage valuation should replace proxies with narrow comparable transactions, royalty evidence, cash-flow forecasts, discount rates, useful-life assumptions, remaining development costs, legal/IP diligence and buyer-specific synergies.

## Local validation

```bash
npm test
```

The IM20 validation gate checks the 79 economic records, aggregate lens totals, external evidence registry, sector coverage, illustrative-ratio metadata, replacement-cost audit framework, project-route coverage and principal public valuation figures.

No GitHub Actions workflow is used.

## Important notice

All published values are seller-side references for professional discussion. The preliminary economic model is not an independent appraisal, fairness opinion, audited valuation, certified market value or guarantee of transaction value. Buyer-specific diligence remains necessary.

## License

The website and first-party presentation materials are proprietary and All Rights Reserved. Third-party rights remain subject to their respective terms.
