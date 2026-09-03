#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RELEASE = '20260903-14';
const ORIGIN = 'https://thearchitect-max.github.io/MyProjects/';
const ARR = { VH: 2_000_000, H: 1_000_000, M: 500_000, S: 250_000 };
const checks = [];
const failures = [];

function check(name, condition, detail = '') {
  const ok = Boolean(condition);
  checks.push({ name, ok, detail });
  if (!ok) failures.push(`${name}${detail ? `: ${detail}` : ''}`);
}

async function text(relative) {
  return readFile(path.join(ROOT, relative), 'utf8');
}

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

function sortedRecordJson(records) {
  return JSON.stringify(records.map((record) =>
    Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b)))
  ));
}

function countBy(values) {
  return values.reduce((counts, value) => {
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function localTargets(html, relativePage) {
  const targets = [];
  const pattern = /\b(?:href|src)="([^"]+)"/g;
  for (const match of html.matchAll(pattern)) {
    const raw = match[1];
    if (!raw || raw.startsWith('#') || /^(?:https?:|mailto:|tel:|data:)/.test(raw)) continue;
    const clean = raw.split(/[?#]/, 1)[0];
    if (!clean) continue;
    const pageDir = path.dirname(path.join(ROOT, relativePage));
    const target = clean.startsWith('/MyProjects/')
      ? path.join(ROOT, clean.slice('/MyProjects/'.length))
      : path.resolve(pageDir, clean);
    targets.push({ raw, target: target.endsWith(path.sep) ? path.join(target, 'index.html') : target });
  }
  return targets;
}

const portfolio = JSON.parse(await text('assets/projects.json'));
const evidence = JSON.parse(await text('evidence/github-existence.json'));
const assets = portfolio.a.map((row) => ({
  id: row[0], ref: row[1], slug: row[2], name: row[3], category: row[4], status: row[5],
  summary: row[6], ask: Number(row[7]), recreation: Number(row[8]), potential: row[9], route: row[10]
}));

check('release:portfolio', portfolio.v === RELEASE, portfolio.v);
check('release:evidence', evidence.release === RELEASE, evidence.release);
check('portfolio:asset-count', portfolio.n === assets.length && assets.length === 54, `${portfolio.n}/${assets.length}`);
check('portfolio:asset-count-evidence', evidence.asset_count === assets.length && evidence.records.length === assets.length);
check('portfolio:sequential-identities', assets.every((asset, index) =>
  asset.id === index + 1 && asset.ref === `TA-IP-${String(index + 1).padStart(3, '0')}`));
check('portfolio:unique-slugs', new Set(assets.map((asset) => asset.slug)).size === assets.length);
check('portfolio:unique-references', new Set(assets.map((asset) => asset.ref)).size === assets.length);
check('portfolio:index-bounds', assets.every((asset) =>
  portfolio.c[asset.category] && portfolio.r[asset.route] && ARR[asset.potential]));
check('portfolio:price-boundaries', assets.every((asset) =>
  asset.ask > 0 && asset.recreation > 0 && asset.ask <= asset.recreation));

const ask = assets.reduce((sum, asset) => sum + asset.ask, 0);
const recreation = assets.reduce((sum, asset) => sum + asset.recreation, 0);
const modeledArr = assets.reduce((sum, asset) => sum + ARR[asset.potential], 0);
check('portfolio:totals', ask === portfolio.t[0] && recreation === portfolio.t[1] && modeledArr === portfolio.t[2],
  `${ask}/${recreation}/${modeledArr}`);

const statuses = countBy(assets.map((asset) => asset.status));
const potentials = countBy(assets.map((asset) => asset.potential));
check('portfolio:status-counts', ['V', 'P', 'R'].every((key) => (statuses[key] || 0) === portfolio.sc[key]));
check('portfolio:potential-counts', Object.keys(ARR).every((key) => (potentials[key] || 0) === portfolio.pc[key]));

const evidenceBySlug = new Map(evidence.records.map((record) => [record.slug, record]));
check('evidence:unique-slugs', evidenceBySlug.size === evidence.records.length);
check('evidence:complete', assets.every((asset) => {
  const record = evidenceBySlug.get(asset.slug);
  return record?.asset_ref === asset.ref && record.repository_exists === true &&
    record.repository_private === true && record.first_party_license_posture === 'proprietary' &&
    record.license_boundary_verified === true;
}));
const evidenceHash = createHash('sha256').update(sortedRecordJson(evidence.records)).digest('hex');
check('evidence:sha256', evidenceHash === evidence.portfolio_sha256, evidenceHash);

const expectedUrls = new Set([
  ORIGIN,
  `${ORIGIN}commercialization.html`,
  `${ORIGIN}transfer.html`,
  ...assets.map((asset) => `${ORIGIN}projects/${asset.slug}/`)
]);
const sitemap = await text('sitemap.xml');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
check('sitemap:unique', new Set(sitemapUrls).size === sitemapUrls.length);
check('sitemap:complete', sitemapUrls.length === expectedUrls.size && sitemapUrls.every((url) => expectedUrls.has(url)),
  `${sitemapUrls.length}/${expectedUrls.size}`);

const canonicalPages = ['index.html', 'commercialization.html', 'transfer.html'];
for (const asset of assets) canonicalPages.push(`projects/${asset.slug}/index.html`);

for (const relative of canonicalPages) {
  const html = await text(relative);
  const asset = assets.find((item) => relative === `projects/${item.slug}/index.html`);
  check(`html:doctype:${relative}`, html.startsWith('<!doctype html>'));
  check(`html:language:${relative}`, html.includes('<html lang="en"'));
  check(`html:viewport:${relative}`, html.includes('name="viewport"'));
  check(`html:description:${relative}`, html.includes('name="description"'));
  check(`html:release:${relative}`, html.includes(`data-release="${RELEASE}"`));
  check(`html:canonical:${relative}`, html.includes(`rel="canonical"`));
  if (asset) {
    const canonical = `${ORIGIN}projects/${asset.slug}/`;
    check(`html:asset:${asset.slug}`, html.includes(`data-asset="${asset.slug}"`) && html.includes(`<p class="eyebrow">${asset.ref}</p>`));
    check(`html:og:${asset.slug}`, html.includes('property="og:title"') && html.includes('property="og:description"'));
    check(`html:canonical-target:${asset.slug}`, html.includes(`href="${canonical}"`));
  }
  for (const { raw, target } of localTargets(html, relative)) {
    check(`link:${relative}:${raw}`, await exists(target), target);
  }
}

for (const relative of ['assets/site.js', 'assets/foundations.js', 'assets/github-evidence.js']) {
  const source = await text(relative);
  check(`javascript:release:${relative}`, source.includes(`'${RELEASE}'`));
  try {
    new vm.Script(source, { filename: relative });
    check(`javascript:syntax:${relative}`, true);
  } catch (error) {
    check(`javascript:syntax:${relative}`, false, error.message);
  }
}

const projectEntries = await readdir(path.join(ROOT, 'projects'), { withFileTypes: true });
const canonicalSlugs = new Set(assets.map((asset) => asset.slug));
for (const entry of projectEntries.filter((item) => item.isDirectory())) {
  const html = await text(`projects/${entry.name}/index.html`);
  if (!canonicalSlugs.has(entry.name)) {
    check(`legacy:noindex:${entry.name}`, html.includes('name="robots" content="noindex"'));
    check(`legacy:redirect:${entry.name}`, html.includes('http-equiv="refresh"'));
  }
}

const repositoryFiles = [
  'README.md', '404.html', 'index.html', 'commercialization.html', 'transfer.html',
  'assets/site.js', 'assets/foundations.js', 'assets/github-evidence.js',
  'assets/projects.json', 'evidence/github-existence.json'
];
for (const relative of repositoryFiles) {
  check(`release:no-stale-marker:${relative}`, !(await text(relative)).includes('20260903-13'));
}
check('policy:no-github-actions', !(await exists(path.join(ROOT, '.github', 'workflows'))));
const license = await text('LICENSE');
check('policy:proprietary-license', license.includes('PROPRIETARY WEBSITE LICENSE') && license.includes('All Rights Reserved'));

const report = {
  project: 'THEARCHITECT_MAX MyProjects',
  release: RELEASE,
  successful: failures.length === 0,
  checks: checks.length,
  assetCount: assets.length,
  canonicalPages: canonicalPages.length,
  failures
};

console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
