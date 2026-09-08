# THEARCHITECT_MAX — Technology & IP Portfolio

Public commercial portfolio for **79 active standalone software and digital intellectual-property assets**. Every active project is treated as its own IP asset. The portfolio also uses **12 classification families** to help professional counterparties navigate related subject areas.

## Current public presentation

- 79 standalone active IP assets
- 79 assets with individual seller-side commercial references
- 12 classification families — navigation/taxonomy only
- 8 commercial sectors
- EUR 14,075,000 aggregate indicative asking reference
- EUR 11,220,000–17,645,000 aggregate indicative asking range
- EUR 60,150,000 aggregate recreation/replacement-cost reference
- approximately EUR 78.5 million modelled base strategic-potential expectation
- approximately EUR 47.1 million–138.3 million strategic-potential scenario envelope
- 41 developed software assets / 32 developed prototypes / 6 research-stage assets
- EUR is authoritative; USD is shown indicatively
- each active asset has its own TA-IP reference, commercial description, value references and diligence perimeter

## Standalone asset policy

**One active project equals one standalone IP asset.** Family membership does not merge ownership, rights, provenance, technical identity, valuation or transferability. A classification family is not itself an IP asset and carries no independent asking price.

Two or more standalone assets may be negotiated together, but each included asset must be explicitly identified and independently diligenced. Rights to one asset do not automatically extend to another asset in the same classification family.

The active schedule excludes retired predecessors from commercial counts and valuation totals. TA-IP identifiers remain stable historical references and are not renumbered or reused. **TA-IP-001 Research Orchestrator** is retired after its repository was removed; **TA-IP-012 Research Intelligence Fabric** remains a separate active asset. TA-IP-014 remains intentionally absent from the active register.

## Valuation architecture

The public portfolio keeps three concepts separate:

1. **Seller-side asking reference** — a deliberately conservative transaction reference.
2. **Recreation/replacement-cost baseline** — the estimated cost of recreating comparable software and current work product as-is.
3. **Strategic-potential expectation** — a separate portfolio-level scenario model intended to expose economic optionality not captured by pure development cost.

At the current aggregate level, the EUR 14.075 million asking reference equals approximately **23.4% of the EUR 60.150 million replacement-cost baseline** and approximately **17.9% of the EUR 78.5 million modelled base strategic-potential expectation**.

The strategic-potential model is intentionally not an asset-by-asset DCF. It does not invent revenues. It uses the existing distribution of development stages and qualitative commercial-potential classes with explicit low/base/high modelling factors. The current scenario envelope is approximately **EUR 47.1 million–138.3 million**, with a base expectation of approximately **EUR 78.5 million**.

The model assumptions are stored in `assets/valuation-model.json`.

## Reference frameworks

The valuation architecture is informed by a broader set of recognized standards and institutional guidance than pure code-development cost alone:

1. **WIPO** — IP valuation guidance and the 2025 technology-transfer valuation guide, including cost, market, income, real-options and Monte Carlo methods.
2. **International Valuation Standards / IVSC** — IVS 100–106 and IVS 210 Intangible Assets.
3. **RICS** — Valuation of Intellectual Property Rights professional standard.
4. **OECD** — guidance on intangibles, DEMPE and value creation.
5. **IFRS IAS 38** — identifiability, separability, future-economic-benefit and measurement concepts for intangible assets including software.
6. **ISO 56005:2020** — systematic IP management within innovation processes.
7. **EPO** — patent-management and valuation guidance including cost, market and income approaches.
8. **JPO** — intellectual-property valuation training materials and commercialization context.
9. **USPTO** — IP valuation, commercialization, technology-transfer and economic-context resources.

These references inform the architecture and terminology. They do **not** mean that any named institution has reviewed the repositories, certified the portfolio model, endorsed an individual amount or issued a formal appraisal.

## Commercial potential

Commercial-potential labels are qualitative screening dimensions and are separate from the asking price:

- **Very high** — broad strategic optionality and multiple plausible commercialization routes.
- **High** — clear commercial relevance and credible licensing, integration or productization routes.
- **Moderate** — narrower buyer fit or additional development dependence.
- **Specialist** — concentrated niche or research utility for a smaller set of counterparties.

The potential classifications are not guarantees of future value. During transaction-stage diligence they should be supplemented or replaced by reliable comparable transactions, royalty data, buyer-specific cash-flow forecasts, discount rates, real-options inputs, regulatory requirements and integration synergies.

## Latest commercial references

- **TA-IP-078 Adaptive Neural Architecture Platform** — EUR 125,000 ask; EUR 100,000–160,000 range; EUR 650,000 recreation-cost reference.
- **TA-IP-079 Bio-Inspired Neural Dynamics & Active Inference Simulation Platform** — EUR 145,000 ask; EUR 115,000–185,000 range; EUR 750,000 recreation-cost reference.
- **TA-IP-080 CardioSignal Intelligence Platform** — EUR 110,000 ask; EUR 85,000–140,000 range; EUR 550,000 recreation-cost reference.
- **TA-IP-081 Secure Actuation Integrity Platform** — EUR 225,000 ask; EUR 180,000–285,000 range; EUR 850,000 recreation-cost reference.

## Local validation

```bash
npm test
```

The local validation gate checks the 79 active standalone assets, individual commercial-reference coverage, aggregate asking/range/recreation totals, strategic-potential model invariants, classification-family coverage, project routes, sitemap coverage, runtime syntax and the absence of the retired Research Orchestrator route.

No GitHub Actions workflow is used.

## Important notice

All values are calculated seller-side references for professional discussion. The strategic-potential model is a transparent internal scenario model, not an independent appraisal, fairness opinion, audited valuation or guarantee of transaction value. Buyer-specific diligence remains necessary.

## License

The website and first-party presentation materials are proprietary and All Rights Reserved. Third-party rights remain subject to their respective terms.
