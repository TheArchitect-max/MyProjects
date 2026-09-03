#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const RELEASE = '20260903-19';
const ORIGIN = 'https://thearchitect-max.github.io/MyProjects/';
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const json = (p) => JSON.parse(read(p));
const exists = (p) => fs.existsSync(path.join(root, p));
const fail = (m) => { throw new Error(m); };
const assert = (condition, message) => { if (!condition) fail(message); };
const sortedRecordJson = (records) => JSON.stringify(records.map((record) =>
  Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b)))
));

const base = json('assets/projects.json');
const refresh = json('assets/portfolio-refresh.json');
const pricing = json('assets/pricing-review.json');
const evidence = json('evidence/github-existence.json');
const assurance = json('assets/assurance-review.json');

assert(base.v === refresh.base_version, 'refresh/base version mismatch');
assert(refresh.v === RELEASE, 'refresh release mismatch');
assert(pricing.v === RELEASE, 'pricing release mismatch');
assert(pricing.basis_release === refresh.v, 'pricing basis release mismatch');
assert(assurance.release === RELEASE, 'assurance release mismatch');
assert(evidence.release === RELEASE, 'repository-evidence release mismatch');
assert(!('prior_asking_reference' in pricing.portfolio), 'legacy public asking reference must be absent');

const merged = structuredClone(base);
for (const change of refresh.replacements) {
  const row = merged.a.find((item) => item[0] === change.id);
  assert(row, `missing replacement id ${change.id}`);
  row[2] = change.slug; row[3] = change.name; row[6] = change.summary;
}
const refs = new Set(merged.a.map((row) => row[1]));
for (const row of refresh.additions) if (!refs.has(row[1])) merged.a.push(row);
const priceById = new Map(pricing.records.map((record) => [record[0], record]));
for (const row of merged.a) {
  const record = priceById.get(row[0]);
  assert(record, `missing pricing id ${row[0]}`);
  row[7] = Number(record[1]);
}
merged.n = refresh.canonical_assets;
merged.t = [pricing.portfolio.strategic_asking_reference, pricing.portfolio.recreation_cost_reference, refresh.totals[2]];
merged.sc = { ...refresh.status_counts };
merged.pc = { ...refresh.potential_counts };
merged.fx = { ...pricing.currency };

assert(merged.n === 64 && merged.a.length === 64, 'canonical asset count must be 64');
assert(pricing.records.length === 64, 'pricing record count mismatch');
assert(new Set(merged.a.map((row) => row[1])).size === 64, 'asset refs must be unique');
assert(new Set(merged.a.map((row) => row[2])).size === 64, 'asset slugs must be unique');
for (let i = 0; i < merged.a.length; i += 1) {
  assert(merged.a[i][0] === i + 1, `non-sequential id ${i + 1}`);
  assert(merged.a[i][1] === `TA-IP-${String(i + 1).padStart(3, '0')}`, `bad asset ref ${i + 1}`);
}

const ask = merged.a.reduce((sum, row) => sum + Number(row[7]), 0);
const recreation = merged.a.reduce((sum, row) => sum + Number(row[8]), 0);
const low = pricing.records.reduce((sum, row) => sum + Number(row[2]), 0);
const high = pricing.records.reduce((sum, row) => sum + Number(row[3]), 0);
const quick = pricing.records.reduce((sum, row) => sum + Number(row[4]), 0);
assert(ask === 11295000, 'strategic asking total mismatch');
assert(recreation === 43620000, 'recreation total mismatch');
assert(low === 9010000 && high === 14135000 && quick === 4450000, 'pricing aggregate mismatch');
assert(refresh.totals[0] === ask && refresh.totals[1] === recreation && refresh.totals[2] === 64500000, 'refresh totals mismatch');
assert(pricing.portfolio.strategic_asking_reference === ask, 'pricing strategic total mismatch');
assert(pricing.portfolio.recreation_cost_reference === recreation, 'pricing recreation total mismatch');
assert(pricing.portfolio.strategic_band[0] === low && pricing.portfolio.strategic_band[1] === high, 'pricing band mismatch');
assert(pricing.portfolio.quick_sale_reference === quick, 'pricing quick-sale mismatch');
for (const record of pricing.records) {
  assert(record[2] <= record[1] && record[1] <= record[3], `invalid strategic band ${record[0]}`);
  assert(record[4] <= record[1], `invalid liquidity reference ${record[0]}`);
}
assert(crypto.createHash('sha256').update(JSON.stringify(pricing.records)).digest('hex') === pricing.records_sha256, 'pricing SHA-256 mismatch');
assert(pricing.sources.length >= 9, 'multi-source valuation evidence missing');
assert(pricing.model.income_approach.includes('not applied'), 'income-approach boundary missing');
assert(pricing.currency.rate === 1.1615 && pricing.currency.date === '2026-09-03' && pricing.currency.indicative === true, 'ECB FX reference mismatch');

