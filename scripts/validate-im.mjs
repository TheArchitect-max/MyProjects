#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const json=p=>JSON.parse(read(p));
const exists=p=>fs.existsSync(path.join(root,p));
const assert=(condition,message)=>{if(!condition)throw Error(message)};

const d=json('assets/im-data.json');
const base=d.a;
const rc=json('assets/recreation-costs.json');
const descriptions=json('assets/descriptions.json');
const structure=json('assets/portfolio-structure.json');
const supplemental=json('assets/intake-assets.json');
const pkg=json('package.json');

assert(pkg.version==='2026.9.8-im17','package presentation version');
assert(base.length===75&&rc.assets.length===75,'base referenced asset count');
assert(Array.isArray(supplemental.assets)&&supplemental.assets.length===4,'supplemental asset count');
assert(supplemental.v==='2026.09.08-im17'&&supplemental.status==='qualified-commercial-references','supplemental pricing register');
assert(supplemental.assets.every(x=>x.pricing_status==='established'&&x.low<=x.ask&&x.ask<=x.high&&x.recreationCost>0),'supplemental commercial references');

const baseAssets=base.map((x,i)=>({id:x[0],ref:x[1],slug:x[2],name:x[3],sector:d.s[x[4]],stage:x[5],potential:x[6],route:d.r[x[7]],ask:x[8],low:x[9],high:x[10],recreationCost:rc.assets[i],description:descriptions.descriptions[x[2]]||''}));
const extraAssets=supplemental.assets.map(x=>({...x}));
const assets=[...baseAssets,...extraAssets];

assert(assets.length===79,'active standalone asset count');
assert(new Set(assets.map(x=>x.ref)).size===79&&new Set(assets.map(x=>x.slug)).size===79,'unique active refs/slugs');
assert(!assets.some(x=>x.ref==='TA-IP-001'||x.slug==='research-orchestrator'),'retired predecessor excluded');
assert(!assets.some(x=>x.ref==='TA-IP-014'),'TA-IP-014 withdrawn');
assert(assets.every(x=>x.ref===`TA-IP-${String(x.id).padStart(3,'0')}`),'stable id/ref');
assert(structure.retired.some(x=>x.ref==='TA-IP-001'&&x.slug==='research-orchestrator'&&x.successor==='research-intelligence-fabric'),'retirement lineage');
assert(typeof structure.policy?.asset_independence==='string'&&structure.policy.asset_independence.includes('standalone intellectual-property asset'),'standalone asset policy');
assert(typeof structure.policy?.family_role==='string'&&structure.policy.family_role.includes('classification and navigation')&&structure.policy.family_role.includes('not itself an IP asset'),'classification family policy');

for(const x of baseAssets){assert(x.low<=x.ask&&x.ask<=x.high,`range ${x.ref}`);assert(x.recreationCost>0,`recreation ${x.ref}`);assert(x.description.length>20,`description ${x.ref}`)}
for(const x of extraAssets){assert(x.description.length>20,`description ${x.ref}`)}

const sum=k=>assets.reduce((n,x)=>n+(Number(x[k])||0),0);
const count=k=>assets.reduce((m,x)=>(m[x[k]]=(m[x[k]]||0)+1,m),{});
assert(sum('ask')===14075000,'aggregate asking reference');
assert(sum('low')===11220000&&sum('high')===17645000,'aggregate range');
assert(sum('recreationCost')===60150000,'aggregate recreation cost');
const stages=count('stage'),potentials=count('potential');
assert(stages.V===41&&stages.P===32&&stages.R===6,'stage counts');
assert(potentials.VH===16&&potentials.H===40&&potentials.M===13&&potentials.S===10,'potential counts');

assert(Array.isArray(structure.families)&&structure.families.length===12,'classification family count');
const familySlugs=structure.families.flatMap(f=>f.assets||[]);
assert(familySlugs.length===79&&new Set(familySlugs).size===79,'unique classification assignments');
const activeSlugs=new Set(assets.map(x=>x.slug));
for(const slug of familySlugs)assert(activeSlugs.has(slug),`family references inactive asset ${slug}`);
for(const slug of activeSlugs)assert(familySlugs.includes(slug),`active asset lacks classification family ${slug}`);

