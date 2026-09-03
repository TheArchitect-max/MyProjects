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
const evidence=json('evidence/github-existence.json');
assert(base.v===refresh.base_version,'refresh/base version mismatch');
const merged=JSON.parse(JSON.stringify(base));
for(const c of refresh.replacements){const row=merged.a.find(x=>x[0]===c.id);assert(row,`missing replacement id ${c.id}`);row[2]=c.slug;row[3]=c.name;row[6]=c.summary}
const refs=new Set(merged.a.map(x=>x[1]));for(const row of refresh.additions){if(!refs.has(row[1]))merged.a.push(row)}
merged.n=refresh.canonical_assets;merged.t=[...refresh.totals];merged.sc={...refresh.status_counts};merged.pc={...refresh.potential_counts};

assert(merged.n===57,'canonical asset count must be 57');
assert(merged.a.length===57,'merged row count must be 57');
assert(new Set(merged.a.map(x=>x[1])).size===57,'asset refs must be unique');
assert(new Set(merged.a.map(x=>x[2])).size===57,'asset slugs must be unique');
for(let i=0;i<merged.a.length;i++){assert(merged.a[i][0]===i+1,`non-sequential id ${i+1}`);assert(merged.a[i][1]===`TA-IP-${String(i+1).padStart(3,'0')}`,`bad asset ref ${i+1}`)}
const ask=merged.a.reduce((s,x)=>s+Number(x[7]),0),rd=merged.a.reduce((s,x)=>s+Number(x[8]),0);
assert(ask===21660000,'As-Is total mismatch');assert(rd===38770000,'recreation total mismatch');
const sc={V:0,P:0,R:0},pc={VH:0,H:0,M:0,S:0};for(const x of merged.a){sc[x[5]]++;pc[x[9]]++;assert(x[7]>0&&x[8]>=x[7],`invalid price relation ${x[1]}`)}
assert(JSON.stringify(sc)===JSON.stringify(refresh.status_counts),'maturity counts mismatch');
assert(JSON.stringify(pc)===JSON.stringify(refresh.potential_counts),'potential counts mismatch');

assert(evidence.release===refresh.v,'evidence release mismatch');assert(evidence.asset_count===57,'evidence count mismatch');
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
const index=read('index.html');assert(index.includes('57 canonical assets'),'homepage canonical count missing');assert(index.indexOf('portfolio-overlay.js')<index.indexOf('site.js'),'portfolio overlay must load before site.js');assert(index.includes('€21.660.000'),'homepage As-Is total missing');assert(index.includes('€38.770.000'),'homepage recreation total missing');
for(const oldName of ['AxiomCrypt','Shield Breaker Research','Chimera Spectral Perception System'])assert(!index.includes(oldName),`legacy identity leaked into homepage: ${oldName}`);
console.log('Release 20260903-17 validation passed: 57 canonical assets, 58 observed private repos, pricing/evidence/routes reconciled.');
