#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const json=p=>JSON.parse(read(p));
const exists=p=>fs.existsSync(path.join(root,p));
const assert=(c,m)=>{if(!c)throw Error(m)};

const d=json('assets/im-data.json');
const base=d.a;
const rc=json('assets/recreation-costs.json');
const descriptions=json('assets/descriptions.json');
const structure=json('assets/portfolio-structure.json');
const intake=json('assets/intake-assets.json');
const pkg=json('package.json');

assert(d.v==='2026.09.08-im14','base register version');
assert(rc.v==='2026.09.08-im14','recreation register version');
assert(structure.v==='2026.09.08-im16','structure version');
assert(intake.v==='2026.09.08-im16','intake version');
assert(pkg.version==='2026.9.8-im16','package version');
assert(base.length===75&&rc.assets.length===75,'base referenced asset count');
assert(intake.assets.length===4,'pending intake count');

const baseAssets=base.map((x,i)=>({id:x[0],ref:x[1],slug:x[2],name:x[3],stage:x[5],potential:x[6],ask:x[8],low:x[9],high:x[10],recreationCost:rc.assets[i],description:descriptions.descriptions[x[2]],priced:true}));
const intakeAssets=intake.assets.map(x=>({id:x.id,ref:x.ref,slug:x.slug,name:x.name,stage:x.stage,potential:x.potential,ask:null,low:null,high:null,recreationCost:null,description:x.description,priced:false}));
const assets=[...baseAssets,...intakeAssets];

assert(assets.length===79,'active standalone asset count');
assert(new Set(assets.map(x=>x.ref)).size===79,'unique TA-IP references');
assert(new Set(assets.map(x=>x.slug)).size===79,'unique slugs');
assert(!assets.some(x=>x.ref==='TA-IP-001'||x.slug==='research-orchestrator'),'retired predecessor excluded');
assert(!assets.some(x=>x.ref==='TA-IP-014'),'TA-IP-014 remains unused');
assert(assets.every(x=>x.ref===`TA-IP-${String(x.id).padStart(3,'0')}`),'stable ref mapping');
assert(intakeAssets.every(x=>x.id>=78&&x.id<=81&&!x.priced),'intake references 078-081 pending');
assert(structure.retired.some(x=>x.ref==='TA-IP-001'&&x.successor==='research-intelligence-fabric'),'retirement lineage');

assert(structure.policy.asset_independence.includes('standalone intellectual-property asset'),'standalone policy');
assert(structure.policy.family_role.includes('not itself an IP asset'),'family-only policy');
assert(structure.policy.multi_asset_transactions.includes('explicitly identify each included asset'),'multi-asset policy');

baseAssets.forEach(x=>{
  assert(x.low<=x.ask&&x.ask<=x.high,`range ${x.ref}`);
  assert(x.recreationCost>0,`recreation ${x.ref}`);
  assert(typeof x.description==='string'&&x.description.length>20,`description ${x.ref}`);
});
intakeAssets.forEach(x=>assert(typeof x.description==='string'&&x.description.length>20,`intake description ${x.ref}`));

const sum=k=>baseAssets.reduce((n,x)=>n+Number(x[k]||0),0);
assert(sum('ask')===13470000,'asking total');
assert(sum('low')===10740000&&sum('high')===16875000,'range totals');
assert(sum('recreationCost')===57350000&&rc.portfolioRecreationCostEUR===57350000,'recreation total');

const stage=assets.reduce((m,x)=>(m[x.stage]=(m[x.stage]||0)+1,m),{});
const potential=assets.reduce((m,x)=>(m[x.potential]=(m[x.potential]||0)+1,m),{});
assert(stage.V===41&&stage.P===32&&stage.R===6,'stage counts');
assert(potential.VH===16&&potential.H===40&&potential.M===13&&potential.S===10,'potential counts');

assert(Array.isArray(structure.families)&&structure.families.length===12,'classification family count');
const familySlugs=structure.families.flatMap(f=>f.assets||[]);
assert(familySlugs.length===79&&new Set(familySlugs).size===79,'complete unique family assignments');
const activeSlugs=new Set(assets.map(x=>x.slug));
for(const slug of familySlugs)assert(activeSlugs.has(slug),`family references inactive slug ${slug}`);
for(const slug of activeSlugs)assert(familySlugs.includes(slug),`asset lacks family ${slug}`);

for(const p of ['index.html','portfolio.html','opportunity.html','transaction.html','notice.html']){
  const h=read(p);
  assert(h.includes('rel="canonical"'),`canonical ${p}`);
  assert(h.includes('im4.css?v=im16'),`IM16 stylesheet ${p}`);
  assert(h.toLowerCase().includes('standalone'),`standalone language ${p}`);
}
assert(read('index.html').includes('79 standalone IP assets'),'homepage 79');
assert(read('index.html').includes('75 referenced')&&read('index.html').includes('4 pending'),'homepage pricing split');
assert(read('portfolio.html').includes('79 standalone'),'portfolio 79');
assert(!read('transaction.html').includes('Product-family acquisition'),'family not transaction unit');
assert(read('transaction.html').includes('Single-asset acquisition')&&read('transaction.html').includes('Multi-asset acquisition'),'transaction routes');

const projectRoot=path.join(root,'projects');
const actual=new Set(fs.readdirSync(projectRoot,{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>x.name));
assert(actual.size===79,'project directory count');
assert(!actual.has('research-orchestrator'),'retired project route removed');
for(const slug of activeSlugs){
  assert(actual.has(slug),`missing project route ${slug}`);
  const h=read(`projects/${slug}/index.html`);
  assert(h.includes('../../assets/im.js?v=im16'),`IM16 runtime ${slug}`);
  assert(h.includes('../../assets/im4.css?v=im16'),`IM16 stylesheet ${slug}`);
  assert(h.includes('Standalone IP Asset')&&!h.includes('noindex'),`profile shell ${slug}`);
}

const locs=[...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);
assert(locs.length===84&&new Set(locs).size===84,'sitemap URL count');
assert(!locs.some(x=>x.includes('/projects/research-orchestrator/')),'retired sitemap route');
for(const slug of activeSlugs)assert(locs.includes(`https://thearchitect-max.github.io/MyProjects/projects/${slug}/`),`sitemap ${slug}`);

const runtime=read('assets/im.js');
new vm.Script(runtime);
assert(runtime.includes("VERSION='im16'"),'runtime version');
assert(runtime.includes('intake-assets.json'),'runtime intake merge');
assert(runtime.includes('Pending qualification'),'runtime pending pricing');
assert(runtime.includes('standalone:true'),'runtime standalone flag');
assert(!exists('.github/workflows'),'Actions prohibited');
assert(!exists('evidence'),'public evidence prohibited');

console.log(JSON.stringify({
  technologyIpPortfolio:true,
  presentationRelease:'IM16',
  standaloneActiveAssets:79,
  referencedAssets:75,
  pendingCommercialQualification:4,
  retiredPredecessors:1,
  classificationFamilies:12,
  familyIsTransactionUnit:false,
  askingReferenceEUR:13470000,
  rangeEUR:[10740000,16875000],
  recreationCostEUR:57350000,
  stageCounts:{developedSoftware:41,developedPrototype:32,researchStage:6},
  potentialCounts:{veryHigh:16,high:40,moderate:13,specialist:10},
  sitemapUrls:84,
  githubActions:false
},null,2));