const sc = { V: 0, P: 0, R: 0 };
const pc = { VH: 0, H: 0, M: 0, S: 0 };
for (const row of merged.a) {
  sc[row[5]] += 1; pc[row[9]] += 1;
  assert(row[7] > 0 && row[8] >= row[7], `invalid price relation ${row[1]}`);
}
assert(JSON.stringify(sc) === JSON.stringify({ V: 36, P: 24, R: 4 }), 'maturity counts mismatch');
assert(JSON.stringify(pc) === JSON.stringify({ VH: 13, H: 30, M: 13, S: 8 }), 'potential counts mismatch');
assert(merged.a.find((row) => row[1] === 'TA-IP-060')?.[5] === 'R', 'temporal-physics evidence boundary must remain Research');
for (const id of [61, 63, 64]) assert(merged.a.find((row) => row[0] === id)?.[5] === 'V', `validated new asset mismatch ${id}`);

assert(evidence.asset_count === 64 && evidence.records.length === 64, 'repository-evidence count mismatch');
assert(evidence.canonical_private_repositories === 64, 'canonical private repository count mismatch');
assert(evidence.private_repositories_observed === 65, 'observed private repository count mismatch');
assert(evidence.legacy_private_repositories_retained === 1, 'legacy repository count mismatch');
assert(evidence.records.every((record) => record.repository_exists && record.repository_private && record.license_boundary_verified && record.first_party_license_posture === 'proprietary'), 'repository or first-party posture evidence incomplete');
assert(crypto.createHash('sha256').update(sortedRecordJson(evidence.records)).digest('hex') === evidence.portfolio_sha256, 'repository evidence SHA-256 mismatch');

assert(assurance.portfolio.canonical_assets === 64, 'assurance asset total mismatch');
assert(assurance.portfolio.software_validated === 36 && assurance.portfolio.verified_prototypes === 24 && assurance.portfolio.research === 4, 'assurance maturity totals mismatch');
assert(assurance.portfolio.repository_existence_verified === 64 && assurance.portfolio.proprietary_boundaries_reviewed === 64, 'assurance repository totals mismatch');
assert(assurance.portfolio.portfolio_wide_independent_certifications_claimed === 0, 'unsupported portfolio certification claim');
assert(assurance.records.length === 64, 'assurance record count mismatch');
assert(new Set(assurance.records.map((record) => record.slug)).size === 64, 'assurance slugs must be unique');
assert(assurance.records.every((record) => record.independently_certified === false && record.internal_evidence && record.standards_posture), 'assurance evidence boundary incomplete');
assert(crypto.createHash('sha256').update(sortedRecordJson(assurance.records)).digest('hex') === assurance.records_sha256, 'assurance SHA-256 mismatch');
for (const row of merged.a) {
  const record = assurance.records.find((item) => item.slug === row[2]);
  assert(record?.asset_ref === row[1] && record?.maturity === row[5], `assurance mapping mismatch ${row[1]}`);
}