const by=r=>assets.find(x=>x.ref===r);
assert(by('TA-IP-078').ask===125000&&by('TA-IP-078').recreationCost===650000,'ANAP commercial contract');
assert(by('TA-IP-079').ask===145000&&by('TA-IP-079').recreationCost===750000,'BIND-AI commercial contract');
assert(by('TA-IP-080').ask===110000&&by('TA-IP-080').recreationCost===550000,'CardioSignal commercial contract');
assert(by('TA-IP-081').ask===225000&&by('TA-IP-081').recreationCost===850000,'SAIP commercial contract');

for(const p of ['index.html','portfolio.html','opportunity.html','transaction.html','notice.html']){
  const h=read(p);
  assert(h.includes('rel="canonical"'),`canonical ${p}`);
  assert(h.toLowerCase().includes('standalone'),`standalone language ${p}`);
  assert(h.toLowerCase().includes('classification'),`classification language ${p}`);
  assert(h.includes('im4.css?v=im17'),`IM17 stylesheet ${p}`);
  assert(!h.toLowerCase().includes('4 pending')&&!h.toLowerCase().includes('four pending'),'no pending valuation language');
}
assert(read('index.html').includes('€14.075M')&&read('index.html').includes('€11.220M – €17.645M')&&read('index.html').includes('€60.150M'),'homepage aggregate totals');
assert(read('opportunity.html').includes('€14.075M')&&read('opportunity.html').includes('€11.220M – €17.645M')&&read('opportunity.html').includes('€60.150M'),'opportunity aggregate totals');
assert(read('portfolio.html').includes('79 standalone IP assets'),'portfolio count');
assert(!read('transaction.html').includes('Product-family acquisition'),'family is not transaction unit');

const projectRoot=path.join(root,'projects');
const actual=new Set(fs.readdirSync(projectRoot,{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>x.name));
assert(actual.size===79,'project directory count');
assert(!actual.has('research-orchestrator'),'retired project route removed');
for(const slug of activeSlugs){
  assert(actual.has(slug),`missing ${slug}`);
  const h=read(`projects/${slug}/index.html`);
  assert(h.includes('../../assets/im.js?v=im17'),`IM17 runtime ${slug}`);
  assert(h.includes('../../assets/im4.css?v=im17'),`IM17 stylesheet ${slug}`);
  assert(h.includes('Standalone IP Asset')&&!h.includes('noindex'),`standalone profile shell ${slug}`);
}

const locs=[...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);
assert(locs.length===84&&new Set(locs).size===84,'sitemap URL count');
assert(!locs.some(x=>x.includes('/projects/research-orchestrator/')),'retired sitemap route');
for(const slug of activeSlugs)assert(locs.includes(`https://thearchitect-max.github.io/MyProjects/projects/${slug}/`),`sitemap ${slug}`);

new vm.Script(read('assets/im.js'));
assert(read('assets/im.js').includes("VERSION='im17'"),'runtime version');
assert(read('assets/im.js').includes("pricing_status==='established'"),'runtime supplemental pricing');
assert(read('assets/im.js').includes('standalone:true'),'runtime standalone asset flag');
assert(!exists('.github/workflows'),'Actions prohibited');
assert(!exists('evidence'),'public evidence prohibited');

console.log(JSON.stringify({
  technologyIpPortfolio:true,
  presentationRelease:'IM17',
  standaloneActiveAssets:79,
  individuallyReferencedAssets:79,
  pendingValuations:0,
  retiredPredecessors:1,
  classificationFamilies:12,
  familyIsTransactionUnit:false,
  askingReferenceEUR:14075000,
  rangeEUR:[11220000,17645000],
  recreationCostEUR:60150000,
  commercialRefresh:'2026-09-08',
  stageCounts:{developedSoftware:41,developedPrototype:32,researchStage:6},
  potentialCounts:{veryHigh:16,high:40,moderate:13,specialist:10},
  sitemapUrls:84,
  githubActions:false
},null,2));
