#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const RELEASE = '20260904-20';
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const json = (p) => JSON.parse(read(p));
const exists = (p) => fs.existsSync(path.join(root, p));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const base = json('assets/projects.json');
const refresh = json('assets/portfolio-refresh.json');
const pricing = json('assets/pricing-review.json');
const live = json('assets/live-release.json');

assert(live.release === RELEASE, 'live release mismatch');
assert(live.fx.rate === 1.1622 && live.fx.date === '2026-09-04', 'ECB reference mismatch');
assert(live.repository_scope.private_repositories_observed === 68, 'observed repository count mismatch');
assert(live.repository_scope.canonical_qualified_assets === 66, 'qualified asset count mismatch');
assert(live.repository_scope.legacy_private_repositories_retained === 1, 'legacy count mismatch');
assert(live.repository_scope.reserved_unqualified_repositories === 1, 'reserved count mismatch');
assert(live.repository_scope.reserved[0].repository === 'TraceLine-Evidence-Governed-Investigation-Framework', 'reserved repository mismatch');

const merged = structuredClone(base);
for (const change of refresh.replacements || []) {
  const row = merged.a.find((item) => item[0] === change.id);
  assert(row, `missing Release 19 replacement ${change.id}`);
  row[2] = change.slug; row[3] = change.name; row[6] = change.summary;
}
const refs = new Set(merged.a.map((row) => row[1]));
for (const row of refresh.additions || []) if (!refs.has(row[1])) merged.a.push(row);
for (const change of live.replacements || []) {
  const row = merged.a.find((item) => item[0] === change.id);
  assert(row, `missing Release 20 replacement ${change.id}`);
  row[2] = change.slug; row[3] = change.name; row[6] = change.summary;
}

const oldPrice = new Map(pricing.records.map((row) => [row[0], row]));
const assets = merged.a.map((row) => {
  const p = oldPrice.get(row[0]);
  assert(p, `missing historical pricing ${row[0]}`);
  return { id: row[0], ref: row[1], slug: row[2], status: row[5], potential: row[9], ask: p[1], rd: row[8], low: p[2], high: p[3], quick: p[4] };
});
for (const item of live.additions) assets.push({ id: item.id, ref: item.ref, slug: item.slug, status: item.statusCode, potential: item.potentialCode, ask: item.ask, rd: item.rd, low: item.priceLow, high: item.priceHigh, quick: item.quick });

assert(assets.length === 66, 'asset row count mismatch');
assert(new Set(assets.map((x) => x.ref)).size === 66, 'asset refs are not unique');
assert(new Set(assets.map((x) => x.slug)).size === 66, 'asset slugs are not unique');
for (let i = 0; i < assets.length; i += 1) {
  assert(assets[i].id === i + 1, `non-sequential id ${i + 1}`);
  assert(assets[i].ref === `TA-IP-${String(i + 1).padStart(3, '0')}`, `bad ref ${i + 1}`);
  assert(assets[i].low <= assets[i].ask && assets[i].ask <= assets[i].high, `bad price band ${assets[i].ref}`);
  assert(assets[i].quick <= assets[i].ask && assets[i].ask <= assets[i].rd, `bad price relation ${assets[i].ref}`);
}
const sum = (key) => assets.reduce((n, x) => n + Number(x[key]), 0);
assert(sum('ask') === live.expected.strategic_asking_reference, 'strategic ask mismatch');
assert(sum('rd') === live.expected.recreation_cost_reference, 'recreation mismatch');
assert(sum('low') === live.expected.strategic_band[0] && sum('high') === live.expected.strategic_band[1], 'strategic band mismatch');
assert(sum('quick') === live.expected.quick_sale_reference, 'liquidity reference mismatch');
const counts = (key) => assets.reduce((m, x) => (m[x[key]] = (m[x[key]] || 0) + 1, m), {});
assert(JSON.stringify(counts('status')) === JSON.stringify(live.expected.status_counts), 'maturity count mismatch');
assert(JSON.stringify(counts('potential')) === JSON.stringify(live.expected.potential_counts), 'potential count mismatch');
assert(assets.find((x) => x.id === 5)?.slug === 'continuum-state-integrity-platform', 'Continuum identity mismatch');
assert(assets.find((x) => x.id === 65)?.status === 'V', 'TA-IP-065 maturity mismatch');
assert(assets.find((x) => x.id === 66)?.status === 'R', 'TA-IP-066 maturity mismatch');

for (const page of ['index.html', 'assurance.html', 'commercialization.html', 'transfer.html']) {
  const html = read(page);
  assert(html.includes(`data-release="${RELEASE}"`), `release marker missing ${page}`);
  assert(html.includes('name="description"'), `description missing ${page}`);
  assert(html.includes('rel="canonical"'), `canonical missing ${page}`);
}
assert(read('index.html').includes('66 qualified canonical private software/IP assets'), 'homepage asset count missing');
assert(read('index.html').includes('€11.595M') && read('index.html').includes('$13,475,709'), 'homepage dual-currency total missing');
assert(read('assurance.html').includes('No blanket portfolio certification'), 'assurance certification boundary missing');
assert(read('commercialization.html').includes('€9.25M–€14.515M'), 'valuation band missing');
assert(read('transfer.html').includes('68 does not mean 68 sale-ready assets'), 'repository reconciliation missing');
assert(read('README.md').includes('TraceLine-Evidence-Governed-Investigation-Framework'), 'README reserved scope missing');
assert(!exists('.github/workflows'), 'GitHub Actions workflows are prohibited');
assert(read('LICENSE').includes('PROPRIETARY WEBSITE LICENSE') && read('LICENSE').includes('All Rights Reserved'), 'proprietary website license missing');

for (const source of ['assets/portfolio-20260904.js']) new vm.Script(read(source), { filename: source });

console.log(JSON.stringify({
  project: 'THEARCHITECT_MAX MyProjects', release: RELEASE, successful: true,
  observedPrivateRepositories: 68, qualifiedAssets: 66,
  maturity: live.expected.status_counts,
  strategicAskingReference: live.expected.strategic_asking_reference,
  strategicBand: live.expected.strategic_band,
  liquidityReference: live.expected.quick_sale_reference,
  recreationCostReference: live.expected.recreation_cost_reference,
  fx: live.fx
}, null, 2));
