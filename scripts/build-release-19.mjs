#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RELEASE = '20260903-19';
const REVIEWED_AT = '2026-09-03T20:30:00+02:00';
const FX = {
  base: 'EUR', quote: 'USD', rate: 1.1615, date: '2026-09-03',
  source: 'ECB euro reference rate', indicative: true
};

const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const writeJson = (relative, value) => fs.writeFileSync(path.join(ROOT, relative), `${JSON.stringify(value, null, 2)}\n`);
const round5 = (value) => Math.round(value / 5_000) * 5_000;
const eur = (value) => new Intl.NumberFormat('nl-NL', {
  style: 'currency', currency: 'EUR', maximumFractionDigits: 0
}).format(value);
const sortedRecordJson = (records) => JSON.stringify(records.map((record) =>
  Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b)))
));

const newAssets = [
  [58, 'TA-IP-058', 'multimodal-evidence-adaptive-systems-platform', 'Multimodal Evidence Adaptive Systems Platform', 4, 'P', 'A provenance-governed platform for synchronized multimodal sensing, uncertainty-aware fusion, adaptive experiments, evidence classification, knowledge modeling and classical-versus-quantum benchmark contracts.', 115000, 650000, 'H', 0, ''],
  [59, 'TA-IP-059', 'fusionlunar-energy-systems-engineering-platform', 'FusionLunar Energy Systems Engineering Platform', 15, 'P', 'An evidence-grounded systems-engineering platform for qualifying fusion architectures that depend on lunar resources, cislunar logistics, reactor losses, lifecycle economics and explicit uncertainty.', 100000, 850000, 'M', 1, ''],
  [60, 'TA-IP-060', 'temporal-physics-causality-research-platform', 'Temporal Physics & Causality Research Platform', 15, 'R', 'A falsification-first computational research platform for testing whether measured proper time can become a necessary coherent control resource for causal ordering, without claiming a working time machine or experimental proof.', 35000, 800000, 'S', 1, ''],
  [61, 'TA-IP-061', 'industrial-predictive-maintenance-rul-platform', 'Industrial Predictive Maintenance & RUL Platform', 19, 'V', 'A private industrial machine-health platform with leakage-controlled unit splits, causal-window LSTM-attention RUL estimation, signed evidence manifests, API packaging and a 25-test internal release record.', 360000, 1000000, 'VH', 2, ''],
  [62, 'TA-IP-062', 'adaptive-audio-production-system', 'Adaptive Audio Production System', 21, 'P', 'A local-first audio-production kernel for deterministic analysis, explicit DSP graphs, technical QA, reproducible rendering and SHA-256 provenance with optional planning and source-separation adapters.', 95000, 600000, 'H', 6, ''],
  [63, 'TA-IP-063', 'causal-state-field-engine', 'Causal State Field Engine', 25, 'V', 'A deterministic state-encoding engine that preserves hierarchical semantics, propagates caller-declared dependency influence and retains cell-level attribution with cryptographic commitments.', 115000, 450000, 'M', 3, ''],
  [64, 'TA-IP-064', 'evidence-governed-analytical-reasoning-platform', 'Evidence-Governed Analytical Reasoning Platform', 25, 'V', 'A deterministic evidence-analysis engine for provenance, hypothesis evaluation, contradiction preservation, confidence calibration and audit-ready reporting with explicit unresolved-evidence states.', 165000, 500000, 'H', 0, '']
];

const pricingRows = [
  [58, 115000, 90000, 145000, 45000],
  [59, 100000, 80000, 125000, 35000],
  [60, 35000, 30000, 45000, 10000],
  [61, 360000, 290000, 450000, 145000],
  [62, 95000, 75000, 120000, 35000],
  [63, 115000, 90000, 145000, 45000],
  [64, 165000, 130000, 205000, 65000]
];

