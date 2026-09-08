#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const json=p=>JSON.parse(read(p));
const exists=p=>fs.existsSync(path.join(root,p));
const assert=(condition,message)=>{if(!condition)throw Error(message)};
const near=(a,b,t=1e-6)=>Math.abs(a-b)<=t;

const d=json('assets/im-data.json');
const base=d.a;
const rc=json('assets/recreation-costs.json');
const descriptions=json('assets/descriptions.json');
const structure=json('assets/portfolio-structure.json');
const supplemental=json('assets/intake-assets.json');
const valuation=json('assets/valuation-model.json');
const pkg=json('package.json');

assert(pkg.version==='2026.9.8-im18','package presentation version');
assert(valuation.v==='2026.09.08-im18','valuation model version');
assert(base.length===75&&rc.assets.length===75,'base referenced asset count');
assert(Array.isArray(supplemental.assets)&&supplemental.assets.length===4,'supplemental asset count');
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
const ask=sum('ask'),low=sum('low'),high=sum('high'),replacement=sum('recreationCost');
assert(ask===14075000,'aggregate asking reference');
assert(low===11220000&&high===17645000,'aggregate asking range');
assert(replacement===60150000,'aggregate recreation cost');
const stages=count('stage'),potentials=count('potential');
assert(stages.V===41&&stages.P===32&&stages.R===6,'stage counts');
assert(potentials.VH===16&&potentials.H===40&&potentials.M===13&&potentials.S===10,'potential counts');

assert(valuation.portfolio.assetCount===79,'valuation asset count');
assert(valuation.portfolio.askingReferenceEUR===ask&&valuation.portfolio.replacementCostEUR===replacement,'valuation portfolio inputs');
assert(near(valuation.portfolio.askingAsShareOfReplacement,ask/replacement,1e-9),'ask/replacement ratio');
assert(valuation.potentialDistribution.VH===16&&valuation.potentialDistribution.H===40&&valuation.potentialDistribution.M===13&&valuation.potentialDistribution.S===10,'valuation potential distribution');
assert(valuation.stageDistribution.V===41&&valuation.stageDistribution.P===32&&valuation.stageDistribution.R===6,'valuation stage distribution');

const weighted=(counts,factors)=>Object.entries(counts).reduce((n,[k,v])=>n+v*factors[k],0)/79;
for(const scenario of ['low','base','high']){
  const p=weighted(potentials,valuation.scenarioFactors[scenario].potential);
  const m=weighted(stages,valuation.scenarioFactors[scenario].maturity);
  assert(near(p,valuation.portfolioAverageFactors[scenario].potential,1e-9),`${scenario} potential factor`);
  assert(near(m,valuation.portfolioAverageFactors[scenario].maturity,1e-9),`${scenario} maturity factor`);
  assert(near(p*m,valuation.portfolioAverageFactors[scenario].combined,1e-9),`${scenario} combined factor`);
}
const calcLow=Math.round(replacement*valuation.portfolioAverageFactors.low.combined);
const calcBase=Math.round(replacement*valuation.portfolioAverageFactors.base.combined);
const calcHigh=Math.round(replacement*valuation.portfolioAverageFactors.high.combined);
assert(calcLow===valuation.strategicPotentialScenarioEUR.low,'strategic low scenario');
assert(calcBase===valuation.strategicPotentialScenarioEUR.baseExpectation,'strategic base scenario');
assert(calcHigh===valuation.strategicPotentialScenarioEUR.high,'strategic high scenario');
assert(calcLow===47056942&&calcBase===78484618&&calcHigh===138275848,'published strategic scenario values');
assert(near(valuation.strategicPotentialScenarioEUR.askingAsShareOfBaseExpectation,ask/calcBase,1e-9),'ask/base potential ratio');
assert(valuation.referenceFrameworks.length>=9,'expanded valuation reference architecture');

assert(Array.isArray(structure.families)&&structure.families.length===12,'classification family count');
const familySlugs=structure.families.flatMap(f=>f.assets||[]);
assert(familySlugs.length===79&&new Set(familySlugs).size===79,'unique classification assignments');
const activeSlugs=new Set(assets.map(x=>x.slug));
for(const slug of familySlugs)assert(activeSlugs.has(slug),`family references inactive asset ${slug}`);
for(const slug of activeSlugs)assert(familySlugs.includes(slug),`active asset lacks classification family ${slug}`);

