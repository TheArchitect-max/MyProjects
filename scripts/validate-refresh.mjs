import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const json=(p)=>JSON.parse(read(p));
const fail=(m)=>{throw new Error(m)};
const assert=(c,m)=>{if(!c)fail(m)};

const base=json('assets/projects.json');
const refresh=json('assets/portfolio-refresh.json');
const pricing=json('assets/pricing-review.json');
const evidence=json('evidence/github-existence.json');
assert(base.v===refresh.base_version,'refresh/base version mismatch');
assert(pricing.v==='20260903-18','pricing release mismatch');
assert(pricing.basis_release===refresh.v,'pricing basis release mismatch');
assert(!('prior_asking_reference' in pricing.portfolio),'legacy public asking reference must be absent');
const merged=JSON.parse(JSON.stringify(base));
for(const c of refresh.replacements){const row=merged.a.find(x=>x[0]===c.id);assert(row,`missing replacement id ${c.id}`);row[2]=c.slug;row[3]=c.name;row[6]=c.summary}
const refs=new Set(merged.a.map(x=>x[1]));for(const row of refresh.additions){if(!refs.has(row[1]))merged.a.push(row)}
assert(Array.isArray(pricing.records)&&pricing.records.length===57,'pricing record count mismatch');
for(const record of pricing.records){const row=merged.a.find(x=>x[0]===record[0]);assert(row,`missing pricing id ${record[0]}`);row[7]=Number(record[1])}
merged.n=refresh.canonical_assets;merged.t=[pricing.portfolio.strategic_asking_reference,pricing.portfolio.recreation_cost_reference,refresh.totals[2]];merged.sc={...refresh.status_counts};merged.pc={...refresh.potential_counts};

assert(merged.n===57,'canonical asset count must be 57');
assert(merged.a.length===57,'merged row count must be 57');
assert(new Set(merged.a.map(x=>x[1])).size===57,'asset refs must be unique');
assert(new Set(merged.a.map(x=>x[2])).size===57,'asset slugs must be unique');
for(let i=0;i<merged.a.length;i++){assert(merged.a[i][0]===i+1,`non-sequential id ${i+1}`);assert(merged.a[i][1]===`TA-IP-${String(i+1).padStart(3,'0')}`,`bad asset ref ${i+1}`)}
const ask=merged.a.reduce((s,x)=>s+Number(x[7]),0),rd=merged.a.reduce((s,x)=>s+Number(x[8]),0);
assert(ask===10310000,'strategic asking total mismatch');assert(rd===38770000,'recreation total mismatch');
assert(refresh.totals[0]===pricing.portfolio.strategic_asking_reference,'refresh strategic total mismatch');
assert(pricing.portfolio.strategic_band[0]===8225000&&pricing.portfolio.strategic_band[1]===12900000,'strategic band mismatch');
assert(pricing.portfolio.quick_sale_reference===4070000,'quick-sale total mismatch');
const low=pricing.records.reduce((s,x)=>s+Number(x[2]),0),high=pricing.records.reduce((s,x)=>s+Number(x[3]),0),quick=pricing.records.reduce((s,x)=>s+Number(x[4]),0);
assert(low===8225000&&high===12900000&&quick===4070000,'pricing-record aggregate mismatch');
for(const record of pricing.records){assert(record[2]<=record[1]&&record[1]<=record[3],`invalid strategic band ${record[0]}`);assert(record[4]<=record[1],`invalid liquidity reference ${record[0]}`)}
const pricingDigest=crypto.createHash('sha256').update(JSON.stringify(pricing.records)).digest('hex');
assert(pricingDigest===pricing.records_sha256,'pricing SHA-256 mismatch');
const sc={V:0,P:0,R:0},pc={VH:0,H:0,M:0,S:0};for(const x of merged.a){sc[x[5]]++;pc[x[9]]++;assert(x[7]>0&&x[8]>=x[7],`invalid price relation ${x[1]}`)}
assert(JSON.stringify(sc)===JSON.stringify(refresh.status_counts),'maturity counts mismatch');
assert(JSON.stringify(pc)===JSON.stringify(refresh.potential_counts),'potential counts mismatch');
assert(pricing.sources.length>=8,'multi-source valuation evidence missing');
assert(pricing.model.income_approach.includes('not applied'),'income-approach boundary missing');

assert(evidence.release===refresh.v,'repository-evidence release mismatch');assert(evidence.asset_count===57,'evidence count mismatch');
assert(evidence.canonical_private_repositories===57,'canonical private repository count mismatch');assert(evidence.private_repositories_observed===58,'observed private repository count mismatch');assert(evidence.legacy_private_repositories_retained===1,'legacy repository count mismatch');
assert(evidence.records.length===57,'evidence record count mismatch');
const canonical=JSON.stringify(evidence.records.map(r=>Object.fromEntries(Object.entries(r).sort(([a],[b])=>a.localeCompare(b)))));
const digest=crypto.createHash('sha256').update(canonical).digest('hex');assert(digest===evidence.portfolio_sha256,'evidence SHA-256 mismatch');
const evidenceSlugs=new Set(evidence.records.map(r=>r.slug));for(const row of merged.a)assert(evidenceSlugs.has(row[2]),`missing evidence for ${row[2]}`);

for(const row of merged.a){const p=`projects/${row[2]}/index.html`;assert(fs.existsSync(path.join(root,p)),`missing canonical page ${p}`)}
const redirects={
 'projects/axiomcrypt/index.html':'modular-key-cryptanalysis-platform',
 'projects/shield-breaker-research/index.html':'protein-structure-evidence-qualification-platform',
 'projects/titan-evtol-research-platform/index.html':'electric-flight-systems-simulation-validation-platform',
 'projects/chimera-spectral-perception-system/index.html':'vision-evidence-governed-multimodal-perception-framework'
};
for(const [p,target] of Object.entries(redirects)){const text=read(p);assert(text.includes('noindex'),`legacy route not noindex: ${p}`);assert(text.includes(target),`legacy route target mismatch: ${p}`)}
assert(fs.existsSync(path.join(root,'evidence/valuation-review-2026-09-03.md')),'valuation review report missing');
const index=read('index.html');assert(index.includes('57 canonical assets'),'homepage canonical count missing');assert(index.indexOf('portfolio-overlay.js')<index.indexOf('site.js'),'portfolio overlay must load before site.js');assert(index.includes('€10.310.000'),'homepage strategic asking total missing');assert(index.includes('€38.770.000'),'homepage recreation total missing');assert(index.includes('20260903-18'),'homepage release 18 marker missing');
const commercial=read('commercialization.html');assert(commercial.includes('€10.310.000'),'commercial valuation total missing');assert(commercial.includes('€8.225.000')&&commercial.includes('€12.900.000'),'commercial valuation band missing');
const transfer=read('transfer.html');assert(transfer.includes('€10.31M'),'transfer strategic asking total missing');
const siteJs=read('assets/site.js');assert(siteJs.includes("const RELEASE = '20260903-18'"),'site runtime release mismatch');assert(siteJs.includes('pricing-review.json'),'site runtime pricing source missing');
for(const oldName of ['AxiomCrypt','Shield Breaker Research','Chimera Spectral Perception System'])assert(!index.includes(oldName),`legacy identity leaked into homepage: ${oldName}`);
console.log('Release 20260903-18 validation passed: 57 canonical assets, current-only market-calibrated pricing, strategic bands, liquidity references, SHA-256 pricing integrity, repository evidence and routes reconciled.');