const canonicalPages = ['index.html', 'assurance.html', 'commercialization.html', 'transfer.html'];
for (const row of merged.a) canonicalPages.push(`projects/${row[2]}/index.html`);
for (const relative of canonicalPages) {
  assert(exists(relative), `missing canonical page ${relative}`);
  const html = read(relative);
  assert(html.startsWith('<!doctype html>'), `doctype missing ${relative}`);
  assert(html.includes('<html lang="en"'), `language missing ${relative}`);
  assert(html.includes('name="viewport"'), `viewport missing ${relative}`);
  assert(html.includes('name="description"'), `description missing ${relative}`);
  assert(html.includes(`data-release="${RELEASE}"`), `release marker missing ${relative}`);
  assert(html.includes('rel="canonical"'), `canonical missing ${relative}`);
  const row = merged.a.find((item) => relative === `projects/${item[2]}/index.html`);
  if (row) {
    assert(html.includes(`data-asset="${row[2]}"`) && html.includes(row[1]), `asset identity missing ${row[2]}`);
    assert(html.includes(`https://thearchitect-max.github.io/MyProjects/projects/${row[2]}/`), `asset canonical mismatch ${row[2]}`);
  }
}

const expectedUrls = new Set([
  ORIGIN, `${ORIGIN}assurance.html`, `${ORIGIN}commercialization.html`, `${ORIGIN}transfer.html`,
  ...merged.a.map((row) => `${ORIGIN}projects/${row[2]}/`)
]);
const sitemapUrls = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert(sitemapUrls.length === expectedUrls.size && new Set(sitemapUrls).size === sitemapUrls.length && sitemapUrls.every((url) => expectedUrls.has(url)), 'sitemap mismatch');

const redirects = {
  'projects/axiomcrypt/index.html': 'modular-key-cryptanalysis-platform',
  'projects/shield-breaker-research/index.html': 'protein-structure-evidence-qualification-platform',
  'projects/titan-evtol-research-platform/index.html': 'electric-flight-systems-simulation-validation-platform',
  'projects/chimera-spectral-perception-system/index.html': 'vision-evidence-governed-multimodal-perception-framework'
};
for (const [relative, target] of Object.entries(redirects)) {
  const html = read(relative);
  assert(html.includes('noindex') && html.includes(target), `legacy redirect mismatch ${relative}`);
}

for (const relative of ['assets/site.js', 'assets/portfolio-overlay.js', 'assets/foundations.js', 'assets/github-evidence.js']) {
  const source = read(relative);
  assert(source.includes(RELEASE), `runtime release mismatch ${relative}`);
  new vm.Script(source, { filename: relative });
}
assert(read('assets/github-evidence.js').includes('assurance-review.json'), 'assurance runtime source missing');
assert(read('index.html').includes('64 canonical assets') && read('index.html').includes('€11.295.000') && read('index.html').includes('€43.620.000'), 'homepage release totals missing');
assert(read('assurance.html').includes('Reference is not') && read('assurance.html').includes('No blanket portfolio certification'), 'assurance terminology missing');
assert(read('commercialization.html').includes('€9.010.000') && read('commercialization.html').includes('€14.135.000'), 'commercial valuation band missing');
assert(read('transfer.html').includes('65 private repositories') && read('transfer.html').includes('64 map to current canonical assets'), 'transfer repository reconciliation missing');
assert(read('projects/temporal-physics-causality-research-platform/index.html').includes('without claiming a working time machine or experimental proof'), 'temporal research boundary missing');
assert(exists('evidence/valuation-review-2026-09-03.md') && read('evidence/valuation-review-2026-09-03.md').includes('TA-IP-064'), 'valuation report incomplete');
assert(!exists('.github/workflows'), 'GitHub Actions workflows are prohibited for this site');
assert(read('LICENSE').includes('PROPRIETARY WEBSITE LICENSE') && read('LICENSE').includes('All Rights Reserved'), 'proprietary website license missing');

console.log(JSON.stringify({
  project: 'THEARCHITECT_MAX MyProjects', release: RELEASE, successful: true,
  canonicalAssets: 64, observedPrivateRepositories: 65, canonicalPages: canonicalPages.length,
  strategicAskingReference: ask, negotiationBand: [low, high], liquidityReference: quick,
  recreationCostReference: recreation, maturity: sc, assuranceRecords: assurance.records.length,
  sitemapUrls: sitemapUrls.length
}, null, 2));