const auditDetails = {
  'multimodal-evidence-adaptive-systems-platform': {
    internal_evidence: 'Current v0.1.0 tree contains a repository-local unittest, compilation and invariant gate. The build records completion of internal validation; scientific and human-sensing validity remain unestablished.',
    standards_posture: 'Repository-local evidence and reproducibility protocol. No formal standards conformity or external certification is claimed.'
  },
  'fusionlunar-energy-systems-engineering-platform': {
    internal_evidence: 'Current v0.4 tree contains deterministic pytest coverage and explicit reactor-loss qualification gates. A passing software gate is not experimental fusion, lunar-resource or net-power validation.',
    standards_posture: 'The NRL Plasma Formulary expression and provenance-qualified scientific sources are technical references, not energy-system certification.'
  },
  'temporal-physics-causality-research-platform': {
    internal_evidence: 'The v0.5 digital twin and unit-test gate support design calculations only. The repository explicitly records PTCG-1B as not experimentally validated.',
    standards_posture: 'BIPM frequency recommendations and NIST trapped-ion literature are metrology references; they do not certify the proposed device or causal-control hypothesis.'
  },
  'industrial-predictive-maintenance-rul-platform': {
    internal_evidence: 'The v0.2.0 release manifest records 25/25 tests passed plus compilation, CLI, bundle-integrity, synthetic-pipeline and external-fixture smoke gates.',
    standards_posture: 'NASA C-MAPSS is supported as an operator-supplied benchmark path. No ISO/IEC conformity, SIL certification or field-performance certification is claimed.'
  },
  'adaptive-audio-production-system': {
    internal_evidence: 'The v0.1.0 tree contains repository-local pytest and Ruff gates for deterministic analysis, DSP, pipeline and QA behavior. No independent production-master validation is recorded.',
    standards_posture: 'No broadcast or mastering-standard conformity is claimed; integrated loudness, production limiting and true-peak validation remain open gates.'
  },
  'causal-state-field-engine': {
    internal_evidence: 'The v0.1.0 validation record reports 8/8 tests passed for canonicalization, coordinate stability, propagation, attribution and rejection invariants.',
    standards_posture: 'SHA-256 and JSON-like canonicalization are implementation primitives. No formal standards conformity or external certification is claimed.'
  },
  'evidence-governed-analytical-reasoning-platform': {
    internal_evidence: 'The v0.1.0 verification record reports 10/10 tests passed, including deterministic evaluation and evidence-state invariants.',
    standards_posture: 'Evidence states and reproducibility rules are repository protocols. No forensic, legal, scientific or regulatory certification is claimed.'
  }
};

const base = readJson('assets/projects.json');
const refresh = readJson('assets/portfolio-refresh.json');
refresh.v = RELEASE;
refresh.reviewed_at = REVIEWED_AT;
refresh.canonical_assets = 64;
refresh.private_repositories_observed = 65;
refresh.legacy_private_repositories_retained = 1;
const existingRefs = new Set(refresh.additions.map((row) => row[1]));
for (const row of newAssets) if (!existingRefs.has(row[1])) refresh.additions.push(row);
refresh.totals = [11295000, 43620000, 64500000];
refresh.status_counts = { V: 36, P: 24, R: 4 };
refresh.potential_counts = { VH: 13, H: 30, M: 13, S: 8 };
refresh.notes = {
  ...refresh.notes,
  repository_scope: '65 private repositories observed: 64 canonical assets and one retained legacy perception-migration repository.',
  standards: 'Standards references, internal validation and independent certification are separate evidence states.',
  currency: 'EUR remains authoritative. USD is indicative at the ECB reference rate dated 2026-09-03.'
};
writeJson('assets/portfolio-refresh.json', refresh);

const pricing = readJson('assets/pricing-review.json');
pricing.v = RELEASE;
pricing.reviewed_at = REVIEWED_AT;
pricing.basis_release = RELEASE;
pricing.currency = FX;
const knownPricing = new Set(pricing.records.map((row) => row[0]));
for (const row of pricingRows) if (!knownPricing.has(row[0])) pricing.records.push(row);
pricing.records.sort((a, b) => a[0] - b[0]);
pricing.portfolio = {
  strategic_asking_reference: 11295000,
  strategic_band: [9010000, 14135000],
  quick_sale_reference: 4450000,
  recreation_cost_reference: 43620000,
  strategic_to_recreation_ratio: 11295000 / 43620000
};
pricing.records_sha256 = crypto.createHash('sha256').update(JSON.stringify(pricing.records)).digest('hex');
writeJson('assets/pricing-review.json', pricing);

