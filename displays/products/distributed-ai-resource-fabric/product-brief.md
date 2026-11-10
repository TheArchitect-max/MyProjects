# Distributed AI Resource Fabric

TA-IP-022 | Reference name: Freya

Assessment date: 2026-11-10

## Product overview

An AI-resource coordination asset for reviewing capacity, workload placement and recoverability.

Identified edition: 0.19.0

An AI-resource coordination asset for reviewing capacity, workload placement and recoverability.

## Potential acquirers

- AI infrastructure vendors
- Compute operators
- Enterprise AI platform teams

## Documented functions

- Discover usable computing capacity
- Review workload placement
- Reserve compatible resources
- Observe execution and recovery
- Retain measured qualification evidence

## Output types

- Capacity records
- Workload decisions
- Execution and recovery evidence

## Material scope boundaries

- Target-environment suitability, deployment acceptance and any required independent qualification are agreed separately.

## Acquisition evidence profile

- Technical scope: V — An AI-resource coordination asset for reviewing capacity, workload placement and recoverability. The offered edition and material boundaries govern review.
- Evidence and validation: E4 — E3 plus repository-retained independent/external validation evidence identified. Detailed source-specific records are reviewed under agreed confidentiality; independent intended-use acceptance remains separate.
- Rights and component obligations: R2 — R1 plus dependency/third-party disclosure basis identified. Review the agreed first-party rights, third-party obligations and delivery perimeter.
- Commercial basis: C2 — Seller ask and reproducible economic reference established. Market value is not established.
- Delivery and handover: T3 — T2 plus validation, build/release and dependency-disclosure evidence. The listed conditions and written delivery agreement govern acceptance.

Offered first-party scope: Seller-owned first-party rights plus specifically agreed transferable software/delivery artifacts; website displays and third-party ownership rights excluded from standalone software asset value.

Development: Open, unmerged development: validation: Kaggle T4x2 GPU sharding, Colab pairing and live cgroup2 host campaign; docs: mandatory distributed GPU model execution gates (v0.24 375/375 baseline confirmed); v0.24: 375/375 exact-source + Tesla T4 PASS; live kernel pending; v0.23: 367/367 exact-source + Tesla T4 PASS; live cgroup kernel pending; v0.22: 351/351 exact-source + Tesla T4 PASS; live kernel containment pending; v0.21: exact-source 335/335 + Tesla T4 PASS; live cgroup kernel gate pending; v0.20: trusted cgroup pre-exec launch — exact-source software/T4 PASS; live kernel gate pending. Not a released product or an automatic expansion of priced scope.

## Conditions before handover

- Dependency manifest exists without an identified lockfile; reproducibility should be reviewed.
- A detailed component inventory and licensing report are required for the agreed delivery scope.
- Third-party licensing and obligations documentation remains incomplete.
- A security assessment or an explicit statement of its absence is required before acceptance.
- An explicit delivery manifest and handover scope remain to be agreed.
- Agree and freeze the exact unmerged v0.24 delivery scope; main remains v0.19 and no release promotion is implied.
- Physical multi-GPU model execution, two-host model execution/recovery, live kernel containment and production acceptance remain unqualified.

## Qualification objectives

- Real model execution across two physical GPUs, then two independent hosts, plus live operating-system containment on an authorised host.
- Independent legal ownership/title opinion not performed by this internal audit.
- Freedom-to-operate legal opinion not performed unless separately evidenced.
- Independent penetration test not assumed unless separately evidenced.

## Prices and sources

| Reference | EUR | Indicative USD |
|---|---:|---:|
| Seller asking reference | 500,000 | 560,700 |
| Negotiation reference - low | 390,000 | 437,346 |
| Negotiation reference - high | 630,000 | 706,482 |
| Recreation cost estimate | 1,400,000 | 1,569,960 |
| Marketability cost scenario | 2,310,000 | 2,590,434 |
| Monetisation cost scenario | 3,080,000 | 3,453,912 |
| Risk-adjusted strategic reference | 3,721,323 | 4,173,092 |
| Weighted economic reference | 2,730,463 | 3,061,941 |

Some dated work-package assumptions are disclosed, but they do not reconstruct the complete retained recreation anchor. A complete scope-specific budget is required.

Coverage describes stated seller estimates only. The retained earlier anchor lacks a complete work breakdown; added scope does not validate it.

EUR 1 = USD 1.1214; ECB 2026-11-10. EUR is authoritative; market value is not established.

## Individual source review

v0.19 source report: exact-source Colab Tesla T4 GPU admission and 298/298 repository tests; report flags no vLLM/llama.cpp model inference, multi-host failover, RDMA or pooled VRAM.

Remaining limits: Single T4 admission is not two-host distributed inference/VRAM pooling; pending multi-host tests and real worker failover remain unqualified.

Price decision: No additional non-overlapping implemented scope was established for a new budget in this review. Existing low-confidence reference and project-specific qualification conditions retained.

Documentary review only; private product tests were not re-executed in this website update.

The seller offers only the expressly agreed first-party rights it owns or controls, to the extent transferable. Third-party materials retain their own terms. Independent title and freedom-to-operate opinions are not established.

[Full dossier](https://thearchitect-max.github.io/MyProjects/projects/distributed-ai-resource-fabric/) · [Project display](https://thearchitect-max.github.io/MyProjects/displays/products/distributed-ai-resource-fabric/)

- [WIPO](https://www.wipo.int/web-publications/intellectual-property-valuation-basics-for-technology-transfer-professionals/en/4-the-cost-method.html): Method selection and the cost-versus-value boundary; no asset amount or discount is supplied by WIPO.
- [Knab](https://bieb.knab.nl/ondernemen/wat-verdient-een-software-developer-zzp-bekijk-uurtarief-en-winst): EUR 94/hour contextualises the new scoped seller estimates. Effort, 15% coordination allowance and 30% asking increment are seller assumptions. Older specialist-rate budgets remain separate.
- [Upwork](https://www.upwork.com/hire/software-developers/): Broad contractor-rate context only. No asset valuation, Dutch quote or expert-tier premium is inferred.