const pages=['index.html','portfolio.html','opportunity.html','valuation.html','transaction.html','notice.html'];
for(const p of pages){
  const h=read(p);
  assert(h.includes('rel="canonical"'),`canonical ${p}`);
  assert(h.toLowerCase().includes('standalone')||p==='valuation.html',`portfolio language ${p}`);
  assert(h.includes('im4.css?v=im18'),`IM18 stylesheet ${p}`);
  assert(!/chatgpt/i.test(h),`forbidden product attribution ${p}`);
}
assert(!/chatgpt/i.test(read('README.md')),'forbidden product attribution README');
assert(read('index.html').includes('€14.075M')&&read('index.html').includes('€60.150M')&&read('index.html').includes('€78.5M'),'homepage valuation layers');
assert(read('valuation.html').includes('€47.1M–€138.3M')&&read('valuation.html').includes('23.4%')&&read('valuation.html').includes('17.9%'),'valuation scenario display');
assert(read('portfolio.html').includes('Commercial-potential classes'),'portfolio potential explanation');
assert(!read('transaction.html').includes('Product-family acquisition'),'family is not transaction unit');

const projectRoot=path.join(root,'projects');
const actual=new Set(fs.readdirSync(projectRoot,{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>x.name));
assert(actual.size===79,'project directory count');
assert(!actual.has('research-orchestrator'),'retired project route removed');
for(const slug of activeSlugs){
  assert(actual.has(slug),`missing ${slug}`);
  const h=read(`projects/${slug}/index.html`);
  assert(h.includes('../../assets/im.js?v=im18'),`IM18 runtime ${slug}`);
  assert(h.includes('../../assets/im4.css?v=im18'),`IM18 stylesheet ${slug}`);
  assert(h.includes('Standalone IP Asset')&&!h.includes('noindex'),`standalone profile shell ${slug}`);
}

const locs=[...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);
assert(locs.length===85&&new Set(locs).size===85,'sitemap URL count');
assert(locs.includes('https://thearchitect-max.github.io/MyProjects/valuation.html'),'valuation sitemap route');
assert(!locs.some(x=>x.includes('/projects/research-orchestrator/')),'retired sitemap route');
for(const slug of activeSlugs)assert(locs.includes(`https://thearchitect-max.github.io/MyProjects/projects/${slug}/`),`sitemap ${slug}`);

new vm.Script(read('assets/im.js'));
assert(read('assets/im.js').includes("VERSION='im18'"),'runtime version');
assert(read('assets/im.js').includes('askToReplacement'),'runtime cost positioning');
assert(read('assets/im.js').includes('POTENTIAL_CONTEXT'),'runtime potential context');
assert(!/chatgpt/i.test(read('assets/im.js')),'forbidden product attribution runtime');
assert(!exists('.github/workflows'),'Actions prohibited');
assert(!exists('evidence'),'public evidence prohibited');

console.log(JSON.stringify({
  technologyIpPortfolio:true,
  presentationRelease:'IM18',
  standaloneActiveAssets:79,
  individuallyReferencedAssets:79,
  pendingValuations:0,
  classificationFamilies:12,
  familyIsTransactionUnit:false,
  askingReferenceEUR:ask,
  askingRangeEUR:[low,high],
  recreationCostEUR:replacement,
  askingAsShareOfReplacement:Number((ask/replacement).toFixed(4)),
  strategicPotentialScenarioEUR:{low:calcLow,base:calcBase,high:calcHigh},
  askingAsShareOfBasePotential:Number((ask/calcBase).toFixed(4)),
  averageBasePotentialPerAssetEUR:valuation.strategicPotentialScenarioEUR.averageBaseExpectationPerAsset,
  stageCounts:{developedSoftware:41,developedPrototype:32,researchStage:6},
  potentialCounts:{veryHigh:16,high:40,moderate:13,specialist:10},
  referenceFrameworkCount:valuation.referenceFrameworks.length,
  sitemapUrls:85,
  githubActions:false
},null,2));
