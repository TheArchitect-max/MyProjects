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
## Creator and historical-development provenance

The portfolio creator declares a **single-human-creator, multi-AI-assisted** development model. The owner directed objectives, requirements, iterative decisions, selection, integration and acceptance while using multiple AI systems as research, design and coding assistants.

The historical conversational chain was not retained and was deliberately deleted. Accordingly:

- `HISTORICAL_DEVELOPMENT_PATH = IRRECOVERABLE_FROM_RETAINED_EVIDENCE`;
- `IDENTICAL_PROCESS_REPRODUCTION = NOT_POSSIBLE_FROM_RETAINED_EVIDENCE`;
- `DUPLICATE_HISTORICAL_ARCHIVE = NONE_RETAINED`;
- `CURRENT_REPOSITORY_BASELINE = AUTHORITATIVE_SURVIVING_AUDITABLE_ARTIFACT`.

This is an **owner declaration**, not a claim inferred from Git history. Repository evidence independently establishes the surviving technical baseline. Deleted historical AI transcripts are not treated as a seller-side documentation deficiency and do not reduce transfer readiness merely because they no longer exist.

The declaration does **not** claim that functionally similar software cannot be independently created. It states only that the exact historical multi-AI development process cannot be reconstructed from retained evidence. Surviving non-public know-how is treated as confidential and, where the applicable legal criteria are met, as trade-secret information.