const evidence = readJson('evidence/github-existence.json');
evidence.schema = 'ta-github-existence-v6';
evidence.release = RELEASE;
evidence.verified_at = REVIEWED_AT;
evidence.verification = 'authorized connected-account repository inventory, canonical-asset reconciliation, current-tree inspection and first-party license-boundary review';
evidence.asset_count = 64;
evidence.canonical_private_repositories = 64;
evidence.private_repositories_observed = 65;
evidence.legacy_private_repositories_retained = 1;
evidence.scope = 'Each canonical listed software/IP asset is backed by a private GitHub repository accessible through the authorized connected account. One additional private legacy perception repository is retained for migration continuity and is not counted separately. Current product trees were reviewed for proprietary/all-rights-reserved first-party boundaries. Internal tests, scientific validation, field validation, standards alignment and independent certification remain distinct evidence states. This is repository evidence, not independent legal chain-of-title certification.';
const knownEvidence = new Set(evidence.records.map((record) => record.asset_ref));
for (const row of newAssets) if (!knownEvidence.has(row[1])) evidence.records.push({
  asset_ref: row[1], slug: row[2], evidence_ref: `TA-GH-${String(row[0]).padStart(3, '0')}`,
  repository_exists: true, repository_private: true,
  first_party_license_posture: 'proprietary', license_boundary_verified: true
});
evidence.records.sort((a, b) => a.asset_ref.localeCompare(b.asset_ref));
evidence.portfolio_sha256 = crypto.createHash('sha256').update(sortedRecordJson(evidence.records)).digest('hex');
writeJson('evidence/github-existence.json', evidence);

const merged = structuredClone(base);
for (const change of refresh.replacements) {
  const row = merged.a.find((item) => item[0] === change.id);
  row[2] = change.slug; row[3] = change.name; row[6] = change.summary;
}
const mergedRefs = new Set(merged.a.map((row) => row[1]));
for (const row of refresh.additions) if (!mergedRefs.has(row[1])) merged.a.push(row);
const priceById = new Map(pricing.records.map((row) => [row[0], row]));
for (const row of merged.a) row[7] = priceById.get(row[0])[1];

const statusMeaning = {
  V: 'Repository-maintained executable checks passed for the stated software scope; this is internal software validation, not field proof or independent certification.',
  P: 'Implemented prototype with repository evidence and bounded internal checks; full software, operational or domain validation remains open.',
  R: 'Repository-backed research implementation whose core scientific, experimental or product claim remains unresolved.'
};
const defaultEvidence = {
  V: 'Prior portfolio review supports repository-maintained internal software validation for the bounded implementation scope.',
  P: 'Prior portfolio review supports implemented prototype status; broader validation and product hardening remain open.',
  R: 'Prior portfolio review supports a real repository-backed research asset; hypothesis or validation gates remain open.'
};
const assuranceRecords = merged.a.map((row) => ({
  asset_ref: row[1], slug: row[2], maturity: row[5],
  internal_evidence: auditDetails[row[2]]?.internal_evidence || defaultEvidence[row[5]],
  standards_posture: auditDetails[row[2]]?.standards_posture || (row[2] === 'sentinelbio-verify'
    ? 'NIST SP 800-63B-4 is a documented assurance reference; reference or control mapping does not equal NIST certification.'
    : 'No portfolio claim of independent standards certification is made for this asset.'),
  independently_certified: false
}));
const assurance = {
  schema: 'ta-assurance-review-v1', release: RELEASE, reviewed_at: REVIEWED_AT,
  scope: 'Public evidence-bound terminology for repository existence, internal software validation, prototype maturity, research maturity, standards references and certification boundaries.',
  terminology: {
    V: { label: 'Software-Validated', meaning: statusMeaning.V },
    P: { label: 'Verified Prototype', meaning: statusMeaning.P },
    R: { label: 'Research', meaning: statusMeaning.R },
    standards_referenced: 'A named standard, authoritative method or benchmark informs the work; conformity is not implied.',
    standards_aligned: 'Requires an explicit requirements/control mapping plus implementation and test evidence for the stated scope.',
    independently_certified: 'Requires a current certificate or assessment from an identified competent external body with a defined scope.'
  },
  portfolio: {
    canonical_assets: 64, software_validated: 36, verified_prototypes: 24, research: 4,
    repository_existence_verified: 64, proprietary_boundaries_reviewed: 64,
    portfolio_wide_independent_certifications_claimed: 0
  },
  records: assuranceRecords
};
assurance.records_sha256 = crypto.createHash('sha256').update(sortedRecordJson(assurance.records)).digest('hex');
writeJson('assets/assurance-review.json', assurance);

