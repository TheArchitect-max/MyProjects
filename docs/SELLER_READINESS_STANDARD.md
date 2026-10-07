# Seller Evidence & Transfer Readiness Standard

Basis date: 2026-10-07

This standard converts the 95-project portfolio into a seller-side acquisition documentation system. It is deliberately narrower than buyer due diligence.

## Governing boundary

The seller documents what exists, what is included, what repository evidence supports, what third-party material is visible, what is known to remain open, and what can be transferred. A buyer remains responsible for buyer-specific legal, technical, security, regulatory, tax, financial and integration diligence.

Statuses are evidence states, not marketing claims. No internal scan is labelled an independent legal opinion, certified penetration test, independent valuation or freedom-to-operate opinion.

## Assurance axes

- Technical maturity: existing portfolio stage or repository-evidenced development status.
- Evidence maturity E0-E4: tests, validation, provenance and retained external evidence.
- IP/rights maturity R0-R4: repository licence, dependency/third-party disclosure, SBOM/lock evidence, provenance and external legal title evidence.
- Commercial maturity C0-C4: seller-side price/economic evidence through independent valuation evidence.
- Transfer readiness T0-T4: implementation baseline through explicit acquisition/handover package readiness.

## Repository-native audit inputs

Each audit uses the current default-branch snapshot and records its commit SHA. The scan inventories:
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
