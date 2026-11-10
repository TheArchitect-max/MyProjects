# Generative Media Production Platform

TA-IP-068 | Reference name: Nova

Assessment date: 2026-11-10

## Product overview

A local media-production control plane with tenant-scoped accounts, hashed API keys, queued generation jobs and separately operated inference workers. Internal credits reserve and settle usage; administrative controls support suspension, recovery and review.

Identified edition: 0.5.1

A local media-production control plane with tenant-scoped accounts, hashed API keys, queued generation jobs and separately operated inference workers. Internal credits reserve and settle usage; administrative controls support suspension, recovery and review.

## Potential acquirers

- Media software vendors
- Creator-platform teams
- Production tool developers

## Documented functions

- Scope accounts, API keys and jobs to their tenant owner
- Reserve credits and concurrency atomically when accepting jobs
- Settle completed usage and refund failed or cancelled work
- Operate isolated inference workers through a defined protocol
- Review generated media contracts and administrative recovery

## Output types

- Generation job and usage records
- Validated media artifacts
- Administrative and credit-ledger records

## Material scope boundaries

- Model weights and inference runtime are separately installed third-party components under their own terms.
- Internal credits are entitlement units, not currency or a payment service.
- Offline control-plane checks do not establish GPU performance, production security or customer deployment.

## Acquisition evidence profile

- Technical scope: P — A local media-production control plane with tenant-scoped accounts, hashed API keys, queued generation jobs and separately operated inference workers. Internal credits reserve and settle usage; administrative controls support suspension, recovery and review. The offered edition and material boundaries govern review.
- Evidence and validation: E3 — Tests, validation and provenance/release evidence identified. Detailed source-specific records are reviewed under agreed confidentiality; independent intended-use acceptance remains separate.
- Rights and component obligations: R2 — R1 plus dependency/third-party disclosure basis identified. Review the agreed first-party rights, third-party obligations and delivery perimeter.
- Commercial basis: C2 — Seller ask and reproducible economic reference established. Market value is not established.
- Delivery and handover: T3 — T2 plus validation, build/release and dependency-disclosure evidence. The listed conditions and written delivery agreement govern acceptance.

Offered first-party scope: Specifically agreed first-party 0.5.1 control-plane, commercial-control and worker-protocol implementation with documentation. Third-party models, weights, runtimes, services and GPU infrastructure retain separate terms.

Development: Real LTX-2.5 GPU qualification remains a separate open gate

## Conditions before handover

- Dependency manifest exists without an identified lockfile; reproducibility should be reviewed.
- A detailed component inventory and licensing report are required for the agreed delivery scope.
- An explicit delivery manifest and handover scope remain to be agreed.

## Qualification objectives

- Agree a source-specific delivery edition and evaluate the documented functions against your intended use.
- Close the listed technical, rights and handover conditions before recipient acceptance.
- Independent legal ownership/title opinion not performed by this internal audit.
- Freedom-to-operate legal opinion not performed unless separately evidenced.
- Independent penetration test not assumed unless separately evidenced.

## Prices and sources

| Reference | EUR | Indicative USD |
|---|---:|---:|
| Seller asking reference | 162,000 | 181,667 |
| Negotiation reference - low | 126,500 | 141,857 |
| Negotiation reference - high | 202,000 | 226,523 |
| Recreation cost estimate | 910,000 | 1,020,474 |
| Marketability cost scenario | 1,160,250 | 1,301,104 |
| Monetisation cost scenario | 1,433,250 | 1,607,247 |
| Risk-adjusted strategic reference | 1,553,285 | 1,741,854 |
| Weighted economic reference | 1,289,850 | 1,446,438 |

The recreation estimate contains EUR 900,000 of previously scoped work plus EUR 10,000 for 0.5.1 commercial control implementation, giving EUR 910,000. This increment assumes 96 equivalent hours at EUR 94/hour plus 15%, rounded down to EUR 500. Asking/negotiation inputs preserve prior asking/cost relationships, rounded half-up to EUR 500. All effort and prices remain seller assumptions; market value and actual expenditure are not established. Existing v0.4 media orchestration and isolated-worker foundations are reused and excluded from this increment. Naming changes carry no premium. Model weights, external inference rights, real payments, GPU performance and production acceptance are excluded.

Coverage describes stated seller estimates only. The retained earlier anchor lacks a complete work breakdown; added scope does not validate it.

EUR 1 = USD 1.1214; ECB 2026-11-10. EUR is authoritative; market value is not established.

## Individual source review

Repository documents model-agnostic project/worker protocol, job isolation, API-key/account/credit ledger and preview/MP4 verification contracts.

Remaining limits: Real LTX-2.5 GPU hardware inference, third-party model license admission, secure production tenancy, billing integration and public deployment are not verified.

Price decision: No additional non-overlapping implemented scope was established for a new budget in this review. Existing low-confidence reference and project-specific qualification conditions retained.

Documentary review only; private product tests were not re-executed in this website update.

The seller offers only the expressly agreed first-party rights it owns or controls, to the extent transferable. Third-party materials retain their own terms. Independent title and freedom-to-operate opinions are not established.

[Full dossier](https://thearchitect-max.github.io/MyProjects/projects/generative-media-production-platform/) · [Project display](https://thearchitect-max.github.io/MyProjects/displays/products/generative-media-production-platform/)

- [WIPO](https://www.wipo.int/web-publications/intellectual-property-valuation-basics-for-technology-transfer-professionals/en/4-the-cost-method.html): Method selection and the cost-versus-value boundary; no asset amount or discount is supplied by WIPO.
- [Knab](https://bieb.knab.nl/ondernemen/wat-verdient-een-software-developer-zzp-bekijk-uurtarief-en-winst): EUR 94/hour contextualises the new scoped seller estimates. Effort, 15% coordination allowance and 30% asking increment are seller assumptions. Older specialist-rate budgets remain separate.
- [Upwork](https://www.upwork.com/hire/software-developers/): Broad contractor-rate context only. No asset valuation, Dutch quote or expert-tier premium is inferred.
