# Seller Evidence & Transfer Readiness Standard

Current review basis: 2026-10-09
Previous evaluation basis: 2026-10-07

Use this standard to compare the evidence, rights and delivery conditions for all 97 independent assets before planning your acquisition review.

## Governing boundary

Review what exists, what is included, the supporting evidence, third-party obligations and outstanding delivery conditions. Assess the legal, technical, security, regulatory, tax, financial and integration requirements of your intended transaction.

Statuses are evidence states, not marketing claims. No internal scan is labelled an independent legal opinion, certified penetration test, independent valuation or freedom-to-operate opinion.

## Assurance axes

- Technical maturity: existing portfolio stage or repository-evidenced development status.
- Evidence maturity E0-E4: tests, validation, provenance and retained external evidence.
- IP/rights maturity R0-R4: repository licence, dependency/third-party disclosure, SBOM/lock evidence, provenance and external legal title evidence.
- Commercial maturity C0-C4: seller-side price/economic evidence through independent valuation evidence.
- Transfer readiness T0-T4: implementation baseline through explicit acquisition/handover package readiness.

## Repository-native audit inputs

Each reassessment records the current default-branch snapshot, compares it with the previous evaluated baseline, and records its commit SHA. Where implementation or research extensions exist only on a committed development branch, the separate branch scope is explicit; its presence does not imply a merge or full release acceptance. The scan inventories:
- source and executable implementation files;
- tests and test harnesses;
- dependency manifests and lockfiles;
- LICENSE/COPYING/NOTICE/THIRD_PARTY/attribution material;
- SBOM/SPDX/CycloneDX material;
- security/threat-model material;
- validation, qualification, benchmark and audit evidence;
- provenance, checksum, attestation and release manifests;
- build, packaging and release tooling;
- handover/transfer/acquisition artifacts;
- filenames requiring secret/credential review.

Evidence entries bind path metadata to Git object SHA where available.

## Transaction readiness

READY means the seller-side repository evidence reaches T4. READY_WITH_CONDITIONS means T2-T3 with explicit seller open items. NOT_READY means T0-T1.

READY does not mean a buyer must accept the asset. Buyer acceptance remains transaction-specific.

## External source basis

WIPO:
- https://www.wipo.int/en/web/business/ip-audit
- https://www.wipo.int/en/web/ip-commercialization/w/blog/how-to-prepare-for-ip-due-diligence-the-ultimate-guide-for-ventures
- https://www.wipo.int/en/web/business/ip-valuation

## Rights-first transaction principle

The public seller-side system documents **what is offered and what rights can be transferred**, not the internal method of creation. Development methods, prompts, research process and other non-public know-how are outside the public diligence perimeter unless a definitive transaction specifically includes them.

The rights review therefore focuses on seller-owned first-party rights, known/disclosed co-owners or claimants, third-party IP and licence obligations, encumbrances/restrictions, transferability and the exact delivery perimeter. The authoritative rights-transfer record is `assets/rights-transfer-register.json`.

## Current comparison and calculation rules

All 97 IP assets have a current review result: UPDATED, NEW_SOFTWARE_ASSET_EVALUATION or RECONFIRMED. An unchanged conclusion means the current source/evidence snapshot was compared with the previous assessment; it is not a skipped review. The current source-pinned validation state remains distinct from the presence of test files or historical reports.

The public scope consists only of the 97 independent first-party IP assets. Project websites are digital displays only. New monetary estimates cost first-party work only. No new independent legal, security, market, vehicle or scientific acceptance is inferred from an internal reassessment.

All current profiles and registers use identifiers TA-IP-001 through TA-IP-097. All 97 assets have separate prices. The Digital Twin Core estimate covers existing definition/acquisition documentation only and does not change its lack of implemented software or NOT_READY software-transfer status.
