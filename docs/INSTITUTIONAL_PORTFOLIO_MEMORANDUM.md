# Institutional Portfolio Memorandum

**THEARCHITECT_MAX — Private Technology & IP Portfolio**  
**Basis date:** 7 October 2026

## 1. Portfolio thesis

THEARCHITECT_MAX maintains a portfolio of 95 substantive repository-backed technology projects. Ninety-two are separately priced standalone economic assets. Three additional project repositories remain in the development register without a separate standalone price because their economic work product is already represented by an existing asset or because no committed implementation baseline exists.

The public catalogue is a screening and evidence layer. Source code, detailed architecture, controlled validation material, sensitive security information and transaction-confidential documents remain outside the public showroom unless already intentionally public in the underlying repository.

## 2. Seller-side acquisition system

Each of the 95 substantive project repositories now contains a standardized `ACQUISITION_DOSSIER.md` tied to a frozen repository baseline commit. Each dossier covers:

- technical baseline and build/release evidence;
- tests and validation/qualification evidence;
- repository licence and third-party/dependency evidence;
- SBOM/licensing status;
- security/threat evidence and sensitive-filename review;
- evidence register with Git blob SHAs;
- commercial reference;
- buyer handover specification;
- explicit seller open items;
- buyer/external diligence boundary;
- transaction readiness.

## 3. Asset assurance matrix

Each project is independently classified across five axes:

- **Technical maturity** — existing portfolio maturity state.
- **Evidence maturity E0–E4** — tests through retained external/independent evidence.
- **IP/rights maturity R0–R4** — repository licence through external legal title evidence.
- **Commercial maturity C0–C4** — seller-side economic framing through independent valuation.
- **Transfer readiness T0–T4** — no baseline through full seller-side handover evidence.

Current transfer-readiness distribution:

- T4: 2
- T3: 79
- T2: 4
- T1: 7
- T0: 3

Transaction-readiness outcome:

- READY: 2
- READY_WITH_CONDITIONS: 83
- NOT_READY: 10

These are seller-side documentation/transfer statuses, not buyer approval.

## 4. Ownership and rights

The portfolio now has a machine-readable repository-evidence ownership register. It records repository licence evidence, third-party disclosure evidence, IP/rights maturity, and whether a legal chain-of-title or FTO opinion exists.

No independent legal chain-of-title opinion is fabricated. Where none exists the register states `NOT_PERFORMED`.

## 5. Software supply chain

The portfolio has a machine-readable supply-chain summary covering dependency manifests, lockfiles, existing SBOM artifacts, licence files, third-party notices, security evidence and sensitive-filename indicators.

A manifest-level inventory is not described as a complete SBOM. Projects without component-level SBOM artifacts remain explicitly marked as such.

## 6. Economic architecture

Current portfolio economics remain separated into:

1. seller ask / negotiation range;
2. current analytical economic reference;
3. milestone-conditioned economic reference.

The milestone register contains 36 numeric maturity sensitivities and 59 NOT_ESTABLISHED records. These are not future seller asks or guaranteed market values.

Aggregate current seller ask: EUR 24.040M.  
Engineering-equivalent recreation cost: EUR 101.950M.  
Triangulated analytical reference: EUR 121.370M.

## 7. Double-counting control

Companion publication repositories, substantially overlapping economic lineages and project repositories whose economic work product is already represented elsewhere are not automatically counted as additional standalone economic assets.

## 8. Controlled transaction process

The recommended sequence is:

1. public asset screening;
2. counterparty qualification;
3. transaction scope and rights perimeter;
4. controlled VDR access;
5. buyer-specific legal/technical/security/commercial diligence;
6. definitive agreement;
7. frozen delivery baseline and acceptance;
8. closing/handover.

The controlled VDR structure is defined in `docs/CONTROLLED_VDR_INDEX.md`.

## 9. Key current seller-side gaps

- 81 projects — Dependency manifest exists without an identified lockfile; reproducibility should be reviewed.
- 77 projects — Generate a detailed SBOM from the evidenced dependency manifests/lockfiles.
- 68 projects — Add an explicit buyer handover / transfer manifest.
- 53 projects — Add a seller-side security/threat summary or explicitly document that no security assessment has been performed.
- 43 projects — Add release/provenance fingerprint or attestation evidence.
- 7 projects — Repository-native tests not identified.
- 7 projects — Validation/qualification evidence not identified.
- 5 projects — Repository licence file not identified.
- 5 projects — Add or consolidate third-party licensing/obligations documentation.
- 3 projects — No committed implementation baseline identified.
- 1 projects — Review potential sensitive filenames before transfer: src/security/credentialBroker.js
- 1 projects — Review potential sensitive filenames before transfer: apps/web/app/api/credentials/[id]/route.ts, apps/web/app/api/credentials/rotation/route.ts, apps/web/app/api/credentials/route.ts, apps/worker/src/provider-credentials.ts, docs/CREDENTIAL-KEY-ROTATION.md

These gaps are explicit work items, not hidden exceptions.

## 10. External evidence boundary

Independent legal ownership opinions, freedom-to-operate opinions, independent penetration tests, independent professional valuations, regulatory approvals and physical validation are not claimed unless separately evidenced.

The buyer remains responsible for buyer-specific diligence and suitability decisions.

## 11. External methodological basis

WIPO materials used as external process references:

- https://www.wipo.int/en/web/business/ip-audit
- https://www.wipo.int/en/web/ip-commercialization/w/blog/how-to-prepare-for-ip-due-diligence-the-ultimate-guide-for-ventures
- https://www.wipo.int/en/web/business/ip-valuation

These sources inform portfolio process architecture; they do not certify this portfolio.

## 12. Rights and transfer perimeter

The acquisition system is rights-first. A buyer is asked to evaluate what first-party rights and deliverables are offered, what evidence supports the seller-side rights position, what third-party IP remains under separate terms, and which rights are included or excluded from a definitive transaction.

The internal method by which an asset was created is not part of the public acquisition record and is not required to establish the offered transfer perimeter. Non-public development methods and know-how remain outside the public showroom unless expressly included in a transaction.

The seller declares no known or disclosed external human co-owner of the seller-owned first-party rights. Third-party components are not represented as seller-owned and remain governed by their own licences/contracts. Independent legal title/FTO opinions remain `NOT_PERFORMED` unless separately commissioned.

Authoritative machine-readable source: `assets/rights-transfer-register.json`.
