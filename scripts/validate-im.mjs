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
const a=d.a;
const rc=json('assets/recreation-costs.json');
const descriptions=json('assets/descriptions.json');
const structure=json('assets/portfolio-structure.json');

assert(d.v==='2026.09.08-im14','active register version');
assert(rc.v==='2026.09.08-im14','recreation register version');
assert(structure.v==='2026.09.08-im14','portfolio structure version');
assert(d.p[0]===75&&a.length===75&&rc.assets.length===75,'active asset count');
assert(new Set(a.map(x=>x[1])).size===75&&new Set(a.map(x=>x[2])).size===75,'unique refs/slugs');
assert(!a.some(x=>x[1]==='TA-IP-001'||x[2]==='research-orchestrator'),'retired predecessor excluded');
assert(!a.some(x=>x[1]==='TA-IP-014'),'TA-IP-014 withdrawn');
assert(a.every(x=>x[1]===`TA-IP-${String(x[0]).padStart(3,'0')}`),'stable id/ref');
assert(structure.retired.some(x=>x.ref==='TA-IP-001'&&x.slug==='research-orchestrator'&&x.successor==='research-intelligence-fabric'),'retirement lineage');

a.forEach((x,i)=>{
  assert(x[9]<=x[8]&&x[8]<=x[10],`range ${x[1]}`);
  assert(rc.assets[i]>0,`recreation cost ${x[1]}`);
  assert(!x[11],`external URL ${x[1]}`);
  assert(typeof descriptions.descriptions[x[2]]==='string'&&descriptions.descriptions[x[2]].length>20,`description ${x[1]}`);
});

const sum=i=>a.reduce((n,x)=>n+x[i],0);
const count=i=>a.reduce((m,x)=>(m[x[i]]=(m[x[i]]||0)+1,m),{});
assert(sum(8)===13470000&&sum(9)===10740000&&sum(10)===16875000,'portfolio asking/range totals');
assert(d.p[1]===13470000&&d.p[2]===10740000&&d.p[3]===16875000,'header asking/range totals');
assert(rc.portfolioRecreationCostEUR===57350000&&rc.assets.reduce((n,v)=>n+v,0)===57350000,'recreation total');
const sc=count(5),pc=count(6);
assert(sc.V===40&&sc.P===29&&sc.R===6,'stage counts');
assert(d.p[4]===40&&d.p[5]===29&&d.p[6]===6,'header stage counts');
assert(pc.VH===16&&pc.H===36&&pc.M===13&&pc.S===10,'potential counts');

assert(Array.isArray(structure.families)&&structure.families.length===12,'product family count');
const familySlugs=structure.families.flatMap(f=>f.assets||[]);
assert(familySlugs.length===75&&new Set(familySlugs).size===75,'unique family assignments');
const activeSlugs=new Set(a.map(x=>x[2]));
for(const slug of familySlugs)assert(activeSlugs.has(slug),`family references inactive asset ${slug}`);
for(const slug of activeSlugs)assert(familySlugs.includes(slug),`active asset lacks family ${slug}`);

const by=r=>a.find(x=>x[1]===r);
assert(JSON.stringify(by('TA-IP-077'))===JSON.stringify([77,'TA-IP-077','qubo-structural-analysis-and-optimization-platform','QUBO Structural Analysis and Optimization Platform',6,'P','M',1,90000,70000,115000,'']),'QUBO contract');
assert(JSON.stringify(by('TA-IP-059'))===JSON.stringify([59,'TA-IP-059','fusionlunar-energy-systems-engineering-platform','FusionLunar Energy Systems Engineering Platform',6,'P','M',1,350000,280000,440000,'']),'FusionLunar contract');
assert(by('TA-IP-073')[5]==='V'&&by('TA-IP-075')[5]==='V','software promotions');

for(const p of ['index.html','portfolio.html','opportunity.html','transaction.html','notice.html']){
  const h=read(p);
  assert(h.includes('rel="canonical"'),`canonical ${p}`);
  assert(h.includes('Technology & IP Portfolio')||p==='notice.html'||p==='transaction.html',`portfolio identity ${p}`);
}
assert(read('index.html').includes('75 active')&&read('index.html').includes('12 product families'),'homepage rationalisation');
assert(read('index.html').includes('€13.470M')&&read('index.html').includes('€10.740M – €16.875M')&&read('index.html').includes('€57.350M'),'homepage commercial totals');
assert(read('opportunity.html').includes('€13.470M')&&read('opportunity.html').includes('€10.740M – €16.875M')&&read('opportunity.html').includes('€57.350M'),'opportunity commercial totals');
assert(read('portfolio.html').includes('id="family"')&&read('portfolio.html').includes('75 active assets'),'portfolio family filter');

const expected=new Set(a.map(x=>x[2]));
const projectRoot=path.join(root,'projects');
const actual=new Set(fs.readdirSync(projectRoot,{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>x.name));
assert(actual.size===75,'project directory count');
assert(!actual.has('research-orchestrator'),'retired project route removed');
for(const slug of expected){
  assert(actual.has(slug),`missing ${slug}`);
  const h=read(`projects/${slug}/index.html`);
  assert(h.includes('../../assets/im.js')&&!h.includes('noindex'),`profile ${slug}`);
}

const locs=[...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);
assert(locs.length===80&&new Set(locs).size===80,'sitemap URL count');
assert(!locs.some(x=>x.includes('/projects/research-orchestrator/')),'retired sitemap route');
for(const x of a)assert(locs.includes(`https://thearchitect-max.github.io/MyProjects/projects/${x[2]}/`),`sitemap ${x[2]}`);

new vm.Script(read('assets/im.js'));
assert(read('assets/im.js').includes("VERSION='im14'"),'runtime version');
assert(read('assets/im.js').includes('portfolio-structure.json'),'runtime structure register');
assert(!exists('.github/workflows'),'Actions prohibited');
assert(!exists('evidence'),'public evidence prohibited');

console.log(JSON.stringify({
  technologyIpPortfolio:true,
  presentationRelease:'IM14',
  activeAssets:75,
  retiredPredecessors:1,
  productFamilies:12,
  askingReferenceEUR:13470000,
  rangeEUR:[10740000,16875000],
  recreationCostEUR:57350000,
  commercialRefresh:'2026-09-08',
  stageCounts:{developedSoftware:40,developedPrototype:29,researchStage:6},
  potentialCounts:{veryHigh:16,high:36,moderate:13,specialist:10},
  sitemapUrls:80,
  staleProjectRoutes:0,
  staleExternalUrls:0,
  githubActions:false
},null,2));
