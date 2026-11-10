# Aerospace Mission Simulator

TA-IP-030 | Reference name: Celeste

Assessment date: 2026-11-10

## Product overview

A deterministic mission research simulator with route and fault studies, robust planning and a lumped battery model linking charge, resistive losses, temperature and available propulsion power.

Identified edition: 2.9.0

A deterministic mission research simulator with route and fault studies, robust planning and a lumped battery model linking charge, resistive losses, temperature and available propulsion power.

## Potential acquirers

- Aerospace research groups
- Mission-planning software vendors
- Vehicle engineering teams

## Documented functions

- Simulate mission, route and fault scenarios
- Compare robust planning and energy margins
- Model charge-dependent voltage and resistive loss
- Propagate thermal and low-charge power derating
- Retain deterministic battery and supervisory histories

## Output types

- Mission comparisons
- Scenario telemetry
- Safety-review records

## Material scope boundaries

- This is research/software-in-the-loop scope. Battery qualification, real-aircraft performance, operational flight evidence and aircraft certification are not established.

## Acquisition evidence profile

- Technical scope: V — A deterministic mission research simulator with route and fault studies, robust planning and a lumped battery model linking charge, resistive losses, temperature and available propulsion power. The offered edition and material boundaries govern review.
- Evidence and validation: E2 — Tests plus validation/qualification evidence identified. Detailed source-specific records are reviewed under agreed confidentiality; independent intended-use acceptance remains separate.
- Rights and component obligations: R2 — R1 plus dependency/third-party disclosure basis identified. Review the agreed first-party rights, third-party obligations and delivery perimeter.
- Commercial basis: C2 — Seller ask and reproducible economic reference established. Market value is not established.
- Delivery and handover: T3 — T2 plus validation, build/release and dependency-disclosure evidence. The listed conditions and written delivery agreement govern acceptance.

Offered first-party scope: Specifically agreed first-party implementation, documentation and retained evidence for 2.9.0. Third-party software, datasets, models, content, service entitlements and future qualification remain subject to separate terms.

Development: No separate open candidate at the reviewed snapshot.

## Conditions before handover

- Run the complete v2.9 mission/robust-planner integration gate, calibrate battery parameters against permissioned measurements and define scenario acceptance.
- Dependency manifest exists without an identified lockfile; reproducibility should be reviewed.
- A detailed component inventory and licensing report are required for the agreed delivery scope.
- A security assessment or an explicit statement of its absence is required before acceptance.
- Release identity and provenance evidence remain incomplete.
- An explicit delivery manifest and handover scope remain to be agreed.

## Qualification objectives

- Run the complete v2.9 mission/robust-planner integration gate, calibrate battery parameters against permissioned measurements and define scenario acceptance.
- Freeze the included edition and manifest, review first-party and component rights and complete recipient acceptance.
- Independent legal ownership/title opinion not performed by this internal audit.
- Freedom-to-operate legal opinion not performed unless separately evidenced.
- Independent penetration test not assumed unless separately evidenced.

## Prices and sources

| Reference | EUR | Indicative USD |
|---|---:|---:|
| Seller asking reference | 216,500 | 242,783 |
| Negotiation reference - low | 171,000 | 191,759 |
| Negotiation reference - high | 271,500 | 304,460 |
| Recreation cost estimate | 855,000 | 958,797 |
| Marketability cost scenario | 884,925 | 992,355 |
| Monetisation cost scenario | 981,113 | 1,100,220 |
| Risk-adjusted strategic reference | 892,833 | 1,001,223 |
| Weighted economic reference | 899,449 | 1,008,642 |

Recreation estimate: EUR 850,000 retained scope component plus EUR 5,000 for the explicitly scoped implementation work budget, giving EUR 855,000. The scoped budget assumes 48 equivalent hours at EUR 94/hour plus 15%, rounded down to EUR 500. The retained scope component has no complete per-role reconstruction budget and remains a low-confidence seller estimate. The asking reference and negotiation bounds preserve the seller-selected asking/cost relationships, rounded to EUR 500; they are transaction assumptions, not measured market value.

Coverage describes stated seller estimates only. The retained earlier anchor lacks a complete work breakdown; added scope does not validate it.

EUR 1 = USD 1.1214; ECB 2026-11-10. EUR is authoritative; market value is not established.

## Individual source review

v2.8 history reports 50/50 tests and 51/51 validator checks; v2.9 adds nine battery/thermal checks including a 36-state matrix, without automatically requalifying inherited source.

Remaining limits: Not flight-tested, certified, hardware-calibrated or operationally safe; new complete v2.9 checkout qualification must be distinguished from v2.8 historical PASS.

Price decision: No additional non-overlapping implemented scope was established for a new budget in this review. Existing low-confidence reference and project-specific qualification conditions retained.

Documentary review only; private product tests were not re-executed in this website update.

The seller offers only the expressly agreed first-party rights it owns or controls, to the extent transferable. Third-party materials retain their own terms. Independent title and freedom-to-operate opinions are not established.

[Full dossier](https://thearchitect-max.github.io/MyProjects/projects/aerospace-mission-simulator/) · [Project display](https://thearchitect-max.github.io/MyProjects/displays/products/aerospace-mission-simulator/)

- [WIPO](https://www.wipo.int/web-publications/intellectual-property-valuation-basics-for-technology-transfer-professionals/en/4-the-cost-method.html): Method selection and the cost-versus-value boundary; no asset amount or discount is supplied by WIPO.
- [Knab](https://bieb.knab.nl/ondernemen/wat-verdient-een-software-developer-zzp-bekijk-uurtarief-en-winst): EUR 94/hour contextualises the new scoped seller estimates. Effort, 15% coordination allowance and 30% asking increment are seller assumptions. Older specialist-rate budgets remain separate.
- [Upwork](https://www.upwork.com/hire/software-developers/): Broad contractor-rate context only. No asset valuation, Dutch quote or expert-tier premium is inferred.