const pageTemplate = (row) => `<!doctype html><html lang="en" data-release="${RELEASE}" data-asset="${row[2]}" data-data-path="../../assets/projects.json"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${row[3]} — THEARCHITECT_MAX</title><meta name="description" content="${row[6]}"><meta property="og:title" content="${row[3]} — THEARCHITECT_MAX"><meta property="og:description" content="${row[6]}"><link rel="canonical" href="https://thearchitect-max.github.io/MyProjects/projects/${row[2]}/"><link rel="stylesheet" href="../../assets/site.css?v=${RELEASE}"></head><body><main id="project" data-load><section class="shell section"><p class="eyebrow">${row[1]}</p><h1>${row[3]}</h1><p>${row[6]}</p></section></main><script src="../../assets/portfolio-overlay.js?v=${RELEASE}" defer></script><script src="../../assets/site.js?v=${RELEASE}" defer></script><script src="../../assets/foundations.js?v=${RELEASE}" defer></script><script src="../../assets/github-evidence.js?v=${RELEASE}" defer></script></body></html>\n`;
for (const row of newAssets) {
  const directory = path.join(ROOT, 'projects', row[2]);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'index.html'), pageTemplate(row));
}

for (const entry of fs.readdirSync(path.join(ROOT, 'projects'), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const file = path.join(ROOT, 'projects', entry.name, 'index.html');
  if (!fs.existsSync(file)) continue;
  const source = fs.readFileSync(file, 'utf8').replace(/20260903-(?:16|17|18)/g, RELEASE);
  fs.writeFileSync(file, source);
}

const urls = [
  'https://thearchitect-max.github.io/MyProjects/',
  'https://thearchitect-max.github.io/MyProjects/assurance.html',
  'https://thearchitect-max.github.io/MyProjects/commercialization.html',
  'https://thearchitect-max.github.io/MyProjects/transfer.html',
  ...merged.a.map((row) => `https://thearchitect-max.github.io/MyProjects/projects/${row[2]}/`)
];
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`);

const pricingById = new Map(pricing.records.map((row) => [row[0], row]));
const table = merged.a.map((row) => {
  const p = pricingById.get(row[0]);
  return `| ${row[1]} | ${row[3]} | ${row[5]} | **${eur(p[1])}** | ${eur(p[2])}–${eur(p[3])} | ${eur(p[4])} | ${eur(row[8])} |`;
}).join('\n');
const valuationReport = `# Portfolio valuation and assurance review — 03 Sep 2026\n\n**Release:** \`${RELEASE}\`\n\n**Scope:** 64 canonical private software/IP assets; 65 private repositories observed, including one retained legacy migration repository.\n\n**Currency:** EUR authoritative; USD indicative at ECB 1 EUR = 1.1615 USD on 03 Sep 2026.\n\n## Portfolio result\n\n- Strategic asking reference: **${eur(pricing.portfolio.strategic_asking_reference)}**.\n- Defensible negotiation band: **${eur(pricing.portfolio.strategic_band[0])}–${eur(pricing.portfolio.strategic_band[1])}**.\n- Liquidity / quick-sale reference: **${eur(pricing.portfolio.quick_sale_reference)}**.\n- Recreation-cost reference: **${eur(pricing.portfolio.recreation_cost_reference)}**.\n- Maturity: **36 Software-Validated / 24 Verified Prototype / 4 Research**.\n- Independent portfolio certification: **not claimed**.\n\nStrategic prices are seller-side analytical references, not certified fair-market values or operating-company valuations. Portfolio-level ARR, profit, customers and retention are not verified, so income multiples are not applied. Standards references, internal validation, field validation and independent certification are separate evidence states.\n\n## Asset register\n\n| Ref | Asset | Maturity | Strategic ask | Negotiation band | Liquidity | Recreation |\n|---|---|---:|---:|---:|---:|---:|\n${table}\n\n## Evidence controls\n\nThe pricing records and assurance records are SHA-256 bound in \`assets/pricing-review.json\` and \`assets/assurance-review.json\`. Repository existence and first-party license-boundary records are SHA-256 bound in \`evidence/github-existence.json\`. These controls support integrity and traceability; they do not replace legal, scientific, regulatory, field or transaction-specific diligence.\n`;
fs.writeFileSync(path.join(ROOT, 'evidence', 'valuation-review-2026-09-03.md'), valuationReport);

console.log(JSON.stringify({
  release: RELEASE, assets: merged.a.length, observedPrivateRepositories: 65,
  strategicAsking: pricing.portfolio.strategic_asking_reference,
  recreation: pricing.portfolio.recreation_cost_reference,
  assuranceRecords: assurance.records.length
}, null, 2));
